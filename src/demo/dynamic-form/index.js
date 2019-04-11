import React, { useState } from "react";
import { useForm } from "../../components/form/use-form";
import {
  validators,
  validateInputEvents
} from "../../components/form/validators";
import { sleep } from "../utils/async";
const { required } = validators;
const { onBlur, onSubmit } = validateInputEvents;

function DynamicForm() {
  const {
    getFormProps,
    uiState,
    api,
    formValidity,
    inputs,
    inputUiState
  } = useForm({
    id: "dynamicForm",
    initialState: {}
  });
  const [fields, setFields] = useState([]);

  fields.map((field, idx) =>
    api.addInput({
      id: field.id,
      value: field.value,
      validators: [{ ...required, when: [onBlur, onSubmit] }]
    })
  );

  const handleOnSubmit = async ({ evt, inputValues }) => {
    await sleep(2000);
    console.log("sample-form onSubmit, inputValues", inputValues);
  };

  const handleOnAddNewClick = () => {
    setFields(
      fields.concat({
        id: `field${Date.now()}`,
        value: ``
      })
    );
  };

  const handleRemoveInput = id => {
    setFields(fields.filter(field => field.id !== id));
    api.removeInput(id);
  };

  return (
    <div>
      <h2>Dynamic form sample</h2>
      <h3>Overall form diagnostics</h3>
      <ul>
        <li>uiState: {JSON.stringify(uiState)}</li>
        <li>formValidity: {JSON.stringify(formValidity)}</li>
      </ul>
      {uiState.isSubmitting && (
        <div className="submitting-indicator">Submitting</div>
      )}
      <h3>Form</h3>
      <form {...getFormProps({ onSubmit: handleOnSubmit })}>
        {Object.entries(inputs).map(([key, value]) => (
          <div className="field-group" key={value.id}>
            <label htmlFor={value.id}>
              Dynamic field{" "}
              <button type="button" onClick={() => handleRemoveInput(value.id)}>
                Remove input
              </button>
              {JSON.stringify(inputUiState[value.id])} --{" "}
              {JSON.stringify(formValidity[value.id])}
            </label>
            <input
              type="text"
              {...value.getInputProps()}
              disabled={uiState.isSubmitting || uiState.isValidating}
            />
          </div>
        ))}
        <button type="button" onClick={handleOnAddNewClick}>
          Add new field
        </button>

        <div className="input-footer">
          <button
            type="submit"
            disabled={uiState.isSubmitting || uiState.isValidating}
          >
            Save
          </button>
          {uiState.isSubmitting ||
            (uiState.isValidating && <p>Submitting...</p>)}
        </div>
      </form>
    </div>
  );
}

export { DynamicForm };
