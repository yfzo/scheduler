export const SET_DAY = "SET_DAY";
export const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
export const SET_INTERVIEW = "SET_INTERVIEW";

export default function reducer(state, action) {
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
      const days = state.days.map((day) => {
        if (day.appointments.includes(action.id)) {
          let spots = 0;

          for (let appointment of day.appointments) {
            if (!action.value[appointment.toString()].interview) {
              spots++;
            }
          }

          return { ...day, spots };
        }

        return day;
      });

      return {
        ...state,
        appointments: action.value,
        days,
      };
    }
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}
