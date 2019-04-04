import React from "react";
import DayPicker from "react-day-picker";
import "react-day-picker/lib/style.css";

export class DatePicker extends React.Component {
  handleOnDayClick = (value, modifiers, event) => {
    console.log("custom change code...");
    this.props.onChange && this.props.onChange(event, value);
  };
  handleOnBlur = event => {
    console.log("custom blur code...");
    this.props.onBlur && this.props.onBlur(event, this.props.value);
  };
  handleOnFocus = event => {
    console.log("custom focus code...");
    this.props.onFocus && this.props.onFocus(event);
  };

  render() {
    const { value } = this.props;

    return (
      <React.Fragment>
        <DayPicker
          onDayClick={this.handleOnDayClick}
          {...this.props}
          onBlur={this.handleOnBlur}
          onFocus={this.handleOnFocus}
        />
        {value && <p>You clicked {value.toLocaleDateString()}</p>}
      </React.Fragment>
    );
  }
}
