import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { useForm } from "./use-form";
import { required, email, createValidator } from "./validators";

const noop = () => {};

jest.useFakeTimers();

describe("useForm hook tests", () => {
  afterEach(cleanup);

  it("should return empty form props and form state", () => {
    const { result } = renderHook(() => useForm());
    const { getFormProps, formValues, api } = result.current;

    expect(getFormProps).toBeDefined();
    expect(getFormProps().onSubmit).toBeDefined();
    expect(formValues).toEqual({});
    expect(api).toBeDefined();
  });

  it("should return an initial uiState", () => {
    const { result } = renderHook(() => useForm());
    const { uiState } = result.current;

    expect(uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
  });

  it("should support custom form props", () => {
    const { result } = renderHook(() => useForm());
    const { getFormProps } = result.current;
    const formProps = getFormProps({ foo: "bar" });

    expect(formProps.foo).toEqual("bar");
  });

  it("should support custom onSubmit", async () => {
    const { waitForNextUpdate, result } = renderHook(() => useForm());
    const onSubmit = jest.fn();
    const formProps = result.current.getFormProps({ onSubmit });

    expect(formProps.onSubmit).toBeDefined();
    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    // act(async () => {
    renderHook(async () => await formProps.onSubmit({ preventDefault: noop }));
    await waitForNextUpdate();
    jest.runAllTimers();
    await waitForNextUpdate();
    expect(onSubmit).toHaveBeenCalled();
    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
  });

  it("should support async onSubmit", async () => {
    const { waitForNextUpdate, result } = renderHook(() => useForm());
    const { getFormProps, uiState } = result.current;

    const onSubmit = evt =>
      new Promise(r => {
        setTimeout(() => {
          r();
        }, 1);
      });

    const formProps = getFormProps({ onSubmit });

    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    act(() => {
      formProps.onSubmit({ preventDefault: noop });
    });
    await waitForNextUpdate();
    expect(result.current.uiState).toEqual({
      isSubmitting: true,
      isValid: true,
      isValidating: false
    });
    jest.runAllTimers();
    await waitForNextUpdate();
    expect(uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
  });

  it("should gracefully handle onSubmit errors", async () => {
    const { result } = renderHook(() => useForm());
    const { getFormProps, uiState } = result.current;
    const onSubmit = evt => new Error();
    const formProps = getFormProps({ onSubmit });

    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    act(() => {
      formProps.onSubmit({ preventDefault: noop });
    });
    expect(uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
  });

  it("should gracefully handle async onSubmit errors", async () => {
    const { waitForNextUpdate, result } = renderHook(() => useForm());
    const onSubmit = evt =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject();
        }, 1);
      });
    const formProps = result.current.getFormProps({ onSubmit });

    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    act(() => {
      formProps.onSubmit({ preventDefault: noop });
    });
    await waitForNextUpdate();

    expect(result.current.uiState).toEqual({
      isSubmitting: true,
      isValid: true,
      isValidating: false
    });
    jest.runAllTimers();
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
    const { result } = renderHook(() => useForm());
    const { api } = result.current;

    renderHook(() => api.addInput({ name: "test", value: "123" }));
    expect(result.current.formValues).toEqual({ test: "123" });
    expect(result.current.inputs.test).toBeDefined();
  });

  it("should be able to add input and get props", () => {
    const { result } = renderHook(() => useForm());
    const { api } = result.current;

    renderHook(() => api.addInput({ name: "test", value: "123" }));
    const inputProps = result.current.inputs.test.getInputProps();

    expect(inputProps.id).toEqual("test");
    expect(inputProps.value).toEqual("123");
  });

  it("should be able to add multiple inputs", () => {
    const { result } = renderHook(() => useForm());
    const { api } = result.current;

    renderHook(() => api.addInput({ name: "test", value: "123" }));
    renderHook(() => api.addInput({ name: "secondtest", value: "234" }));

    expect(result.current.formValues).toEqual({
      secondtest: "234",
      test: "123"
    });
  });
});

describe("useForm input validation tests", () => {
  afterEach(cleanup);

  it("should iitialize validation state for inputs to valid regardless  of initial value", () => {
    const { result } = renderHook(() => useForm());
    const { api } = result.current;

    renderHook(() => api.addInput({ name: "test", value: "123" }));

    expect(result.current.formValidity).toEqual({});
  });

  it("should be able to add an input with valid asynchronous validation and get correct formValidity input state", async () => {
    const customValidator = createValidator({
      validateFn: async text =>
        await new Promise(resolve => {
          setTimeout(() => resolve(true), 1);
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });

    const { result, waitForNextUpdate } = renderHook(() => useForm());

    renderHook(() =>
      result.current.api.addInput({
        name: "test",
        value: "",
        validators: [{ ...customValidator, when: ["onBlur"] }]
      })
    );
    await result.current.inputs.test.getInputProps().onBlur({
      preventDefault: noop,
      target: {
        value: ""
      }
    });
    expect(result.current.formValidity).toEqual({
      test: { isValidating: true, value: "" }
    });

    jest.runAllTimers();
    await waitForNextUpdate();

    expect(result.current.formValidity).toEqual({
      test: { field: "test", valid: true }
    });
  });

  it("should be able to add an input with invalid asynchronous validation and get correct formValidity input state", async () => {
    const customValidator = createValidator({
      validateFn: async text =>
        await new Promise(resolve => {
          setTimeout(() => resolve(false), 1);
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });

    const { result, waitForNextUpdate } = renderHook(() => useForm());

    renderHook(() =>
      result.current.api.addInput({
        name: "test",
        value: "",
        validators: [{ ...customValidator, when: ["onBlur"] }]
      })
    );
    await result.current.inputs.test.getInputProps().onBlur({
      preventDefault: noop,
      target: {
        value: ""
      }
    });
    expect(result.current.formValidity).toEqual({
      test: { isValidating: true, value: "" }
    });

    jest.runAllTimers();
    await waitForNextUpdate();

    expect(result.current.formValidity).toEqual({
      test: { errors: ["CUSTOM_ASYNC_ERROR"], field: "test", valid: false }
    });
  });

  it("should be able to add inputs with invalid values and submit", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useForm());

    renderHook(() =>
      result.current.api.addInput({
        name: "test",
        value: "",
        validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
      })
    );
    renderHook(() =>
      result.current.api.addInput({
        name: "last",
        value: "",
        validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
      })
    );
    renderHook(async () => {
      await result.current.getFormProps().onSubmit({ preventDefault: noop });
    });
    await waitForNextUpdate();
    jest.runAllTimers();
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

  it("should be able to add inputs with valid values and submit", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useForm());

    renderHook(() =>
      result.current.api.addInput({
        name: "test",
        value: "abc",
        validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
      })
    );
    renderHook(() =>
      result.current.api.addInput({
        name: "email",
        value: "george@ofthejungle.com",
        validators: [{ ...email, when: ["onBlur", "onSubmit"] }]
      })
    );
    renderHook(async () => {
      await result.current.getFormProps().onSubmit({ preventDefault: noop });
    });
    await waitForNextUpdate();
    jest.runAllTimers();
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
    const { result, waitForNextUpdate } = renderHook(() => useForm());

    renderHook(() =>
      result.current.api.addInput({
        name: "test",
        value: "abc",
        validators: [{ ...required, when: ["onBlur"] }]
      })
    );
    renderHook(async () => {
      await result.current.getFormProps().onSubmit({ preventDefault: noop });
    });
    jest.runAllTimers();
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

  it("should be able to determine validations that are undetermined", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useForm());

    const customValidator = createValidator({
      validateFn: async text =>
        await new Promise(resolve => {
          throw new Error("oh no");
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });

    renderHook(() =>
      result.current.api.addInput({
        name: "test",
        value: "abc",
        validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
      })
    );
    renderHook(() =>
      result.current.api.addInput({
        name: "email",
        value: "george@ofthejungle.com",
        validators: [{ ...customValidator, when: ["onBlur", "onSubmit"] }]
      })
    );
    renderHook(async () => {
      await result.current.getFormProps().onSubmit({ preventDefault: noop });
    });
    jest.runAllTimers();
    await waitForNextUpdate();

    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: true,
      isValidating: false
    });
    expect(result.current.formValidity).toEqual({
      email: {
        field: "email",
        undeterminedValidations: ["CUSTOM_ASYNC_ERROR"],
        valid: true
      },
      test: { field: "test", valid: true }
    });
  });
});
