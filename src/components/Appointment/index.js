import React, { useState } from "react";
import useVisualMode from "../../hooks/useVisualMode";

import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import Form from "./Form";
import Status from "./Status";
import Confirm from "./Confirm";
import Error from "./Error";

import "components/Appointment/styles.scss";

const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const SAVING = "SAVING";
const DELETING = "DELETING";
const CONFIRM = "CONFIRM";
const EDIT = "EDIT";
const ERROR_SAVE = "ERROR_SAVE";
const ERROR_DELETE = "ERROR_DELETE";

export default function Appointment(props) {
  const { mode, transition, back } = useVisualMode(
    props.interview ? SHOW : EMPTY
  );

  const [message, setMessage] = useState("");

  function onAdd() {
    transition(CREATE);
  }

  function save(name, interviewer) {
    const interview = {
      student: name,
      interviewer,
    };

    setMessage("Saving");

    transition(SAVING);

    props
      .bookInterview(props.id, interview)
      .then(() => transition(SHOW))
      .catch(error => {
        setMessage("There was an error while saving");
        transition(ERROR_SAVE, true);
      });
  }

  function onConfirm() {
    setMessage("Deleting");

    transition(DELETING, true);

    props.cancelInterview(props.id).then(() => transition(EMPTY))
    .catch(error => {
      setMessage("There was an error while deleting");
      transition(ERROR_DELETE, true);
    });
  }

  function onDelete() {
    setMessage("Are you sure you would like to delete?");

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
      {(mode === SAVING || mode === DELETING) && <Status message={message} />}
      {mode === CONFIRM && (
        <Confirm message={message} onCancel={back} onConfirm={onConfirm} />
      )}
      {mode === EDIT && (
        <Form
          interviewers={props.interviewers}
          name={props.interview.student}
          interviewer={props.interview.interviewer.id}
          onCancel={back}
          onSave={save}
        />
      )}
      {(mode === ERROR_SAVE || mode === ERROR_DELETE) && <Error message={message} onClose={back} />}
    </article>
  );
}
