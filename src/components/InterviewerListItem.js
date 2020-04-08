import React from "react";
import classNames from "classnames";

import "components/InterviewerListItem.scss";

export default function InterviewerListItem(props) {
  let interviewerClass = classNames("interviewers__item", {
    "interviewers__item--selected": props.selected
  });

  let imageClass = classNames("interviewers__item-image");

  return (
    <li
      onClick={props.setInterviewer}
      className={interviewerClass}
    >
      <img className={imageClass} src={props.avatar} alt={props.name} />
      {props.selected && props.name}
    </li>
  );
}
