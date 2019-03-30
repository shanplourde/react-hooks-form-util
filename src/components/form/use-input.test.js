import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { useInput } from "./use-input";

describe("useInput tests", () => {
  afterEach(cleanup);

  it("should initialize an input", () => {
    const { result } = renderHook(() =>
      useInput({ name: "test", value: "123" })
    );
    const { id, value, api, uiState, getInputProps } = result.current;
    expect(id).toEqual("test");
    expect(value).toEqual("123");
    expect(api).toBeDefined();
    expect(uiState).toBeDefined();
    expect(getInputProps).toBeDefined();
  });

  it("should support reset", () => {
    const { result } = renderHook(() =>
      useInput({ name: "test", value: "123" })
    );
    expect(result.current.value).toEqual("123");
    act(() => {
      result.current.api.setValue("");
    });
    expect(result.current.value).toEqual("");
  });

  it("should support custom input props", () => {
    const { result } = renderHook(() =>
      useInput({ name: "test", value: "123" })
    );
    expect(result.current.value).toEqual("123");
    act(() => {
      result.current.api.setValue("");
    });
    expect(result.current.value).toEqual("");
  });

  it("should change visited state on focus", () => {
    const { result } = renderHook(() =>
      useInput({ name: "test", value: "123" })
    );
    expect(result.current.uiState.visited).toEqual(false);
    act(() => {
      result.current.getInputProps().onFocus();
    });
    expect(result.current.uiState.visited).toEqual(true);
  });

  it("should change pristine after API setValue", () => {
    const { result } = renderHook(() =>
      useInput({ name: "test", value: "123" })
    );
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
    const { result } = renderHook(() =>
      useInput({ name: "test", value: "123" })
    );
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
});
