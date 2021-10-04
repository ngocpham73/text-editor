import React from "react";

const Button = (props) => {
  return (
    <button name={props.name} onClick={props.handleClick}>
      {props.sign}
    </button>
  );
};
export default Button;
