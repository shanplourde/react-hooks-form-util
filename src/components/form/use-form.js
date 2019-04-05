import { useState, useRef } from "react";
import { useInput } from "./use-input";
import { runValidators } from "./validators";

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

  const validateAll = async eventType => {
    const promises = [];
    let newUiState = { ...uiState };

    Object.keys(validators).forEach(async field => {
      promises.push(
        runValidators({
          field,
          validators: validators[field],
          eventType,
          value: inputs[field].value
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

    // newUiState = { ...newUiState, isValidating: false };
    setUiState({ ...newUiState, isValidating: false });
  };

  const onSubmit = async (evt, props) => {
    evt.preventDefault();
    let newUiState = { ...uiState };
    try {
      await validateAll("onSubmit");
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

  const onInputChange = (id, value) => {
    formValues[id] = value;
    runInputValidations({ id, value, eventType: "onChange" });
  };

  const isValidatorAlreadyRunning = (id, value) =>
    formValidity[id] &&
    formValidity[id].isValidating &&
    formValidity[id].value === value;

  const runInputValidations = async ({ id, value, eventType }) => {
    const filteredValidators = validators[id].filter(validator => {
      return validator.when.some(whenItem => whenItem === eventType);
    });
    if (filteredValidators.length === 0) return;
    if (validators[id]) {
      if (isValidatorAlreadyRunning(id, value)) {
        // No need to do anything at this point since validator is already running,
        return;
      }
      // TODO: Cancel running promises from previous async validators
      formValidityAsyncState.current = { ...formValidity };
      formValidity[id] = {
        ...formValidityAsyncState.current[id],
        isValidating: true,
        value
      };

      formValidityAsyncState.current = {
        ...formValidityAsyncState.current,
        [id]: { ...formValidityAsyncState[id], isValidating: true, value }
      };
      setFormValidity(formValidityAsyncState.current);

      const validationResults = await runValidators({
        field: id,
        validators: validators[id],
        eventType: eventType,
        value
      });
      formValidityAsyncState.current = {
        ...formValidityAsyncState.current,
        [id]: validationResults
      };
      setFormValidity(formValidityAsyncState.current);
    }
  };

  const onInputBlur = async ({ id, value }) => {
    runInputValidations({ id, value, eventType: "onBlur" });
  };

  const isBlurWithinRadioGroup = (event, id) =>
    event.relatedTarget && event.relatedTarget.getAttribute("name") === id;

  const onRadioGroupBlur = async ({ id, value, event }) => {
    if (isBlurWithinRadioGroup(event, id)) return;

    runInputValidations({ id, value, eventType: "onBlur" });
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
