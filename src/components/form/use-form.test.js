import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { useForm } from "./use-form";
import * as yup from "yup";
import {
  validators,
  createValidator,
  validateInputEvents,
  evaluateConditions
} from "./validators";
const { required, email, schema } = validators;
const noop = () => {};

beforeEach(() => {
  jest.useFakeTimers();
});

describe("useForm hook tests", () => {
  afterEach(cleanup);

  it("should return id and initial state", () => {
    const { result } = renderHook(() =>
      useForm({ id: "test", initialState: { foo: "bar" } })
    );
    const { id, inputValues } = result.current;

    expect(id).toEqual("test");
    expect(inputValues).toEqual({ foo: "bar" });
  });

  it("should return empty form props and form state", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { getFormProps, inputValues, api } = result.current;

    expect(getFormProps).toBeDefined();
    expect(getFormProps().onSubmit).toBeDefined();
    expect(inputValues).toEqual({});
    expect(api).toBeDefined();
  });

  it("should return an initial uiState", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { uiState } = result.current;

    expect(uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
  });

  it("should support custom form props", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { getFormProps } = result.current;
    const formProps = getFormProps({ foo: "bar" });

    expect(formProps.foo).toEqual("bar");
  });

  it("should support custom onSubmit", async () => {
    const { waitForNextUpdate, result } = renderHook(() =>
      useForm({ id: "test" })
    );
    const onSubmit = jest.fn();
    const formProps = result.current.getFormProps({ onSubmit });

    expect(formProps.onSubmit).toBeDefined();
    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    await act(() => formProps.onSubmit({ preventDefault: noop }));
    await waitForNextUpdate();
    await waitForNextUpdate();
    expect(onSubmit).toHaveBeenCalled();
    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
  });

  it("should support async onSubmit", async () => {
    const { waitForNextUpdate, result } = renderHook(() =>
      useForm({ id: "test" })
    );
    const { getFormProps, uiState } = result.current;

    const onSubmit = evt =>
      new Promise(r => {
        setTimeout(() => {
          r();
        }, 100);
      });

    const formProps = getFormProps({ onSubmit });

    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    await act(() => formProps.onSubmit({ preventDefault: noop }));
    await act(async () => await waitForNextUpdate());
    expect(result.current.uiState).toEqual({
      isSubmitting: true,
      isValid: true,
      isValidating: false
    });
    act(() => jest.runAllTimers());
    await waitForNextUpdate();
    expect(uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
  });

  it("should gracefully handle onSubmit errors", async () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { getFormProps, uiState } = result.current;
    const onSubmit = evt => new Error();
    const formProps = getFormProps({ onSubmit });

    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    await act(() => {
      formProps.onSubmit({ preventDefault: noop });
    });
    expect(uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
  });

  it("should gracefully handle async onSubmit errors", async () => {
    const { waitForNextUpdate, result } = renderHook(() =>
      useForm({ id: "test" })
    );
    const onSubmit = evt =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject("Error");
        }, 1);
      });
    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    await act(() => {
      result.current
        .getFormProps({ onSubmit })
        .onSubmit({ preventDefault: noop });
    });
    await act(async () => await waitForNextUpdate());

    expect(result.current.uiState).toEqual({
      isSubmitting: true,
      isValid: true,
      isValidating: false
    });
    act(() => jest.runAllTimers());
    await waitForNextUpdate();
    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
  });
});

describe("useForm input tests", () => {
  afterEach(cleanup);

  it("should be able to add inputs", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { api } = result.current;

    act(() => {
      api.addInput({ id: "test", value: "123" });
    });
    expect(result.current.inputValues).toEqual({ test: "123" });
    expect(result.current.inputUiState).toEqual({
      test: { pristine: true, visited: false }
    });
    expect(result.current.formValidity).toEqual({});
    expect(result.current.inputs.test).toBeDefined();
  });

  it("should be able to add input and get props", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { api } = result.current;
    act(() => {
      api.addInput({ id: "test", value: "123" });
    });
    const inputProps = result.current.inputs.test.getInputProps();

    expect(inputProps.id).toEqual("test");
    expect(inputProps.value).toEqual("123");
  });

  it("should be able to add multiple inputs", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { api } = result.current;
    act(() => {
      api.addInput({ id: "test", value: "123" });
    });

    act(() => {
      api.addInput({ id: "secondtest", value: "234" });
    });

    expect(result.current.inputValues).toEqual({
      secondtest: "234",
      test: "123"
    });
  });

  it("should change visited state of input on focus", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { api } = result.current;

    act(() => {
      api.addInput({ id: "test", value: "123" });
    });
    expect(result.current.inputUiState).toEqual({
      test: { pristine: true, visited: false }
    });

    act(() => result.current.inputs.test.getInputProps().onFocus());
    expect(result.current.inputUiState).toEqual({
      test: { pristine: true, visited: true }
    });
  });

  it("should be able to remove inputs", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { api } = result.current;

    act(() => {
      api.addInput({ id: "test", value: "123" });
    });
    act(() => {
      api.addInput({ id: "secondtest", value: "234" });
    });

    act(() => {
      api.removeInput("test");
    });

    expect(result.current.inputValues).toEqual({ secondtest: "234" });
    expect(Object.entries(result.current.inputs).length).toEqual(1);
    expect(result.current.inputUiState).toEqual({
      secondtest: { pristine: true, visited: false }
    });
  });

  it("shouldn't break if attempting to remove an unknown input", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { api } = result.current;

    act(() => {
      api.addInput({ id: "test", value: "123" });
    });
    act(() => {
      api.addInput({ id: "secondtest", value: "234" });
    });

    act(() => {
      api.removeInput("doesn't exist");
    });

    expect(result.current.inputValues).toEqual({
      secondtest: "234",
      test: "123"
    });
    expect(Object.entries(result.current.inputs).length).toEqual(2);
    expect(result.current.inputUiState).toEqual({
      secondtest: { pristine: true, visited: false },
      test: { pristine: true, visited: false }
    });
  });

  it("c change pristine property when value changes", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { api } = result.current;

    act(() => {
      api.addInput({ id: "test", value: "a" });
    });
    expect(result.current.inputUiState).toEqual({
      test: { pristine: true, visited: false }
    });
    act(() =>
      result.current.inputs.test.getInputProps().onChange({
        target: { value: "234" }
      })
    );
    expect(result.current.inputUiState).toEqual({
      test: { pristine: false, visited: false }
    });
    act(() =>
      result.current.inputs.test.getInputProps().onChange({
        target: { value: "a" }
      })
    );
    expect(result.current.inputUiState).toEqual({
      test: { pristine: true, visited: false }
    });
  });
});

describe("useForm input validation tests", () => {
  afterEach(cleanup);

  it("should initialize validation state for inputs to valid regardless  of initial value", () => {
    const { result } = renderHook(() => useForm({ id: "test" }));
    const { api } = result.current;

    act(() => {
      api.addInput({ id: "test", value: "123" });
    });

    expect(result.current.formValidity).toEqual({});
  });

  it("should be able to add an input with valid asynchronous validation and get correct formValidity input state", async () => {
    const customValidator = createValidator({
      validateFn: async ({ value }) =>
        await new Promise(resolve => {
          setTimeout(() => resolve(true), 1);
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useForm({ id: "test" })
    );

    act(() => {
      result.current.api.addInput({
        id: "test",
        value: "",
        validators: [{ ...customValidator, when: [validateInputEvents.onBlur] }]
      });
    });
    act(
      async () =>
        await result.current.inputs.test.getInputProps().onBlur({
          preventDefault: noop,
          target: {
            value: ""
          }
        })
    );
    expect(result.current.formValidity).toEqual({
      test: { isValidating: true, value: "" }
    });

    act(() => jest.runAllTimers());
    await waitForNextUpdate();

    expect(result.current.formValidity).toEqual({
      test: { field: "test", valid: true }
    });
  });

  it("should be able to add an input with invalid asynchronous validation and get correct formValidity input state", async () => {
    const customValidator = createValidator({
      validateFn: async ({ value }) =>
        await new Promise(resolve => {
          setTimeout(() => resolve(false), 1);
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useForm({ id: "test" })
    );

    act(() => {
      result.current.api.addInput({
        id: "test",
        value: "",
        validators: [{ ...customValidator, when: [validateInputEvents.onBlur] }]
      });
    });
    act(
      async () =>
        await result.current.inputs.test.getInputProps().onBlur({
          preventDefault: noop,
          target: {
            value: ""
          }
        })
    );
    expect(result.current.formValidity).toEqual({
      test: { isValidating: true, value: "" }
    });

    act(() => jest.runAllTimers());
    await waitForNextUpdate();

    expect(result.current.formValidity).toEqual({
      test: { errors: ["CUSTOM_ASYNC_ERROR"], field: "test", valid: false }
    });
  });

  it("should be able to add inputs with invalid values and submit", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useForm({ id: "test" })
    );

    act(() => {
      result.current.api.addInput({
        id: "test",
        value: "",
        validators: [
          {
            ...required,
            when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
          }
        ]
      });
    });
    act(() => {
      result.current.api.addInput({
        id: "last",
        value: "",
        validators: [
          {
            ...required,
            when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
          }
        ]
      });
    });
    await act(() => {
      result.current.getFormProps().onSubmit({ preventDefault: noop });
    });
    await waitForNextUpdate();
    act(() => jest.runAllTimers());
    await waitForNextUpdate();

    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: false,
      isValidating: false
    });
    expect(result.current.formValidity).toEqual({
      last: { errors: ["REQUIRED"], field: "last", valid: false },
      test: { errors: ["REQUIRED"], field: "test", valid: false }
    });
  });

  it("should be able to define a schema and validate form on submit", async () => {
    const contactSchema = yup.object({
      firstName: yup
        .string()
        .required()
        .min(3),
      lastName: yup
        .string()
        .required()
        .min(10),
      email: yup
        .string()
        .email()
        .required()
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useForm({ id: "test", validationSchema: contactSchema })
    );

    act(() => {
      result.current.api.addInput({
        id: "firstName",
        value: "X",
        validators: [
          {
            ...schema,
            when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
          }
        ]
      });
    });
    act(() => {
      result.current.api.addInput({
        id: "lastName",
        value: "ValidLastName",
        validators: [
          {
            ...schema,
            when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
          }
        ]
      });
    });
    act(() => {
      result.current.api.addInput({
        id: "email",
        value: "invalid",
        validators: [
          {
            ...schema,
            when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
          }
        ]
      });
    });
    await act(() => {
      result.current.getFormProps().onSubmit({ preventDefault: noop });
    });
    await waitForNextUpdate();
    act(() => jest.runAllTimers());
    await waitForNextUpdate();

    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: false,
      isValidating: false
    });
    expect(result.current.formValidity).toEqual({
      email: { errors: ["INVALID_SCHEMA"], field: "email", valid: false },
      firstName: {
        errors: ["INVALID_SCHEMA"],
        field: "firstName",
        valid: false
      },
      lastName: { field: "lastName", valid: true }
    });
  });

  it("should be able to add inputs with valid values and submit", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useForm({ id: "test" })
    );

    act(() => {
      result.current.api.addInput({
        id: "test",
        value: "abc",
        validators: [
          {
            ...required,
            when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
          }
        ]
      });
    });
    act(() => {
      result.current.api.addInput({
        id: "email",
        value: "george@ofthejungle.com",
        validators: [
          {
            ...email,
            when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
          }
        ]
      });
    });
    await act(() => {
      result.current.getFormProps().onSubmit({ preventDefault: noop });
    });
    await waitForNextUpdate();
    act(() => jest.runAllTimers());
    await waitForNextUpdate();

    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
    expect(result.current.formValidity).toEqual({
      email: { field: "email", valid: true },
      test: { field: "test", valid: true }
    });
  });

  it("Should only validate onSubmit validations on form submit, ignoring others such as onBlur", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useForm({ id: "test" })
    );

    act(() => {
      result.current.api.addInput({
        id: "test",
        value: "abc",
        validators: [{ ...required, when: [validateInputEvents.onBlur] }]
      });
    });
    await act(() => {
      result.current.getFormProps().onSubmit({ preventDefault: noop });
    });
    act(() => jest.runAllTimers());
    await waitForNextUpdate();

    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
    expect(result.current.formValidity).toEqual({
      test: { field: "test", valid: true }
    });
  });

  it("should set validations that raise errors as undetermined", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useForm({ id: "test" })
    );

    const expectedError = "oh no";

    const customValidator = createValidator({
      validateFn: ({ value }) =>
        new Promise((resolve, reject) => {
          reject(expectedError);
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });

    act(() => {
      result.current.api.addInput({
        id: "test",
        value: "abc",
        validators: [
          {
            ...required,
            when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
          }
        ]
      });
      result.current.api.addInput({
        id: "email",
        value: "george@ofthejungle.com",
        validators: [
          {
            ...customValidator,
            when: [validateInputEvents.onBlur, validateInputEvents.onSubmit]
          }
        ]
      });
    });
    await act(() => {
      result.current.getFormProps().onSubmit({ preventDefault: noop });
    });
    // await waitForNextUpdate();
    act(() => jest.runAllTimers());
    await waitForNextUpdate();

    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
    expect(result.current.formValidity).toEqual({
      email: {
        field: "email",
        undeterminedValidations: [
          {
            additional: expectedError,
            error: "CUSTOM_ASYNC_ERROR"
          }
        ],
        valid: true
      },
      test: { field: "test", valid: true }
    });
  });

  it("Should only process latest asynchronous validations on a given input", async () => {
    const customValidator = createValidator({
      validateFn: async ({ value }) =>
        await new Promise(resolve => {
          setTimeout(() => resolve(value.length > 2), 100);
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useForm({ id: "test" })
    );

    act(() => {
      result.current.api.addInput({
        id: "test",
        value: "12",
        validators: [{ ...customValidator, when: [validateInputEvents.onBlur] }]
      });
    });
    act(
      async () =>
        await result.current.inputs.test.getInputProps().onBlur(
          {
            preventDefault: noop,
            target: {
              value: "12"
            }
          },
          "12"
        )
    );
    act(() => jest.advanceTimersByTime(50));
    expect(result.current.formValidity).toEqual({
      test: { isValidating: true, value: "12" }
    });

    act(
      async () =>
        await result.current.inputs.test.getInputProps().onBlur(
          {
            preventDefault: noop,
            target: {
              value: "1234"
            }
          },
          "1234"
        )
    );

    act(() => jest.advanceTimersByTime(50));
    expect(result.current.formValidity).toEqual({
      test: { isValidating: true, value: "1234" }
    });

    act(() => jest.runAllTimers());
    await waitForNextUpdate();
    expect(result.current.formValidity).toEqual({
      test: { field: "test", valid: true }
    });
  });

  it("should validate input when evaluateCondition.rewardEarlyValidateLate is set and input current state is not valid", async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useForm({ id: "test" })
    );
    act(() => {
      result.current.api.addInput({
        id: "test",
        value: "",
        validators: [
          {
            ...required,
            when: [
              validateInputEvents.onBlur,
              {
                eventType: validateInputEvents.onChange,
                evaluateCondition: evaluateConditions.rewardEarlyValidateLate
              }
            ]
          }
        ]
      });
    });
    act(() => {
      result.current.inputs.test.getInputProps().onBlur({
        preventDefault: noop,
        target: {
          value: ""
        }
      });
    });
    await waitForNextUpdate();
    act(async () => {
      await result.current.inputs.test.getInputProps().onChange({
        target: { value: "234" }
      });
    });
    expect(result.current.formValidity).toEqual({
      test: { errors: ["REQUIRED"], field: "test", valid: false }
    });
  });
});
