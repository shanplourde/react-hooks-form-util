import { useState } from "react";

export const useInput = ({ name, value, props = {} }) => {
  const [inputValue, setInputValue] = useState(value);
  const [originalValue] = useState(value);
  const [visited, setVisited] = useState(false);

  const getInputProps = () => ({
    id: name,
    value: inputValue,
    ...props,
    onChange: event => {
      const val = event.target.value;
      setInputValue(val);
      props.onChange && props.onChange(name, val);
    },
    onBlur: event => {
      const val = event.target.value;
      props.onBlur && props.onBlur(name, val);
    },
    onFocus: evt => {
      setVisited(true);
    }
  });

  return {
    id: name,
    value: inputValue,
    api: {
      setValue: val => {
        setInputValue(val);
      }
    },
    uiState: {
      visited,
      pristine: inputValue === originalValue
    },
    getInputProps
  };
};
