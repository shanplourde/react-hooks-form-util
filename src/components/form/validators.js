export const constants = {
  undetermined: "undetermined"
};

export const validateInputEvents = {
  onBlur: 0,
  onChange: 1,
  onSubmit: 2
};

export const runValidators = async ({
  field,
  validators,
  eventType,
  value,
  inputValues,
  validationSchema
}) => {
  const validationResults = [];
  let isValid = true;
  const filteredValidators = validators.filter(validator => {
    return validator.when.some(
      whenItem =>
        whenItem === eventType ||
        (typeof whenItem === "object" && whenItem.eventType === eventType)
    );
  });
  for (let i = 0; i < filteredValidators.length; i++) {
    const validator = filteredValidators[i];
    if (isValid) {
      const validationResult = await validator.validate({
        value,
        inputValues,
        validationSchema
      });
      if (!validationResult.valid && !validationResult.undeterminedValidation)
        isValid = false;
      validationResults.push(validationResult);
    }
  }
  const validationErrors = validationResults.filter(
    result => !result.valid && !result.undeterminedValidation
  );
  const undeterminedValidations = validationResults
    .filter(
      result =>
        result.undeterminedValidation &&
        result.undeterminedValidation.length > 0
    )
    .map(validation => ({
      error: validation.undeterminedValidation,
      additional: validation.additional
    }));
  const undetermined =
    undeterminedValidations.length === 0
      ? null
      : {
          undeterminedValidations
        };

  if (validationErrors.length === 0)
    return { field, valid: true, ...undetermined };
  return {
    field,
    valid: false,
    errors: validationErrors.map(error => error.error),
    ...undetermined
  };
};

/**
 * Returns a new validator definition
 * @param {*} validateFn - validation function. Receives
 *        ({ value, inputValues, validationSchema })
 * @param {*} error - Error constant if validation fails
 *            Readable copy would be provided by application
 */
export const createValidator = ({ validateFn, error = "ERROR_KEY" }) => {
  return {
    validate: async ({ value, inputValues, validationSchema }) => {
      try {
        const isValid = await validateFn({
          value,
          inputValues,
          validationSchema
        });
        if (typeof isValid === "boolean" && isValid) {
          return { valid: true };
        }
        return { valid: false, error };
      } catch (e) {
        return {
          undeterminedValidation: error,
          additional: e
        };
      }
    }
  };
};

const validators = {};

/**
 * A required field validator
 */
validators.required = createValidator({
  validateFn: ({ value, inputValues }) =>
    (value !== null &&
      value !== undefined &&
      (typeof value === "object" && value.length === undefined)) ||
    (value || "").length > 0,
  error: "REQUIRED"
});

/**
 * Useful for validating stuff like checkboxes
 */
validators.mustBeTrue = createValidator({
  validateFn: ({ value, inputValues }) =>
    value !== null && value !== undefined && value === true,
  error: "MUST_BE_TRUE"
});

/**
 * An email validator
 */
validators.email = createValidator({
  validateFn: ({ value, inputValues }) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !value || re.test(String(value).toLowerCase());
  },
  error: "INVALID_EMAIL"
});

/**
 * A schema validator if using yup-based schema validation
 */
validators.schema = createValidator({
  validateFn: async ({ value, validationSchema }) => {
    if (!validationSchema || !validationSchema.validate) return true;
    try {
      await validationSchema.validate(value);
      return true;
    } catch (e) {
      return false;
    }
  },
  error: "INVALID_SCHEMA"
});

const evaluateConditions = {};

evaluateConditions.rewardEarlyValidateLate = ({
  id,
  inputValues,
  formValidity
}) => {
  return (
    typeof formValidity[id] !== "undefined" && formValidity[id].valid !== true
  );
};

export { validators };
export { evaluateConditions };
