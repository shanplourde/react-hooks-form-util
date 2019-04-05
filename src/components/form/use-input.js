import { useState } from "react";

const getInputValue = ({ type, checked, value, options }) => {
  if (type === "checkbox") return checked;
  if (type === "select-multiple")
    return [...options]
      .map(option => ({
        value: option.value,
        selected: option.selected
      }))
      .filter(option => option.selected)
      .map(option => option.value);
  if (type === "radio") {
    if (checked) return value;
    return undefined;
  }
  return value;
};

export const useInput = ({ id, value, props = {} }) => {
  const [inputValue, setInputValue] = useState(value);
  const [originalValue] = useState(value);
  const [visited, setVisited] = useState(false);

  const getSharedProps = () => ({
    id,
    ...props,
    onChange: (event, inputValue) => {
      const val = inputValue || getInputValue(event.target);
      setInputValue(val);
      props.onChange && props.onChange(id, val);
    },
    onBlur: (event, inputValue) => {
      const value = inputValue || getInputValue(event.target);
      props.onBlur && props.onBlur({ event, id, value });
    },
    onFocus: evt => {
      setVisited(true);
    }
  });

  const getInputProps = inputProps => ({
    ...getSharedProps(),
    value: value,
    ...(typeof inputProps === "function" ? inputProps(props) : inputProps)
  });

  const getCheckProps = inputProps => ({
    ...getSharedProps(),
    checked: value,
    ...(typeof inputProps === "function" ? inputProps(props) : inputProps)
  });

  return {
    id,
    value: inputValue,
    api: {
      setValue: val => {
        setInputValue(val);
        props.onChange && props.onChange(id, val);
      }
    },
    uiState: {
      visited,
      pristine: inputValue === originalValue
    },
    getInputProps,
    getCheckProps
  };
};
