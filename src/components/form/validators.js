export const constants = {
  undetermined: "undetermined"
};

export const runValidators = async ({
  field,
  validators,
  eventType,
  value
}) => {
  const validationResults = [];
  let isValid = true;
  const filteredValidators = validators.filter(validator => {
    return validator.when.some(whenItem => whenItem === eventType);
  });
  for (let i = 0; i < filteredValidators.length; i++) {
    const validator = filteredValidators[i];
    if (isValid) {
      const validationResult = await validator.validate(value);
      if (!validationResult.valid && !validationResult.undeterminedValidation)
        isValid = false;
      validationResults.push(validationResult); // validator.validate(value));
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
    .map(validation => validation.undeterminedValidation);
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
 *        value
 * @param {*} error - Error constant if validation fails
 *            Readable copy would be provided by application
 */
export const createValidator = ({ validateFn, error = "ERROR_KEY" }) => {
  return {
    validate: async text => {
      try {
        const isValid = await validateFn(text);
        if (typeof isValid === "boolean" && isValid) {
          return { valid: true };
        }
        return { valid: false, error };
      } catch {
        return { undeterminedValidation: error };
      }
    }
  };
};

const validators = {};
/**
 * A required field validator that fires on blur and submit
 */
validators.required = createValidator({
  validateFn: value =>
    (value !== null &&
      value !== undefined &&
      (typeof value === "object" && value.length === undefined)) ||
    (value || "").length > 0,
  error: "REQUIRED"
});

/**
 * Useful for checkboxes that must be checked
 */
validators.mustBeTrue = createValidator({
  validateFn: value => value !== null && value !== undefined && value === true,
  error: "MUST_BE_TRUE"
});

/**
 * An email validator that fires on blur and submit
 */
validators.email = createValidator({
  validateFn: text => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return !text || re.test(String(text).toLowerCase());
  },
  error: "INVALID_EMAIL"
});

export { validators };
