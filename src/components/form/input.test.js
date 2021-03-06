import { renderHook, cleanup, act } from "react-hooks-testing-library";
import { createInput } from "./input";

describe("createInput tests", () => {
  afterEach(cleanup);

  it("should initialize an input", () => {
    const result = createInput({ id: "test", value: "123" });
    const { id, value, getInputProps, getCheckProps } = result;
    expect(id).toEqual("test");
    expect(value).toEqual("123");
    expect(getInputProps).toBeDefined();
    expect(getCheckProps).toBeDefined();
  });

  it("supports custom getInputProps props", () => {
    const result = createInput({ id: "test", value: "123" });
    const props = result.getInputProps({ testProp: "value" });

    expect(props.testProp).toEqual("value");
  });

  it("supports custom getCheckProps props", () => {
    const result = createInput({ id: "test", value: "123" });
    const props = result.getCheckProps({ testProp: "value" });

    expect(props.testProp).toEqual("value");
  });

  it("supports custom getCheckProps function props", () => {
    const result = createInput({
      id: "test",
      value: "123",
      props: { testProp: "123" }
    });
    const props = result.getCheckProps(props => {
      return {
        foo: props.testProp
      };
    });

    expect(props.foo).toEqual("123");
  });

  it("supports custom getInputProps function props", () => {
    const result = createInput({
      id: "test",
      value: "123",
      props: { testProp: "123" }
    });
    const props = result.getInputProps(props => {
      return {
        foo: props.testProp
      };
    });

    expect(props.foo).toEqual("123");
  });

  it("should support checkbox props", () => {
    const result = createInput({ id: "test", value: false });
    const { id, getCheckProps } = result;
    expect(id).toEqual("test");
    expect(getCheckProps().checked).toEqual(false);
  });

  it("gets radio value", () => {
    const result = createInput({ id: "test", value: false });
    let onChange = jest.fn();
    result.getInputProps({ onChange }).onChange({
      target: {
        type: "radio",
        checked: true,
        value: "foo"
      }
    });

    expect(onChange).toHaveBeenCalledWith({
      target: { checked: true, type: "radio", value: "foo" }
    });

    onChange = jest.fn();
    result.getInputProps({ onChange }).onChange({
      target: {
        type: "radio",
        checked: false,
        value: "foo"
      }
    });

    expect(onChange).toHaveBeenCalledWith({
      target: { checked: false, type: "radio", value: "foo" }
    });
  });

  it("should support getting multi-select values", () => {
    const result = createInput({ id: "test", value: [] });
    const onChange = jest.fn();
    result.getInputProps({ onChange }).onChange({
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
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith({
      target: {
        options: [
          { selected: true, value: "1" },
          { selected: true, value: "2" },
          { selected: false, value: "3" },
          { selected: true, value: "4" }
        ],
        type: "select-multiple"
      }
    });
  });

  it("should support custom input props", () => {
    const result = createInput({ id: "test", value: "123" });

    expect(result.value).toEqual("123");
  });

  it("should support custom onBlur", () => {
    const onBlur = jest.fn();

    const result = createInput({ id: "test", value: "123" });

    result.getInputProps({ onBlur }).onBlur({
      value: "234"
    });
    expect(onBlur).toHaveBeenCalled();
    expect(onBlur).toBeCalledWith({ value: "234" });
  });

  it("should support custom onChange", () => {
    const onChange = jest.fn();

    const result = createInput({ id: "test", value: "123" });

    result.getInputProps({ onChange }).onChange({
      value: "234"
    });

    expect(onChange).toHaveBeenCalled();
    expect(onChange).toBeCalledWith({ value: "234" });
  });

  it("should support custom onFocus", () => {
    const onFocus = jest.fn();

    const result = createInput({ id: "test", value: "123" });

    result.getInputProps({ onFocus }).onFocus();

    expect(onFocus).toHaveBeenCalled();
  });
});
