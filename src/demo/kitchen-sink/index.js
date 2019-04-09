import React from "react";
import { DatePicker } from "./date-picker";
import { useForm } from "../../components/form/use-form";
import {
  validators,
  createValidator,
  validateInputEvents
} from "../../components/form/validators";
import { sleep } from "../utils/async";

const { required, email, mustBeTrue } = validators;
const { onBlur, onSubmit, onChange } = validateInputEvents;

function KitchenSink(props) {
  const { getFormProps, formValues, uiState, api, formValidity } = useForm({
    id: "settingsForm",
    initialState: {
      firstName: "George",
      lastName: "OfTheJungle",
      email: "george@thejungle.com",
      confirmEmail: "george@thejungle.com",
      custom: "custom",
      agreeToTerms: false,
      comments: "",
      favouriteFlavour: "",
      favouriteColours: ["red", "green"],
      cookiesPerDay: null,
      preferredDate: null
    }
  });
  const firstNameInput = api.addInput({
    id: "firstName",
    value: formValues.firstName,
    validators: [{ ...required, when: [onChange, onSubmit] }]
  });
  const lastNameInput = api.addInput({
    id: "lastName",
    value: formValues.lastName,
    validators: [{ ...required, when: [onBlur, onSubmit] }]
  });
  const emailInput = api.addInput({
    id: "email",
    value: formValues.email,
    validators: [
      { ...required, when: [onBlur, onSubmit] },
      {
        ...email,
        when: [onBlur, onSubmit]
      }
    ]
  });
  const confirmEmailValidator = createValidator({
    validateFn: ({ value, formValues }) => value === formValues.email,
    error: "EMAILS_DO_NOT_MATCH"
  });
  const confirmEmailInput = api.addInput({
    id: "confirmEmail",
    value: formValues.confirmEmail,
    validators: [{ ...confirmEmailValidator, when: [onBlur, onSubmit] }]
  });

  const customValidator = createValidator({
    validateFn: async ({ value }) =>
      await new Promise(resolve => {
        setTimeout(() => {
          resolve((value || "").length > 8);
        }, 5000);
      }),
    error: "CUSTOM_ASYNC_ERROR"
  });

  const customInput = api.addInput({
    id: "custom",
    value: formValues.custom,
    validators: [{ ...customValidator, when: [onBlur, onSubmit] }]
  });

  const agreeToTerms = api.addInput({
    id: "agreeToTerms",
    value: formValues.agreeToTerms,
    validators: [{ ...mustBeTrue, when: [onBlur, onSubmit] }]
  });

  const comments = api.addInput({
    id: "comments",
    value: formValues.comments
  });

  const favouriteFlavour = api.addInput({
    id: "favouriteFlavour",
    value: formValues.favouriteFlavour,
    validators: [{ ...required, when: [onBlur, onSubmit] }]
  });

  const favouriteColours = api.addInput({
    id: "favouriteColours",
    value: formValues.favouriteColours,
    validators: [{ ...required, when: [onBlur, onSubmit] }]
  });

  const cookieOptions = [
    { id: "1", value: "1" },
    { id: "10", value: "10" },
    { id: "20", value: "20" }
  ];
  const cookiesPerDay = api.addRadioGroup({
    id: "cookiesPerDay",
    value: formValues.cookiesPerDay,
    validators: [{ ...required, when: [onBlur, onSubmit] }]
  });

  // Not a real reference example of how to validate dates :)
  const dateRangeValidator = createValidator({
    validateFn: ({ value }) => {
      const startDate = new Date(2018, 1, 1);
      const endDate = new Date(2018, 12, 33);
      return value && value >= startDate && value <= endDate;
    },
    error: "DATE_RANGE_ERROR"
  });

  const preferredDate = api.addInput({
    id: "preferredDate",
    value: formValues.preferredDate,
    validators: [
      { ...required, when: [onBlur, onSubmit] },
      { ...dateRangeValidator, when: [onBlur, onSubmit] }
    ]
  });

  const handleOnSubmit = async ({ evt, formValues }) => {
    await sleep(2000);
    console.log("sample-form onSubmit, formValues", formValues);
  };

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
      <form {...getFormProps({ onSubmit: handleOnSubmit })}>
        <div className="field-group">
          <label htmlFor={firstNameInput.id}>
            First name {JSON.stringify(firstNameInput.uiState)} --{" "}
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
            Last name {JSON.stringify(lastNameInput.uiState)} --{" "}
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
            Email address {JSON.stringify(emailInput.uiState)} --{" "}
            {JSON.stringify(formValidity.email)}*
          </label>
          <input
            type="text"
            {...emailInput.getInputProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          />
        </div>

        <div className="field-group">
          <label htmlFor={confirmEmailInput.id}>
            Email address {JSON.stringify(confirmEmailInput.uiState)} --{" "}
            {JSON.stringify(formValidity.confirmEmail)}*
          </label>
          <input
            type="text"
            {...confirmEmailInput.getInputProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          />
        </div>

        <div className="field-group">
          <label htmlFor={customInput.id}>
            Custom validation (5 seconds to complete){" "}
            {JSON.stringify(customInput.uiState)} --{" "}
            {JSON.stringify(formValidity.custom)}*
          </label>
          <input
            type="text"
            {...customInput.getInputProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          />
        </div>

        <div className="field-group">
          <input
            type="checkbox"
            {...agreeToTerms.getCheckProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          />
          <label htmlFor={agreeToTerms.id}>
            Checkbox that must be checked *
          </label>
          {JSON.stringify(agreeToTerms.uiState)} --{" "}
          {JSON.stringify(formValidity.agreeToTerms)}
        </div>

        <div className="field-group">
          <label htmlFor={comments.id}>
            Comments {JSON.stringify(comments.uiState)} --{" "}
          </label>
          <textarea
            {...comments.getInputProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          />
        </div>

        <div className="field-group">
          <label htmlFor={favouriteFlavour.id}>Your favourite flavour *</label>
          {JSON.stringify(favouriteFlavour.uiState)} --{" "}
          {JSON.stringify(formValidity.favouriteFlavour)}
          <select
            {...favouriteFlavour.getInputProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          >
            <option />
            <option value="grapefruit">Grapefruit</option>
            <option value="lime">Lime</option>
            <option value="coconut">Coconut</option>
            <option value="mango">Mango</option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor={favouriteColours.id}>Your favourite colours *</label>
          {JSON.stringify(favouriteColours.uiState)} --{" "}
          {JSON.stringify(formValidity.favouriteColours)}
          <select
            {...favouriteColours.getInputProps()}
            multiple={true}
            disabled={uiState.isSubmitting || uiState.isValidating}
          >
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="yellow">Yellow</option>
          </select>
        </div>

        <fieldset className="field-group">
          <legend>
            How many cookies per day *
            <br />
            {JSON.stringify(cookiesPerDay.uiState)} --{" "}
            {JSON.stringify(formValidity.cookiesPerDay)}
          </legend>
          {cookieOptions.map(cookie => (
            <React.Fragment key={cookie.id}>
              <input
                {...cookiesPerDay.getInputProps({
                  name: "cookiesPerDay",
                  id: `cookiesPerDay_${cookie.id}`,
                  value: cookie.value
                })}
                type="radio"
                checked={cookie.value === formValues.cookiesPerDay}
                disabled={uiState.isSubmitting || uiState.isValidating}
              />
              <label htmlFor={`cookiesPerDay_${cookie.id}`}>
                {cookie.value}
              </label>
            </React.Fragment>
          ))}
        </fieldset>

        <fieldset className="field-group">
          <legend>Select a date from 2018 *</legend>
          <DatePicker
            {...preferredDate.getInputProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          />
          <div>
            {JSON.stringify(preferredDate.uiState)} --{" "}
            {JSON.stringify(formValidity.preferredDate)}
          </div>
        </fieldset>

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

export { KitchenSink };
