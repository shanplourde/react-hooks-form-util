import { createValidator, validators, runValidators } from "./validators";

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
      expect(await email.validate(testCase.input)).toEqual(
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
      const result = await required.validate(testCase.input);
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
      const result = await mustBeTrue.validate(testCase.input);
      // result.ariaProps = result.ariaProps.sort();
      // testCase.expectedValue.ariaProps = testCase.expectedValue.ariaProps.sort();
      expect(result).toEqual(testCase.expectedValue);
    });
  });
});

describe("Custom validator tests", () => {
  const customValidator = createValidator({
    validateFn: text => (text || "").length > 2,
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
      expect(await customValidator.validate(testCase.input)).toEqual(
        testCase.expectedValue
      );
    });
  });
});

describe("createValidator tests", () => {
  it("Creates a validator with expected properties and functions", () => {
    const customValidator = createValidator({
      validateFn: text => text && text.length > 2,
      error: "CUSTOM_ERROR"
    });
    expect(customValidator).toHaveProperty("validate");
  });
  it("Creates an async validator that passes various test cases", async () => {
    const customValidator = createValidator({
      validateFn: async text =>
        await new Promise(resolve => {
          setTimeout(() => {
            resolve((text || "").length > 5);
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
      const result = await customValidator.validate(testCase.input);
      // jest.runAllTimers();
      expect(result).toEqual(testCase.expectedValue);
    });
  });

  it("Gracefully handles async validators that reject", async () => {
    const customValidator = createValidator({
      validateFn: async text =>
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            reject("Error");
          }, 0);
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });
    const result = await customValidator.validate("");
    expect(result).toEqual({ undeterminedValidation: "CUSTOM_ASYNC_ERROR" });
  });
});

describe("runValidators tests", () => {
  it("Returns isValid true for single validation that passes", async () => {
    const validators = [{ ...required, when: ["onBlur", "onSubmit"] }];
    const validationResults = await runValidators({
      validators,
      eventType: "onBlur",
      value: "test"
    });
    expect(validationResults).toEqual({
      valid: true
    });
  });
  it("Returns isValid true for multiple validations, all pass", async () => {
    const validators = [
      { ...required, when: ["onBlur", "onSubmit"] },
      {
        ...email,
        when: ["onBlur", "onSubmit"]
      }
    ];
    const validationResults = await runValidators({
      validators,
      eventType: "onBlur",
      value: "test@test.com"
    });
    expect(validationResults).toEqual({
      valid: true
    });
  });
  it("Returns isValid false for multiple validations, any validation fails", async () => {
    const customValidator = createValidator({
      validateFn: text => (text || "").length > 2,
      error: "CUSTOM_ERROR"
    });

    const validators = [
      { ...required, when: ["onBlur", "onSubmit"] },
      {
        ...customValidator,
        when: ["onBlur", "onSubmit"]
      }
    ];
    const validationResults = await runValidators({
      field: "test",
      validators,
      eventType: "onBlur",
      value: ""
    });
    expect(validationResults).toEqual({
      errors: ["REQUIRED"],
      field: "test",
      valid: false
    });
  });
  it("Continues handling multiple-undetermined validations without stopping at the first one", async () => {
    const customValidator = createValidator({
      validateFn: text => {
        throw new Error("oh no");
      },
      error: "CUSTOM_ASYNC_ERROR"
    });
    const customValidator2 = createValidator({
      validateFn: text => {
        throw new Error("oh no");
      },
      error: "CUSTOM_ASYNC_ERROR_2"
    });
    const validators = [
      { ...required, when: ["onBlur", "onSubmit"] },
      {
        ...customValidator,
        when: ["onBlur", "onSubmit"]
      },
      {
        ...customValidator2,
        when: ["onBlur", "onSubmit"]
      }
    ];
    const validationResults = await runValidators({
      field: "test",
      validators,
      eventType: "onBlur",
      value: "a"
    });
    expect(validationResults).toEqual({
      field: "test",
      undeterminedValidations: ["CUSTOM_ASYNC_ERROR", "CUSTOM_ASYNC_ERROR_2"],
      valid: true
    });
  });
});
