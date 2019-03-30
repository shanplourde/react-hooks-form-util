import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { useForm } from "./use-form";
import { required, email, createValidator } from "./validators";

const noop = () => {};

jest.useFakeTimers();

describe("useForm hook tests", () => {
  afterEach(cleanup);

  it("should return empty form props and form state", () => {
    const { result } = renderHook(() => useForm());
    const { getFormProps, formValues } = result.current;
    expect(getFormProps).toBeDefined();
    expect(formValues).toEqual({});
  });

  it("should return an initial uiState", () => {
    const { result } = renderHook(() => useForm());
    const { uiState } = result.current;
    expect(uiState).toEqual({
      isSubmitting: false,
      isValid: true
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
    const onSubmit = jest.fn(() => new Promise(r => setTimeout(() => r(), 1)));
    const formProps = result.current.getFormProps({ onSubmit });
    expect(formProps.onSubmit).toBeDefined();
    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    act(async () => {
      await formProps.onSubmit({ preventDefault: noop });
    });
    await waitForNextUpdate();
    expect(result.current.uiState).toEqual({
      isSubmitting: true,
      isValid: true
    });
    jest.runAllTimers();
    await waitForNextUpdate();
    expect(onSubmit).toHaveBeenCalled();
    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: true
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
    expect(formProps.onSubmit).toBeDefined();

    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    act(() => {
      formProps.onSubmit({ preventDefault: noop });
    });
    await waitForNextUpdate();
    expect(result.current.uiState).toEqual({
      isSubmitting: true,
      isValid: true
    });
    jest.runAllTimers();
    await waitForNextUpdate();
    expect(uiState).toEqual({
      isSubmitting: false,
      isValid: true
    });
  });

  it("should gracefully handle onSubmit errors", async () => {
    const { result } = renderHook(() => useForm());
    const { getFormProps, uiState } = result.current;

    const onSubmit = evt => new Error();

    const formProps = getFormProps({ onSubmit });
    expect(formProps.onSubmit).toBeDefined();

    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    act(() => {
      formProps.onSubmit({ preventDefault: noop });
    });
    expect(uiState).toEqual({
      isSubmitting: false,
      isValid: true
    });
  });

  it("should gracefully handle async onSubmit errors", async () => {
    const { waitForNextUpdate, result } = renderHook(() => useForm());
    const { getFormProps, uiState } = result.current;

    const onSubmit = evt =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject();
        }, 1);
      });

    const formProps = getFormProps({ onSubmit });
    expect(formProps.onSubmit).toBeDefined();

    // Could be some weirdness right now due to
    // https://github.com/facebook/react/issues/14769
    act(() => {
      formProps.onSubmit({ preventDefault: noop });
    });
    await waitForNextUpdate();
    expect(result.current.uiState).toEqual({
      isSubmitting: true,
      isValid: true
    });
    jest.runAllTimers();
    await waitForNextUpdate();
    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: true
    });
  });
});

describe("useForm input tests", () => {
  afterEach(cleanup);
  it("should be able to add inputs", () => {
    const { result } = renderHook(() => useForm());
    const { api } = result.current;
    expect(api).toBeDefined();

    renderHook(() => api.addInput({ name: "test", value: "123" }));
    expect(result.current.formValues).toEqual({ test: "123" });
    expect(result.current.inputs.test).toBeDefined();
    let inputProps = result.current.inputs.test.getInputProps();
    expect(inputProps.id).toEqual("test");
    expect(inputProps.value).toEqual("123");

    renderHook(() => api.addInput({ name: "secondtest", value: "234" }));
    expect(result.current.formValues).toEqual({
      test: "123",
      secondtest: "234"
    });
    expect(result.current.inputs.test).toBeDefined();
    inputProps = result.current.inputs.secondtest.getInputProps();
    expect(inputProps.id).toEqual("secondtest");
    expect(inputProps.value).toEqual("234");
  });
});

describe("useForm input validation tests", () => {
  afterEach(cleanup);

  it("should be able to add inputs with invalid values and submit", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useForm());
    const onSubmit = jest.fn();
    expect(result.current.api).toBeDefined();
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
      await result.current
        .getFormProps({ onSubmit })
        .onSubmit({ preventDefault: noop });
    });
    jest.runAllTimers();
    await waitForNextUpdate();
    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: false
    });
    expect(onSubmit).toHaveBeenCalled();
    expect(result.current.formValidity).toEqual({
      last: { errors: ["REQUIRED"], field: "last", valid: false },
      test: { errors: ["REQUIRED"], field: "test", valid: false }
    });
  });

  it("should be able to add inputs with invalid values and submit", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useForm());
    const onSubmit = jest.fn();
    expect(result.current.api).toBeDefined();
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
      await result.current
        .getFormProps({ onSubmit })
        .onSubmit({ preventDefault: noop });
    });
    jest.runAllTimers();
    await waitForNextUpdate();
    expect(result.current.uiState).toEqual({
      isSubmitting: false,
      isValid: true
    });
    expect(onSubmit).toHaveBeenCalled();
    expect(result.current.formValidity).toEqual({
      email: { field: "email", valid: true },
      test: { field: "test", valid: true }
    });
  });

  it("should be able to determine validations that are undetermined", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useForm());
    const onSubmit = jest.fn();
    const customValidator = createValidator({
      validateFn: async text =>
        await new Promise(resolve => {
          throw new Error("oh no");
        }),
      error: "CUSTOM_ASYNC_ERROR"
    });

    expect(result.current.api).toBeDefined();
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
      await result.current
        .getFormProps({ onSubmit })
        .onSubmit({ preventDefault: noop });
    });
    jest.runAllTimers();
    await waitForNextUpdate();

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
