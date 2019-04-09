import {
  createValidator,
  validators,
  runValidators,
  validateInputEvents
} from "./validators";

const { email, required, mustBeTrue } = validators;

describe("Email validator tests", () => {
  const testCases = [
    {
      input: "",
      expectedValue: { valid: true }
    },
    {
      input: null,
      expectedValue: { valid: true }
    },
    {
      input: undefined,
      expectedValue: { valid: true }
    },
    {
      input: "adfadsfdf",
      expectedValue: {
        error: "INVALID_EMAIL",
        valid: false
      }
    },
    {
      input: "asfasffaf@.",
      expectedValue: {
        error: "INVALID_EMAIL",
        valid: false
      }
    },
    {
      input: "asfafaff.@com",
      expectedValue: {
        error: "INVALID_EMAIL",
        valid: false
      }
    },
    {
      input: "asfafaff@com.a",
      expectedValue: {
        error: "INVALID_EMAIL",
        valid: false
      }
    },
    {
      input: "asfafaff@com.com",
      expectedValue: { valid: true }
    }
  ];

  testCases.forEach(testCase => {
    it(`Should pass for case ${testCase.input}`, async () => {
      expect(await email.validate({ value: testCase.input })).toEqual(
        testCase.expectedValue
      );
    });
  });
});

describe("Required validator tests", () => {
  const testCases = [
    {
      input: "",
      expectedValue: {
        error: "REQUIRED",
        valid: false
      }
    },
    {
      input: null,
      expectedValue: {
        error: "REQUIRED",
        valid: false
      }
    },
    {
      input: undefined,
      expectedValue: {
        error: "REQUIRED",
        valid: false
      }
    },
    {
      input: "a",
      expectedValue: {
        valid: true
      }
    }
  ];

  testCases.forEach(testCase => {
    it(`Should pass for case ${testCase.input}`, async () => {
      const result = await required.validate({ value: testCase.input });
      expect(result).toEqual(testCase.expectedValue);
    });
  });
});

describe("mustBeTrue validator tests", () => {
  const testCases = [
    {
      input: "",
      expectedValue: {
        error: "MUST_BE_TRUE",
        valid: false
      }
    },
    {
      input: null,
      expectedValue: {
        error: "MUST_BE_TRUE",
        valid: false
      }
    },
    {
      input: undefined,
      expectedValue: {
        error: "MUST_BE_TRUE",
        valid: false
      }
    },
    {
      input: "true",
      expectedValue: {
        error: "MUST_BE_TRUE",
        valid: false
      }
    },
    {
      input: true,
      expectedValue: {
        valid: true
      }
    },
    {
      input: false,
      expectedValue: {
        error: "MUST_BE_TRUE",
        valid: false
      }
    }
  ];

  testCases.forEach(testCase => {
    it(`Should pass for case ${testCase.input}`, async () => {
      const result = await mustBeTrue.validate({ value: testCase.input });
      // result.ariaProps = result.ariaProps.sort();
      // testCase.expectedValue.ariaProps = testCase.expectedValue.ariaProps.sort();
      expect(result).toEqual(testCase.expectedValue);
    });
  });
});

describe("Custom validator tests", () => {
  const customValidator = createValidator({
    validateFn: ({ value }) => (value || "").length > 2,
    error: "CUSTOM_ERROR"
  });

  const testCases = [
    {
      input: "",
      expectedValue: {
        valid: false,
        error: "CUSTOM_ERROR"
      }
    },
    {
      input: null,
      expectedValue: {
        valid: false,
        error: "CUSTOM_ERROR"
      }
    },
    {
      input: undefined,
      expectedValue: {
        valid: false,
        error: "CUSTOM_ERROR"
      }
    },
    {
      input: "a",
      expectedValue: {
        valid: false,
        error: "CUSTOM_ERROR"
      }
    },
    {
      input: "abc",
      expectedValue: { valid: true }
    }
  ];

  testCases.forEach(testCase => {
    it(`Should pass for case ${testCase.input}`, async () => {
      expect(await customValidator.validate({ value: testCase.input })).toEqual(
        testCase.expectedValue
      );
    });
  });

  it("Should be able to create a custom validator that can validate success across multiple form fields", async () => {
    const customValidator = createValidator({
      validateFn: ({ value, formValues }) =>
        (value || "").length > 2 && formValues.formField === "formFieldValue",
      error: "CUSTOM_ERROR"
    });

    const validators = [
      {
        ...customValidator,
        when: [validateInputEvents.onBlur]
      }
    ];
    const validationResults = await runValidators({
      field: "test",
      validators,
      eventType: validateInputEvents.onBlur,
      value: "abcd",
      formValues: {
        formField: "formFieldValue"
      }
    });
    expect(validationResults).toEqual({
      field: "test",
      valid: true
    });
  });

  it("Should be able to create a custom validator that can validate error across multiple form fields", async () => {
    const customValidator = createValidator({
      validateFn: ({ value, formValues }) =>
        (value || "").length > 2 && formValues.formField === "foo",
      error: "CUSTOM_ERROR"
    });

    const validators = [
      {
        ...customValidator,
        when: [validateInputEvents.onBlur]
      }
    ];
    const validationResults = await runValidators({
      field: "test",
      validators,
      eventType: validateInputEvents.onBlur,
      value: "abcd",
      formValues: {
        formField: "formFieldValue"
      }
    });
    expect(validationResults).toEqual({
      errors: ["CUSTOM_ERROR"],
      field: "test",
      valid: false
    });
  });
});

describe("createValidator tests", () => {
  it("Creates a validator with expected properties and functions", () => {
    const customValidator = createValidator({
      validateFn: ({ value }) => value && value.length > 2,
      error: "CUSTOM_ERROR"
    });
    expect(customValidator).toHaveProperty("validate");
  });
  it("Creates an async validator that passes various test cases", async () => {
    const customValidator = createValidator({
      validateFn: async ({ value }) =>
        await new Promise(resolve => {
          setTimeout(() => {
            resolve((value || "").length > 5);
          }, 0);
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });
    const testCases = [
      {
        input: "",
        expectedValue: {
          valid: false,
          error: "CUSTOM_ASYNC_ERROR"
        }
      },
      {
        input: null,
        expectedValue: {
          valid: false,
          error: "CUSTOM_ASYNC_ERROR"
        }
      },
      {
        input: undefined,
        expectedValue: {
          valid: false,
          error: "CUSTOM_ASYNC_ERROR"
        }
      },
      {
        input: "a",
        expectedValue: {
          valid: false,
          error: "CUSTOM_ASYNC_ERROR"
        }
      },
      {
        input: "abc",
        expectedValue: {
          valid: false,
          error: "CUSTOM_ASYNC_ERROR"
        }
      },
      {
        input: "abcefg",
        expectedValue: { valid: true }
      }
    ];
    testCases.forEach(async testCase => {
      // jest.runAllTimers();
      const result = await customValidator.validate({ value: testCase.input });
      // jest.runAllTimers();
      expect(result).toEqual(testCase.expectedValue);
    });
  });

  it("Gracefully handles async validators that reject", async () => {
    const customValidator = createValidator({
      validateFn: async ({ value }) =>
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            reject("Error");
          }, 0);
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });
    const result = await customValidator.validate({ value: "" });
    expect(result).toEqual({
      additional: "Error",
      undeterminedValidation: "CUSTOM_ASYNC_ERROR"
    });
  });
});

describe("runValidators tests", () => {
  it("Returns isValid true for single validation that passes", async () => {
    const validators = [
      {
        ...required,
        when: [validateInputEvents.onBlur]
      }
    ];
    const validationResults = await runValidators({
      validators,
      eventType: validateInputEvents.onBlur,
      value: "test"
    });
    expect(validationResults).toEqual({
      valid: true
    });
  });
  it("Returns isValid true for multiple validations, all pass", async () => {
    const validators = [
      {
        ...required,
        when: [validateInputEvents.onSubmit]
      },
      {
        ...email,
        when: [validateInputEvents.onSubmit]
      }
    ];
    const validationResults = await runValidators({
      validators,
      eventType: validateInputEvents.onSubmit,
      value: "test@test.com"
    });
    expect(validationResults).toEqual({
      valid: true
    });
  });
  it("Only validates an input's onBlur validations, ignoring onSubmit validations for the same input", async () => {
    const validators = [
      {
        ...required,
        when: [validateInputEvents.onBlur]
      },
      {
        ...email,
        when: [validateInputEvents.onSubmit]
      }
    ];
    const validationResults = await runValidators({
      validators,
      eventType: validateInputEvents.onBlur,
      value: "test"
    });
    expect(validationResults).toEqual({
      valid: true
    });
  });
  it("Only validates an input's onChange validations, ignoring onBlur validations for the same input", async () => {
    const customValidator = createValidator({
      validateFn: ({ value }) => (value || "").length > 10,
      error: "CUSTOM_ERROR"
    });
    const validators = [
      {
        ...customValidator,
        when: [validateInputEvents.onBlur]
      },
      {
        ...email,
        when: [validateInputEvents.onChange]
      }
    ];
    const validationResults = await runValidators({
      validators,
      eventType: validateInputEvents.onChange,
      value: "test"
    });
    expect(validationResults).toEqual({
      errors: ["INVALID_EMAIL"],
      field: undefined,
      valid: false
    });
  });
  it("Returns isValid false for multiple validations, any validation fails", async () => {
    const customValidator = createValidator({
      validateFn: ({ value }) => (value || "").length > 2,
      error: "CUSTOM_ERROR"
    });

    const validators = [
      {
        ...required,
        when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
      },
      {
        ...customValidator,
        when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
      }
    ];
    const validationResults = await runValidators({
      field: "test",
      validators,
      eventType: validateInputEvents.onBlur,
      value: ""
    });
    expect(validationResults).toEqual({
      errors: ["REQUIRED"],
      field: "test",
      valid: false
    });
  });
  it("Continues handling multiple-undetermined validations without stopping at the first one", async () => {
    const error1 = new Error("oh no1");
    const customValidator = createValidator({
      validateFn: ({ value }) => {
        throw error1;
      },
      error: "CUSTOM_ASYNC_ERROR"
    });
    const error2 = new Error("oh no2");
    const customValidator2 = createValidator({
      validateFn: ({ value }) => {
        throw error2;
      },
      error: "CUSTOM_ASYNC_ERROR_2"
    });
    const validators = [
      {
        ...required,
        when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
      },
      {
        ...customValidator,
        when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
      },
      {
        ...customValidator2,
        when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
      }
    ];
    const validationResults = await runValidators({
      field: "test",
      validators,
      eventType: validateInputEvents.onBlur,
      value: "a"
    });
    expect(validationResults).toEqual({
      field: "test",
      undeterminedValidations: [
        { additional: error1, error: "CUSTOM_ASYNC_ERROR" },
        { additional: error2, error: "CUSTOM_ASYNC_ERROR_2" }
      ],
      valid: true
    });
  });
});
