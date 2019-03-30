const defaultAriaProps = { "aria-invalid": isValid => !isValid };

/**
 * Returns a new validator definition
 * @param {*} validateFn - validation function. Receives
 *        value
 * @param {*} when - array of strings representing
 *            callbacks when validation should run.
 *            Currently supports onBlur and onSubmit
 * @param {*} error - Error constant if validation fails
 *            Readable copy would be provided by application
 * @param {*} ariaProps - Array of aria props which can
 *            by used by form creator
 */
export const createValidator = ({
  validateFn,
  // when = ["onBlur", "onSubmit"],
  error = "ERROR_KEY"
  // ariaProps = []
}) => {
  return {
    validate: async text => {
      const isValid = await validateFn(text);
      // const consolidatedAriaKeys = { ...defaultAriaProps, ...ariaProps };
      // const ariaPropsMapped = Object.keys({
      //   ...defaultAriaProps,
      //   ...ariaProps
      // }).reduce((acc, val) => {
      //   const key = val;
      //   acc[key] = consolidatedAriaKeys[key](isValid);
      //   return acc;
      // }, {});
      if (isValid) {
        return { valid: true }; //, ariaProps: ariaPropsMapped };
      } else {
        return { valid: false, error }; //, ariaProps: ariaPropsMapped };
      }
    }
    // when,
    // ariaProps
  };
};

/**
 * A required field validator that fires on blur and submit
 */
export const required = createValidator({
  validateFn: text => (text || "").length > 0,
  // when: ["onBlur", "onSubmit"],
  error: "REQUIRED"
  // ariaProps: {
  //   "aria-required": () => true,
  //   "aria-invalid": isValid => !isValid
  // }
});

/**
 * An email validator that fires on blur and submit
 */
export const email = createValidator({
  validateFn: text => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !text || re.test(String(text).toLowerCase());
  },
  // when: ["onBlur", "onSubmit"],
  error: "INVALID_EMAIL"
  // ariaProps: { "aria-invalid": isValid => !isValid }
});
