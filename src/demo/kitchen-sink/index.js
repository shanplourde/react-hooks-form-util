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
  const {
    getFormProps,
    inputValues,
    uiState,
    api,
    formValidity,
    inputUiState
  } = useForm({
    id: "kitchenSinkForm",
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
    value: inputValues.firstName,
    validators: [{ ...required, when: [onChange, onSubmit] }]
  });
  const lastNameInput = api.addInput({
    id: "lastName",
    value: inputValues.lastName,
    validators: [{ ...required, when: [onBlur, onSubmit] }]
  });
  const emailInput = api.addInput({
    id: "email",
    value: inputValues.email,
    validators: [
      { ...required, when: [onBlur, onSubmit] },
      {
        ...email,
        when: [onBlur, onSubmit]
      }
    ]
  });
  const confirmEmailValidator = createValidator({
    validateFn: ({ value, inputValues }) => value === inputValues.email,
    error: "EMAILS_DO_NOT_MATCH"
  });
  const confirmEmailInput = api.addInput({
    id: "confirmEmail",
    value: inputValues.confirmEmail,
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
    value: inputValues.custom,
    validators: [{ ...customValidator, when: [onBlur, onSubmit] }]
  });

  const agreeToTerms = api.addInput({
    id: "agreeToTerms",
    value: inputValues.agreeToTerms,
    validators: [{ ...mustBeTrue, when: [onBlur, onSubmit] }]
  });

  const comments = api.addInput({
    id: "comments",
    value: inputValues.comments
  });

  const favouriteFlavour = api.addInput({
    id: "favouriteFlavour",
    value: inputValues.favouriteFlavour,
    validators: [{ ...required, when: [onBlur, onSubmit] }]
  });

  const favouriteColours = api.addInput({
    id: "favouriteColours",
    value: inputValues.favouriteColours,
    validators: [{ ...required, when: [onBlur, onSubmit] }]
  });

  const cookieOptions = [
    { id: "1", value: "1" },
    { id: "10", value: "10" },
    { id: "20", value: "20" }
  ];
  const cookiesPerDay = api.addRadioGroup({
    id: "cookiesPerDay",
    value: inputValues.cookiesPerDay,
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
    value: inputValues.preferredDate,
    validators: [
      { ...required, when: [onBlur, onSubmit] },
      { ...dateRangeValidator, when: [onBlur, onSubmit] }
    ]
  });

  const handleOnSubmit = async ({ evt, inputValues }) => {
    await sleep(2000);
    console.log("sample-form onSubmit, inputValues", inputValues);
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

        <div className="field-group">
          <label htmlFor={confirmEmailInput.id}>
            Email address {JSON.stringify(inputUiState.confirmEmail)} --{" "}
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
            {JSON.stringify(inputUiState.custom)} --{" "}
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
          {JSON.stringify(inputUiState.agreeToTerms)} --{" "}
          {JSON.stringify(formValidity.agreeToTerms)}
        </div>

        <div className="field-group">
          <label htmlFor={comments.id}>
            Comments {JSON.stringify(inputUiState.comments)} --{" "}
          </label>
          <textarea
            {...comments.getInputProps()}
            disabled={uiState.isSubmitting || uiState.isValidating}
          />
        </div>

        <div className="field-group">
          <label htmlFor={favouriteFlavour.id}>Your favourite flavour *</label>
          {JSON.stringify(inputUiState.favouriteFlavour)} --{" "}
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
          {JSON.stringify(inputUiState.favouriteColours)} --{" "}
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
            {JSON.stringify(inputUiState.cookiesPerDay)} --{" "}
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
                checked={cookie.value === inputValues.cookiesPerDay}
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
            {JSON.stringify(inputUiState.preferredDate)} --{" "}
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
