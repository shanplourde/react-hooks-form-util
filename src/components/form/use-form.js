import { useState, useRef } from "react";
import { createInput } from "./input";
import { runValidators, validateInputEvents } from "./validators";

export const defaultFormProps = {
  autoComplete: "on"
};

export const useForm = ({ id, initialState = {} }) => {
  const inputValues = useRef({
    ...initialState
  });
  const [formValidity, setFormValidity] = useState({});
  const validators = useRef({});
  const [uiState, setUiState] = useState({
    isValidating: false,
    isValid: true,
    isSubmitting: false
  });
  const inputs = useRef({});
  const [inputUiState, setInputUiState] = useState({});
  const originalValues = useRef({});

  const validationRuntimeMap = useRef(new Map());

  const validateAll = async eventType => {
    const promises = [];
    let newUiState = { ...uiState };

    Object.keys(validators.current).forEach(async field => {
      promises.push(
        runValidators({
          field,
          validators: validators.current[field],
          eventType,
          value: inputs.current[field].value,
          inputValues: inputValues.current
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
        await props.onSubmit({ evt, inputValues: inputValues.current });
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
    inputValues.current[id] = value;
    setInputUiState({
      ...inputUiState,
      [id]: {
        ...inputUiState[id],
        pristine: value === originalValues.current[id]
      }
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
    const filteredValidators = validators.current[id].filter(validator => {
      return validator.when.some(
        whenItem =>
          whenItem === eventType ||
          (typeof whenItem === "object" &&
            whenItem.eventType === eventType &&
            whenItem.evaluateCondition &&
            whenItem.evaluateCondition({
              id,
              formValidity,
              inputValues: inputValues.current
            }))
      );
    });
    if (filteredValidators.length === 0) return;

    if (validators.current[id]) {
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
          validators: validators.current[id],
          eventType: eventType,
          value,
          runId: timeStamp,
          inputValues: inputValues.current
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
    originalValues.current[id] =
      typeof originalValues.current[id] === "undefined"
        ? value
        : originalValues.current[id];
    inputValues.current[id] =
      typeof inputValues.current[id] === "undefined"
        ? value
        : inputValues.current[id];

    const input = createInput({
      id,
      value: inputValues.current[id],
      props: inputProps
    });
    inputs.current[id] = input;
    inputUiState[id] = inputUiState[id] || {
      pristine: true,
      visited: false
    };
    validators.current[id] = inputValidators;
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
    delete inputs.current[id];
    delete inputUiState[id];
    delete validators.current[id];
    delete formValidity[id];
    delete inputValues.current[id];
    delete originalValues.current[id];

    setInputUiState(inputUiState);
  };

  return {
    id,
    getFormProps,
    formValidity,
    uiState,
    inputs: inputs.current,
    inputValues: inputValues.current,
    inputUiState,
    api: {
      addInput,
      addRadioGroup,
      removeInput
    }
  };
};
