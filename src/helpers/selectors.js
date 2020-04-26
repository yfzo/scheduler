export function getAppointmentsForDay(state, day) {
  const appointmentsForDay = [];
  const selectedDay = state.days.find((d) => d.name === day);

  if (selectedDay) {
    for (const id of selectedDay.appointments) {
      appointmentsForDay.push(state.appointments[id.toString()]);
    }
  }

  return appointmentsForDay;
}

export function getInterview(state, interview) {
  if (interview) {
    const interviewer = state.interviewers[interview.interviewer.toString()];

    return ({
      ...interview,
      interviewer
    })
  }

  return null;
}