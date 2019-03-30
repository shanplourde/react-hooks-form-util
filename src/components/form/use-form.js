import { useState } from "react";
import { useInput } from "./use-input";
import { runValidators } from "./validators";

export const defaultFormProps = {
  autoComplete: "on"
};

export const useForm = (name, initialState = {}) => {
  const [formValues] = useState({
    ...initialState
  });
  const [formValidity, setFormValidity] = useState({});
  const [validators] = useState({});
  const [uiState, setUiState] = useState({
    isValid: true,
    isSubmitting: false
  });
  const [inputs] = useState({});

  const validateAll = async () => {
    const promises = [];
    Object.keys(validators).forEach(async field => {
      promises.push(
        runValidators({
          field,
          validators: validators[field],
          eventType: "onBlur",
          value: inputs[field].value
        })
      );
    });
    const results = await Promise.all(promises);
    results.forEach(result => {
      formValidity[result.field] = result;
    });

    // Object.keys(validators).forEach(async field => {
    //   const validationResults = await runValidators({
    //     field,
    //     validators: validators[field],
    //     eventType: "onBlur",
    //     value: inputs[field].value
    //   });
    //   formValidity[field] = validationResults;
    // });
  };

  const getFormProps = (props = {}) => ({
    ...defaultFormProps,
    ...props,
    onSubmit: async evt => {
      evt.preventDefault();
      let newUiState = { ...uiState };
      try {
        await validateAll();
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
    }
  });

  const onInputChange = (name, value) => {
    formValues[name] = value;
  };

  const onInputBlur = async (name, value) => {
    if (validators[name]) {
      const validationResults = await runValidators({
        field: name,
        validators: validators[name],
        eventType: "onBlur",
        value
      });
      setFormValidity({ ...formValidity, [name]: validationResults });
    }
  };

  const addInput = ({ name, value, validators: inputValidators = [] }) => {
    const input = useInput({
      name,
      value,
      props: { onChange: onInputChange, onBlur: onInputBlur }
    });
    inputs[name] = input;
    formValues[name] = value;
    validators[name] = inputValidators;
    return input;
  };

  return {
    getFormProps,
    formValues,
    formValidity,
    uiState,
    inputs,
    api: {
      addInput
    }
  };
};
