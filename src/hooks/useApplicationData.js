import { useReducer, useEffect } from "react";
import axios from "axios";

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";

export default function useApplicationData() {
  const [state, dispatch] = useReducer(reducer, {
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {},
  });

  function reducer(state, action) {
    switch (action.type) {
      case SET_DAY:
        return {
          ...state,
          day: action.value,
        };
      case SET_APPLICATION_DATA: {
        return {
          ...state,
          ...action.value,
        };
      }
      case SET_INTERVIEW: {
        // Must refer to state.appointments here since it cannot be done in useEffect ATM
        const appointments = {
          ...state.appointments,
          [action.id]: {
            ...state.appointments[action.id],
            interview: action.value[action.id].interview,
          }
        };

        const days = state.days.map((day) => {
          if (day.appointments.includes(action.id)) {
            let spots = 5;

            for (let appointment of day.appointments) {
              if (appointments[appointment.toString()].interview) {
                spots--;
              }
            }

            return { ...day, spots };
          }

          return day;
        });

        return {
          ...state,
          appointments,
          days,
        };
      }
      default:
        throw new Error(
          `Tried to reduce with unsupported action type: ${action.type}`
        );
    }
  }

  const setDay = (day) => dispatch({ type: SET_DAY, value: day });

  useEffect(() => {
    const socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    socket.onopen = (event) => socket.send("ping");

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

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === SET_INTERVIEW) {
        const appointment = {
          [msg.id]: { interview: msg.interview },
        };

        dispatch({
          type: SET_INTERVIEW,
          value: appointment,
          id: msg.id,
        });
      }
    };

    return () => {
      socket.close();
    };
  }, []);

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
