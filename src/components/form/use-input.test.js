import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { useInput } from "./use-input";

describe("useInput tests", () => {
  afterEach(cleanup);

  it("should initialize an input", () => {
    const { result } = renderHook(() => useInput({ id: "test", value: "123" }));
    const { id, value, api, uiState, getInputProps } = result.current;
    expect(id).toEqual("test");
    expect(value).toEqual("123");
    expect(api).toBeDefined();
    expect(uiState).toBeDefined();
    expect(getInputProps).toBeDefined();
  });

  it("should support reset", () => {
    const { result } = renderHook(() => useInput({ id: "test", value: "123" }));
    expect(result.current.value).toEqual("123");
    act(() => {
      result.current.api.setValue("");
    });
    expect(result.current.value).toEqual("");
  });

  it("should support custom input props", () => {
    const { result } = renderHook(() => useInput({ id: "test", value: "123" }));
    expect(result.current.value).toEqual("123");
    act(() => {
      result.current.api.setValue("");
    });
    expect(result.current.value).toEqual("");
  });

  it("should change visited state on focus", () => {
    const { result } = renderHook(() => useInput({ id: "test", value: "123" }));
    expect(result.current.uiState.visited).toEqual(false);
    act(() => {
      result.current.getInputProps().onFocus();
    });
    expect(result.current.uiState.visited).toEqual(true);
  });

  it("should change pristine after API setValue", () => {
    const { result } = renderHook(() => useInput({ id: "test", value: "123" }));
    expect(result.current.uiState.pristine).toEqual(true);
    act(() => {
      result.current.api.setValue("234");
    });
    expect(result.current.uiState.pristine).toEqual(false);
    act(() => {
      result.current.api.setValue("123");
    });
    expect(result.current.uiState.pristine).toEqual(true);
  });

  it("should change pristine and value when onChange event is triggered", () => {
    const { result } = renderHook(() => useInput({ id: "test", value: "123" }));
    act(() => {
      result.current.getInputProps().onChange({
        target: { value: "234" }
      });
    });
    expect(result.current.uiState.pristine).toEqual(false);
    expect(result.current.value).toEqual("234");

    act(() => {
      result.current.getInputProps().onChange({
        target: { value: "123" }
      });
    });
    expect(result.current.uiState.pristine).toEqual(true);
    expect(result.current.value).toEqual("123");
  });

  it("should support custom onChange", () => {
    const onChange = jest.fn();

    const { result } = renderHook(() => useInput({ id: "test", value: "123" }));
    act(() => {
      result.current.getInputProps({ onChange }).onChange({
        value: "234"
      });
    });
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toBeCalledWith({ value: "234" });
  });

  it("should return selected values from multi-select onBlur", () => {
    const { result } = renderHook(() => useInput({ id: "test", value: [] }));
    act(() => {
      result.current.getInputProps().onChange({
        target: {
          type: "select-multiple",
          options: [
            { value: "1", selected: true },
            { value: "2", selected: true },
            { value: "3", selected: false },
            { value: "4", selected: true }
          ]
        }
      });
    });
    expect(result.current.value).toEqual(["1", "2", "4"]);
  });

  it("should return selected values from multi-select onChange", () => {
    const { result } = renderHook(() => useInput({ id: "test", value: [] }));
    act(() => {
      result.current.getInputProps().onChange({
        target: {
          type: "select-multiple",
          options: [
            { value: "1", selected: true },
            { value: "2" },
            { value: "3", selected: false },
            { value: "4", selected: true }
          ]
        }
      });
    });
    expect(result.current.value).toEqual(["1", "4"]);
  });

  it("should return no values selected multi-select", () => {
    const { result } = renderHook(() => useInput({ id: "test" }));
    act(() => {
      result.current.getInputProps().onChange({
        target: {
          type: "select-multiple",
          options: [
            { value: "1" },
            { value: "2" },
            { value: "3" },
            { value: "4" }
          ]
        }
      });
    });
    expect(result.current.value).toEqual([]);
  });

  it("should support checkbox value", () => {
    const { result } = renderHook(() =>
      useInput({ id: "test", checked: true })
    );
    act(() => {
      result.current.getInputProps().onChange({
        target: {
          type: "checkbox",
          checked: true
        }
      });
    });
    expect(result.current.value).toEqual(true);

    act(() => {
      result.current.getInputProps().onChange({
        target: {
          type: "checkbox",
          checked: false
        }
      });
    });
    expect(result.current.value).toEqual(false);
  });

  it("should support getting selected radio input value", () => {
    const { result } = renderHook(() => useInput({ id: "test" }));
    act(() => {
      result.current.getInputProps().onChange({
        target: {
          type: "radio",
          checked: true,
          value: 2
        }
      });
    });
    expect(result.current.value).toEqual(2);
  });

  it("should support getting unselected radio input value", () => {
    const { result } = renderHook(() => useInput({ id: "test" }));
    act(() => {
      result.current.getInputProps().onChange({
        target: {
          type: "radio",
          checked: false,
          value: 2
        }
      });
    });
    expect(result.current.value).toEqual(undefined);
  });
});
