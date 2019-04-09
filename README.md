# react-hooks-form-util

`react-hooks-form-util` is a simple to use forms API based on React hooks. It only provides the functional aspects of forms. It's up to you to develop your UI as you see fit, and simply integrate your UI with the hooks.

This library supports the following:

- Form state management
- Form field validations
- Form submission

## Features

- Doesn't require you to develop functional React UI components - you can continue to use your class based components
- Thoroughly unit tested
- Supports asynchronous validations on blur, on change, and on submit
- Supports standard HTML inputs such as:
  - Text inputs (input type text, textareas)
  - Radio button groups
  - Checkboxes
  - Multi-selects
- Supports custom components
- Supports custom validations
- Easy to get started!

## Motivation and inception

See [my multi-part article series for background](https://medium.com/@shanplourde/react-hooks-designing-a-simple-forms-api-part-1-307b04bc6007). I took it upon myself to develop this forms library as a part of learning about [React hooks](https://reactjs.org/docs/hooks-intro.html) since I believe that hooks are a better way to develop React components.

## Demo

See [complete demo of all features](https://codesandbox.io/s/github/shanplourde/react-hooks-form-util).

# Getting started

## Installation

This is not an NPM package at this time. Two install options you have:

- `npm install --save https://github.com/shanplourde/react-hooks-form-util#master`
- Copy the source code under `src/components/form` into your project and run with it

## Setting up your initial form state

Call `useForm` and pass the form id along with your form's initial state.

- `useForm` returns your form's current state under the `formValues` object.
- `useForm` returns `getFormProps`, which you need to expand onto your `form` tag
- Your `onSubmit` gets called by the `useForm` hook,
  via the `getFormProps` that you expand onto your form tag

```javascript
import { useForm } from "form/use-form";

const { formValues, getFormProps } = useForm({
  id: "settingsForm",
  initialState: {
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
});

console.log(formValues.firstName); // George

///

const onSubmit = async ({ evt, formValues }) => {
  await sleep(2000);
  console.log("onSubmit was called", formValues);
};

///

<form {...getFormProps({ onSubmit })}>

```

## Setting up form fields

`useForm` returns an API that you can use to configure your form's inputs.

- Call `api.addInput` to define your input
- Call `api.addRadioGroup` to add a radio button group (this will probably be rolled into `api.addInput`).
- Expand `getInputProps` onto your inputs

```javascript
import { useForm } from "form/use-form";

const { formValues, api } = useForm({
  id: "settingsForm",
  initialState: {
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
});

const firstNameInput = api.addInput({
  id: "firstName",
  value: formValues.firstName
});

//
<div className="field-group">
  <label htmlFor={firstNameInput.id}>
    First name {JSON.stringify(firstNameInput.uiState)} --{" "}
    {JSON.stringify(formValidity.firstName)} *
  </label>
  <input type="text" {...firstNameInput.getInputProps()} />


```

## Setting up validations

- `useForm` returns a `formValidity` object. Each
  key is an input id. Each value is an array of
  validation errors
- Pass a `validators` array to `api.addInput`
- See validators.js for out of the box validations
  (currently `required`, `email`, `mustBeTrue`)
- For each validator, specify the `when` array, which
  indicates when validators fire. Validators
  can be fired `onBlur`, `onSubmit`, and `onChange`
- Validity state is not set for form fields that
  don't specify validity
- Validity state is only set once a validation
  has run

```javascript
import { validators, validateInputEvents } from "validators";
const { required, email } = validators;

const { onBlur, onSubmit, onChange } = validateInputEvents;

const { formValidity, formValues, api } = useForm({
  ...
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

//

console.log('formValidity', formValidity, formValidity.lastName)
```

## Setting up custom validations

- Import `createValidator` and pass an object with a
  `validationFn` property, representing your validation function.
  Your validation function receives the input value
- Pass an `error` property, which is the key
  that you can use to determine what validation errors
  triggered for a given input

```javascript
import { createValidator, validateInputEvents } from "validators";

const { onBlur, onSubmit } = validateInputEvents;

const { formValidity, formValues, api } = useForm({
  ...
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


console.log(formValidity.custom); // returns validity state

```

## Validating one form field against another

- When creating a custom validator with `createValidator`,
  `validateFn` receives a `formValues` argument that allows you to
  compare a form field against all other values in the current form

```javascript
import { createValidator, validateInputEvents } from "validators";

const { onBlur, onSubmit } = validateInputEvents;

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
  validateFn: ({ value, formValues }) =>
    value === formValues.email;
  },
  error: "EMAILS_DO_NOT_MATCH"
});

const confirmEmailInput = api.addInput({
  id: "confirmEmail",
  value: formValues.confirmEmail,
  validators: [{ ...confirmEmailValidator, when: [onBlur, onSubmit] }]
});

```

## Setting up asynchronous validations

- Nothing else needs to be done for asynchronous validations, they're
  supported right out of the box
- The custom validator shown below could be used the same way
  as any other validator

```javascript
const customValidator = createValidator({
  validateFn: async ({ value }) =>
    await new Promise(resolve => {
      setTimeout(() => {
        resolve((value || "").length > 8);
      }, 5000);
    }),
  error: "CUSTOM_ASYNC_ERROR"
});
```

## Asynchronous validations

### Consecutive or concurrent async validations - same input value

- Each blur / change event on an input requests new asynchronous validations
- However if an input's value is the same, the new validation request is
  ignored, allowing the original validation request to complete. This should
  optimize the user experience
- In the future, this may be an option that you can opt out of, in case
  you need an asynchronous validation that depends on other form field values

### Consecutive or concurrent async validations - different input value

- Each blur / change event on an input requests new asynchronous validations
- When the latest input value is different from the previous, a new
  asynchronous validation request is kicked off
- Previously ran validation requests are ignored, but any asynchronous
  activity they are performing is not cancelled

## Handling form submits

- useForm does not block form submits if the form is
  in an invalid state
- This allows you to either submit the form on error,
  prevent submission, or check if critical validations
  passed before submission, for example
- All validations are executed before your custom
  `onSubmit` form is invoked
- `formValidity` and uiState.isValid are set before your custom `onSubmit`
  is executed

```javascript
const { getFormProps, formValues, uiState, formValidity } = useForm({
  id: "settingsForm",
  initialState: {
    firstName: "George",
    lastName: "OfTheJungle"
    ///
  }
});

const handleOnSubmit = async ({ evt, formValues }) => {
  await sleep(2000);
  console.log("sample-form onSubmit, formValues", formValues);
  if (uiState.isValid || formValidity.firstName.isValid) {
    // Guess we're ok with just first name being valid, let's submit our form
  }
};

<form {...getFormProps({ onSubmit: handleOnSubmit })} />;
```

## Tracking overall form state with uiState

- `useForm` returns a `uiState` property that allows you to track the following:
  - `isValidating`: is form getting validated
  - `isSubmitting`: is form getting submitted
  - `isValid`: is form valid

A submit button could therefore be disabled, or a modal overal perhaps displayed, if the form
was being validated or submitted.

```javascript
<div className="input-footer">
  <button type="submit" disabled={uiState.isSubmitting || uiState.isValidating}>
    Save
  </button>
  {uiState.isSubmitting || (uiState.isValidating && <p>Submitting...</p>)}
</div>
```

## Error handling

### Custom form `onSubmit` errors

- useForm doesn't handle custom onSubmit errors, you'll have to handle
  these

### Custom validation errors

- When a custom validation throws an error, the validator's state
  is set to `isValue = true`, and a property
  called `undeterminedValidations` is set that includes the
  validation name (error key), and error details
