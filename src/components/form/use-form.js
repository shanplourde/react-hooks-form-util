import { useState, useRef } from "react";
import { createInput } from "./input";
import { runValidators, validateInputEvents } from "./validators";

export const defaultFormProps = {
  autoComplete: "on"
};

export const useForm = ({ id, initialState = {} }) => {
  const [inputValues] = useState({
    ...initialState
  });
  const [formValidity, setFormValidity] = useState({});
  const [validators] = useState({});
  const [uiState, setUiState] = useState({
    isValidating: false,
    isValid: true,
    isSubmitting: false
  });
  const [inputs] = useState({});
  const [inputUiState, setInputUiState] = useState({});
  const [originalValues] = useState({});

  const validationRuntimeMap = useRef(new Map());

  const validateAll = async eventType => {
    const promises = [];
    let newUiState = { ...uiState };

    Object.keys(validators).forEach(async field => {
      promises.push(
        runValidators({
          field,
          validators: validators[field],
          eventType,
          value: inputs[field].value,
          inputValues
        })
      );
    });

    newUiState = {
      ...newUiState,
      isValidating: true
    };
    setUiState(newUiState);

    const results = await Promise.all(promises).catch(() => {
      // Do nothing, validation library handles errors.
    });
    results.forEach(result => {
      formValidity[result.field] = result;
    });

    setUiState({ ...newUiState, isValidating: false });
  };

  const onSubmit = async (evt, props) => {
    evt.preventDefault();
    let newUiState = { ...uiState };
    try {
      await validateAll(validateInputEvents.onSubmit, evt.timeStamp);
      const isFormValid = !Object.keys(formValidity).some(
        field => !formValidity[field].valid
      );

      newUiState = {
        ...newUiState,
        isSubmitting: true,
        isValid: isFormValid
      };
      setUiState(newUiState);
      if (props.onSubmit) {
        await props.onSubmit({ evt, inputValues });
      }
    } catch (e) {
      setUiState({ ...newUiState, isSubmitting: false });
    } finally {
      setUiState({ ...newUiState, isSubmitting: false });
    }
  };

  const getFormProps = (props = {}) => ({
    ...defaultFormProps,
    ...props,
    onSubmit: evt => {
      onSubmit(evt, props);
    }
  });

  const onInputChange = ({ event, id, value }) => {
    inputValues[id] = value;
    setInputUiState({
      ...inputUiState,
      [id]: { ...inputUiState[id], pristine: value === originalValues[id] }
    });

    runInputValidations({
      id,
      value,
      eventType: validateInputEvents.onChange,
      timeStamp: event.timeStamp
    });
  };

  const isValidatorAlreadyRunning = (id, value) =>
    formValidity[id] &&
    formValidity[id].isValidating &&
    formValidity[id].value === value;

  // Discard oldest async validations on a given input
  const isCurrentValidationRunLatest = (runtimeMap, id, timeStamp) =>
    runtimeMap.get(id) === undefined || runtimeMap.get(id) <= timeStamp;

  const runInputValidations = async ({ id, value, eventType, timeStamp }) => {
    validationRuntimeMap.current.set(id, timeStamp);
    const filteredValidators = validators[id].filter(validator => {
      return validator.when.some(
        whenItem =>
          whenItem === eventType ||
          (typeof whenItem === "object" &&
            whenItem.eventType === eventType &&
            whenItem.evaluateCondition &&
            whenItem.evaluateCondition({ id, formValidity, inputValues }))
      );
    });
    if (filteredValidators.length === 0) return;

    if (validators[id]) {
      const isCurrentRunLatest = () =>
        isCurrentValidationRunLatest(
          validationRuntimeMap.current,
          id,
          timeStamp
        );

      if (isValidatorAlreadyRunning(id, value)) {
        // No need to do anything at this point since validator is already running,
        return;
      }
      if (!isCurrentRunLatest()) return;

      setFormValidity(current => ({
        ...current,
        [id]: { isValidating: true, value }
      }));

      if (!isCurrentRunLatest()) return;

      setFormValidity(current => ({
        ...current,
        [id]: { ...current[id], isValidating: true, value }
      }));

      if (!isCurrentRunLatest()) return;

      try {
        const validationResults = await runValidators({
          field: id,
          validators: validators[id],
          eventType: eventType,
          value,
          runId: timeStamp,
          inputValues
        });

        if (!isCurrentRunLatest()) return;

        setFormValidity(current => ({ ...current, [id]: validationResults }));
      } catch {
        // Do nothing, validation library handles errors
      }
    }
  };

  const onInputBlur = async ({ event, id, value }) => {
    runInputValidations({
      id,
      value,
      eventType: validateInputEvents.onBlur,
      timeStamp: event.timeStamp
    });
  };

  const onInputFocus = ({ event, id }) => {
    setInputUiState({
      ...inputUiState,
      [id]: { ...inputUiState[id], visited: true }
    });
  };

  const isBlurWithinRadioGroup = (event, id) =>
    event.relatedTarget && event.relatedTarget.getAttribute("name") === id;

  const onRadioGroupBlur = async ({ id, value, event }) => {
    if (isBlurWithinRadioGroup(event, id)) return;

    runInputValidations({
      id,
      value,
      eventType: validateInputEvents.onBlur,
      timeStamp: event.timeStamp
    });
  };

  const addInput = ({
    id,
    value,
    validators: inputValidators = [],
    inputProps = {
      onChange: onInputChange,
      onBlur: onInputBlur,
      onFocus: onInputFocus
    }
  }) => {
    originalValues[id] =
      typeof originalValues[id] === "undefined" ? value : originalValues[id];
    inputValues[id] =
      typeof inputValues[id] === "undefined" ? value : inputValues[id];

    const input = createInput({
      id,
      value: inputValues[id],
      props: inputProps
    });
    inputs[id] = input;
    inputUiState[id] = inputUiState[id] || {
      pristine: true,
      visited: false
    };
    validators[id] = inputValidators;
    return input;
  };

  const addRadioGroup = ({ id, value, validators = [], inputProps }) => {
    const input = addInput({
      id,
      value,
      validators,
      inputProps: {
        ...inputProps,
        onChange: onInputChange,
        onBlur: onRadioGroupBlur,
        onFocus: onInputFocus
      }
    });
    return input;
  };

  const removeInput = id => {
    delete inputs[id];
    delete inputUiState[id];
    delete validators[id];
    delete formValidity[id];
    delete inputValues[id];
    delete originalValues[id];

    setInputUiState(inputUiState);
  };

  return {
    id,
    getFormProps,
    formValidity,
    uiState,
    inputs,
    inputValues,
    inputUiState,
    api: {
      addInput,
      addRadioGroup,
      removeInput
    }
  };
};
