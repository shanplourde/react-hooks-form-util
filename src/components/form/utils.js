export const debounce = (fn, time) => {
  let timeout;
  let context = this;

  return (...args) => {
    const functionCall = () => fn.apply(context, args);

    clearTimeout(timeout);
    timeout = setTimeout(functionCall, time);
  };
};
