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

export const createInput = ({ id, value, props = {} }) => {
  const getSharedProps = () => ({
    id,
    ...props,
    onChange: (event, inputValue) => {
      const value = inputValue || getInputValue(event.target);
      props.onChange && props.onChange({ event, id, value });
    },
    onBlur: (event, inputValue) => {
      const value = inputValue || getInputValue(event.target);
      props.onBlur && props.onBlur({ event, id, value });
    },
    onFocus: evt => {
      props.onFocus && props.onFocus({ evt, id, value });
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
    value,
    getInputProps,
    getCheckProps
  };
};
