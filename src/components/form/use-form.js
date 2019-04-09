import { useState, useRef } from "react";
import { useInput } from "./use-input";
import { runValidators, validateInputEvents } from "./validators";

export const defaultFormProps = {
  autoComplete: "on"
};

export const useForm = ({ id, initialState = {} }) => {
  const [formValues] = useState({
    ...initialState
  });
  const [formValidity, setFormValidity] = useState({});
  const formValidityAsyncState = useRef({});
  const [validators] = useState({});
  const [uiState, setUiState] = useState({
    isValidating: false,
    isValid: true,
    isSubmitting: false
  });
  const [inputs] = useState({});
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
          formValues
        })
      );
    });

    newUiState = {
      ...newUiState,
      isValidating: true
    };
    setUiState(newUiState);

    const results = await Promise.all(promises);
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
        await props.onSubmit({ evt, formValues });
      }
    } finally {
      setUiState({ ...newUiState, isSubmitting: false });
    }
  };

  const getFormProps = (props = {}) => ({
    ...defaultFormProps,
    ...props,
    onSubmit: evt => onSubmit(evt, props)
  });

  const onInputChange = ({ event, id, value }) => {
    formValues[id] = value;
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
      return validator.when.some(whenItem => whenItem === eventType);
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

      formValidityAsyncState.current = { ...formValidity };
      formValidity[id] = {
        ...formValidityAsyncState.current[id],
        isValidating: true,
        value
      };

      if (!isCurrentRunLatest()) return;

      formValidityAsyncState.current = {
        ...formValidityAsyncState.current,
        [id]: { ...formValidityAsyncState[id], isValidating: true, value }
      };

      if (!isCurrentRunLatest()) return;
      setFormValidity(formValidityAsyncState.current);

      if (!isCurrentRunLatest()) return;

      const validationResults = await runValidators({
        field: id,
        validators: validators[id],
        eventType: eventType,
        value,
        runId: timeStamp,
        formValues
      });

      if (!isCurrentRunLatest()) return;

      formValidityAsyncState.current = {
        ...formValidityAsyncState.current,
        [id]: validationResults
      };

      if (!isCurrentRunLatest()) return;
      setFormValidity(formValidityAsyncState.current);
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
      onBlur: onInputBlur
    }
  }) => {
    const input = useInput({
      id,
      value,
      props: inputProps
    });
    inputs[id] = input;
    formValues[id] = value;
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
        onBlur: onRadioGroupBlur
      }
    });
    return input;
  };

  return {
    id,
    getFormProps,
    formValues,
    formValidity,
    uiState,
    inputs,
    api: {
      addInput,
      addRadioGroup
    }
  };
};
