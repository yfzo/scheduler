import { useReducer, useEffect, useRef } from "react";
import axios from "axios";
import reducer, { SET_DAY, SET_APPLICATION_DATA, SET_INTERVIEW } from "reducers/application";

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  const setDay = (day) => dispatch({ type: SET_DAY, value: day });
  const socket = useRef(null);

  useEffect(() => {
    socket.current = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    socket.current.onopen = () => socket.current.send("ping");

    Promise.all([
      Promise.resolve(
        axios.get("http://localhost:8001/api/days")
      ),
      Promise.resolve(
        axios.get("http://localhost:8001/api/appointments")
      ),
      Promise.resolve(
        axios.get("http://localhost:8001/api/interviewers")
      ),
    ])
      .then((all) => {
        const [days, appointments, interviewers] = all;

        dispatch({
          type: SET_APPLICATION_DATA,
          value: {
            days: days.data,
            appointments: appointments.data,
            interviewers: interviewers.data,
          },
        });
      })

    return () => {
      socket.current.close();
    };
  }, []);

  useEffect(() => {
    if (!socket.current) return;

    socket.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === SET_INTERVIEW) {
        const appointment = {
          ...state.appointments[msg.id],
          interview: msg.interview
        }

        const appointments = {
          ...state.appointments,
          [msg.id]: appointment
        }

        dispatch({
          type: SET_INTERVIEW,
          value: appointments,
          id: msg.id,
        });
      }
    };
  })

  function bookInterview(id, interview) {
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview },
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };

    return axios
      .put(`http://localhost:8001/api/appointments/${id}`, appointment)
      .then(() => {
        dispatch({
          type: SET_INTERVIEW,
          value: appointments,
          id: id,
        });
      });
  }

  function cancelInterview(id) {
    const appointment = {
      ...state.appointments[id],
      interview: null,
    };

    const appointments = {
      ...state.appointments,
      [id]: appointment,
    };

    return axios
      .delete(`http://localhost:8001/api/appointments/${id}`)
      .then(() => {
        dispatch({
          type: SET_INTERVIEW,
          value: appointments,
          id: id,
        });
      });
  }

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview,
  };
}
