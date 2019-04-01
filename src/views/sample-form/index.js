import React from "react";
import { useForm } from "../../components/form/use-form";
import {
  required,
  email,
  createValidator
} from "../../components/form/validators";
import { sleep } from "../../utils/async";

function SampleForm(props) {
  const { getFormProps, formValues, uiState, api, formValidity } = useForm(
    "settingsForm",
    {
      firstName: "George",
      lastName: "OfTheJungle",
      email: "george@thejungle.com",
      custom: "custom"
    }
  );
  const firstNameInput = api.addInput({
    name: "firstName",
    value: formValues.firstName,
    validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
  });
  const lastNameInput = api.addInput({
    name: "lastName",
    value: formValues.lastName,
    validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
  });
  const emailInput = api.addInput({
    name: "email",
    value: formValues.email,
    validators: [
      { ...required, when: ["onBlur", "onSubmit"] },
      {
        ...email,
        when: ["onBlur", "onSubmit"]
      }
    ]
  });
  const customValidator = createValidator({
    validateFn: async text =>
      await new Promise(resolve => {
        setTimeout(() => {
          resolve((text || "").length > 8);
        }, 5000);
      }),
    error: "CUSTOM_ASYNC_ERROR"
  });

  const customInput = api.addInput({
    name: "custom",
    value: formValues.custom,
    validators: [{ ...customValidator, when: ["onBlur", "onSubmit"] }]
  });

  const onSubmit = async ({ evt, formValues }) => {
    await sleep(5000);
    console.log("sample-form onSubmit, formValues", formValues);
  };

  console.log("formValidity", JSON.stringify(formValidity));
  console.log("uiState", JSON.stringify(uiState));

  return (
    <div>
      <h2>Kitchen sink sample</h2>
      <h3>Overall form diagnostics</h3>
      <ul>
        <li>uiState: {JSON.stringify(uiState)}</li>
        <li>formValidity: {JSON.stringify(formValidity)}</li>
      </ul>
      {uiState.isSubmitting && (
        <div className="submitting-indicator">Submitting</div>
      )}
      <h3>Form</h3>
      <form {...getFormProps({ onSubmit })}>
        <div className="field-group">
          <label htmlFor={firstNameInput.id}>
            First name {JSON.stringify(firstNameInput.uiState)} --{" "}
            {JSON.stringify(formValidity.firstName)} *
          </label>
          <input type="text" {...firstNameInput.getInputProps()} />
        </div>

        <div className="field-group">
          <label htmlFor={lastNameInput.id}>
            Last name {JSON.stringify(lastNameInput.uiState)} --{" "}
            {JSON.stringify(formValidity.lastName)} *
          </label>
          <input type="text" {...lastNameInput.getInputProps()} />
        </div>

        <div className="field-group">
          <label htmlFor={emailInput.id}>
            Email address {JSON.stringify(emailInput.uiState)} --{" "}
            {JSON.stringify(formValidity.email)}*
          </label>
          <input type="text" {...emailInput.getInputProps()} />
        </div>

        <div className="field-group">
          <label htmlFor={customInput.id}>
            Custom validation (5 seconds to complete){" "}
            {JSON.stringify(customInput.uiState)} --{" "}
            {JSON.stringify(formValidity.custom)}*
          </label>
          <input type="text" {...customInput.getInputProps()} />
        </div>

        <div>* - Indicates required field</div>

        <div className="input-footer">
          <button type="submit" disabled={uiState.isSubmitting}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

export { SampleForm };
