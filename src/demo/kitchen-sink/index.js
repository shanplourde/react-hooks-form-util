import React from "react";
import { DatePicker } from "./date-picker";
import { useForm } from "../../components/form/use-form";
import { validators, createValidator } from "../../components/form/validators";
import { sleep } from "../utils/async";

const { required, email, mustBeTrue } = validators;

function KitchenSink(props) {
  const { getFormProps, formValues, uiState, api, formValidity } = useForm(
    "settingsForm",
    {
      firstName: "George",
      lastName: "OfTheJungle",
      email: "george@thejungle.com",
      custom: "custom",
      agreeToTerms: false,
      comments: "",
      favouriteFlavour: "",
      favouriteColours: ["red", "green"],
      cookiesPerDay: null,
      preferredDate: null
    }
  );
  const firstNameInput = api.addInput({
    id: "firstName",
    value: formValues.firstName,
    validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
  });
  const lastNameInput = api.addInput({
    id: "lastName",
    value: formValues.lastName,
    validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
  });
  const emailInput = api.addInput({
    id: "email",
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
    id: "custom",
    value: formValues.custom,
    validators: [{ ...customValidator, when: ["onBlur", "onSubmit"] }]
  });

  const agreeToTerms = api.addInput({
    id: "agreeToTerms",
    value: formValues.agreeToTerms,
    validators: [{ ...mustBeTrue, when: ["onBlur", "onSubmit"] }]
  });

  const comments = api.addInput({
    id: "comments",
    value: formValues.comments
  });

  const favouriteFlavour = api.addInput({
    id: "favouriteFlavour",
    value: formValues.favouriteFlavour,
    validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
  });

  const favouriteColours = api.addInput({
    id: "favouriteColours",
    value: formValues.favouriteColours,
    validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
  });

  const cookieOptions = [
    { id: "1", value: "1" },
    { id: "10", value: "10" },
    { id: "20", value: "20" }
  ];
  const cookiesPerDay = api.addRadioGroup({
    id: "cookiesPerDay",
    value: formValues.cookiesPerDay,
    validators: [{ ...required, when: ["onBlur", "onSubmit"] }]
  });

  // Not a real reference example of how to validate dates :)
  const dateRangeValidator = createValidator({
    validateFn: date => {
      const startDate = new Date(2018, 1, 1);
      const endDate = new Date(2018, 12, 33);
      return date && date >= startDate && date <= endDate;
    },
    error: "DATE_RANGE_ERROR"
  });

  const preferredDate = api.addInput({
    id: "preferredDate",
    value: formValues.preferredDate,
    validators: [
      { ...required, when: ["onBlur", "onSubmit"] },
      { ...dateRangeValidator, when: ["onBlur", "onSubmit"] }
    ]
  });

  const onSubmit = async ({ evt, formValues }) => {
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

        <div className="field-group">
          <input type="checkbox" {...agreeToTerms.getCheckProps()} />
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
          <textarea {...comments.getInputProps()} />
        </div>

        <div className="field-group">
          <label htmlFor={favouriteFlavour.id}>Your favourite flavour *</label>
          {JSON.stringify(favouriteFlavour.uiState)} --{" "}
          {JSON.stringify(formValidity.favouriteFlavour)}
          <select {...favouriteFlavour.getInputProps()}>
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
          <select {...favouriteColours.getInputProps()} multiple={true}>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="yellow">Yellow</option>
          </select>
        </div>

        <fieldset
          className="field-group"
          {...cookiesPerDay.getInputProps({
            id: "cookiesPerDay"
          })}
        >
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
              />
              <label htmlFor={`cookiesPerDay_${cookie.id}`}>
                {cookie.value}
              </label>
            </React.Fragment>
          ))}
        </fieldset>

        <fieldset className="field-group">
          <legend>Select a date from 2018 *</legend>
          <DatePicker {...preferredDate.getInputProps()} />
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
