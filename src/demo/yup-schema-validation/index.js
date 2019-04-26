import React from "react";
import { useForm } from "../../components/form/use-form";
import { object, string } from "yup";
import {
  validators,
  validateInputEvents,
  evaluateConditions
} from "../../components/form/validators";
import { sleep } from "../utils/async";

const { schema } = validators;
const { onBlur, onSubmit, onChange } = validateInputEvents;

function YupSchemaValidation(props) {
  const initialState = {
    firstName: "",
    lastName: "OfTheJungle",
    email: "george@thejungle.com"
  };

  const contactSchema = object({
    firstName: string()
      .required()
      .min(3),
    lastName: string()
      .required()
      .min(10),
    email: string().email()
  });

  const {
    getFormProps,
    inputValues,
    uiState,
    api,
    formValidity,
    inputUiState
  } = useForm({
    id: "YupSchemaValidationForm",
    initialState,
    validationSchema: contactSchema
  });

  const firstNameInput = api.addInput({
    id: "firstName",
    value: inputValues.firstName,
    validators: [
      {
        ...schema,
        when: [
          {
            eventType: onChange,
            evaluateCondition: evaluateConditions.rewardEarlyValidateLate
          },
          onBlur,
          onSubmit
        ]
      }
    ]
  });

  const lastNameInput = api.addInput({
    id: "lastName",
    value: inputValues.lastName,
    validators: [{ ...schema, when: [onBlur, onSubmit] }]
  });

  const emailInput = api.addInput({
    id: "email",
    value: inputValues.email,
    validators: [{ ...schema, when: [onBlur, onSubmit] }]
  });

  const handleOnSubmit = async ({ evt, inputValues }) => {
    await sleep(2000);
    console.log("sample-form onSubmit, inputValues", inputValues);
  };

  return (
    <div>
      <h2>Yup schema validation demo</h2>
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
        <div className="field-group">
          <label htmlFor={firstNameInput.id}>
            First name {JSON.stringify(inputUiState.firstName)} --{" "}
            {JSON.stringify(formValidity.firstName)} *
          </label>
          <input
            type="text"
            {...firstNameInput.getInputProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          />
        </div>

        <div className="field-group">
          <label htmlFor={lastNameInput.id}>
            Last name {JSON.stringify(inputUiState.lastName)} --{" "}
            {JSON.stringify(formValidity.lastName)} *
          </label>
          <input
            type="text"
            {...lastNameInput.getInputProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          />
        </div>

        <div className="field-group">
          <label htmlFor={emailInput.id}>
            Email address {JSON.stringify(inputUiState.email)} --{" "}
            {JSON.stringify(formValidity.email)}*
          </label>
          <input
            type="text"
            {...emailInput.getInputProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          />
        </div>

        <div>* - Indicates required field</div>

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

export { YupSchemaValidation };
