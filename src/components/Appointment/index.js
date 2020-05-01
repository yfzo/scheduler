import React from "react";
import useVisualMode from "../../hooks/useVisualMode";

import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import Form from "./Form";
import Status from "./Status";
import Confirm from "./Confirm";

import "components/Appointment/styles.scss";

const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const SAVING = "SAVING";
const CONFIRM = "CONFIRM";
const EDIT = "EDIT";

export default function Appointment(props) {
  const { mode, transition, back } = useVisualMode(
    props.interview ? SHOW : EMPTY
  );

  const message = "Are you sure you would like to delete?";

  function onAdd() {
    transition(CREATE);
  }

  function save(name, interviewer) {
    const interview = {
      student: name,
      interviewer: interviewer,
    };

    transition(SAVING);
    props.bookInterview(props.id, interview).then(() => transition(SHOW));
  }

  function onConfirm() {
    transition(SAVING);
    props.cancelInterview(props.id).then(() => transition(EMPTY));
  }

  function onDelete() {
    transition(CONFIRM);
  }

  function onEdit() {
    transition(EDIT);
  }

  return (
    <article className="appointment">
      <Header time={props.time} />
      {mode === EMPTY && <Empty onAdd={onAdd} />}
      {mode === SHOW && (
        <Show
          student={props.interview.student}
          interviewer={props.interview.interviewer}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      )}
      {mode === CREATE && (
        <Form interviewers={props.interviewers} onCancel={back} onSave={save} />
      )}
      {mode === SAVING && <Status />}
      {mode === CONFIRM && (
        <Confirm message={message} onCancel={back} onConfirm={onConfirm} />
      )}
      {mode === EDIT && (
        <Form
          interviewers={props.interviewers}
          name={props.interview.student}
          interviewer={props.interview.interviewer}
          onCancel={back}
          onSave={save}
        />
      )}
    </article>
  );
}
