# react-hooks-form-util

[![Build Status](https://travis-ci.com/shanplourde/react-hooks-form-util.svg?branch=master)](https://travis-ci.com/shanplourde/react-hooks-form-util) [![codecov](https://codecov.io/gh/shanplourde/react-hooks-form-util/branch/master/graph/badge.svg)](https://codecov.io/gh/shanplourde/react-hooks-form-util) [![dependencies](https://david-dm.org/shanplourde/react-hooks-form-util.svg)](https://codecov.io/gh/shanplourde/react-hooks-form-util) [![devDependencies](https://david-dm.org/shanplourde/react-hooks-form-util/dev-status.svg)](https://codecov.io/gh/shanplourde/react-hooks-form-util)

`react-hooks-form-util` is a simple to use forms API based on React hooks. It only provides the functional aspects of forms. It's up to you to develop your UI as you see fit, and simply integrate your UI with the hooks.

This library supports the following:

- Form state management
- Form field validations
- Form submission
- Form field state management

## Features

- Doesn't require you to develop functional React UI components - you can continue to use your class based components
- ~~Thoroughly~~ Somewhat unit tested 😃
- Supports asynchronous validations on blur, on change, and on submit
- Supports standard HTML inputs such as:
  - Text inputs (input type text, textareas)
  - Radio button groups
  - Checkboxes
  - Multi-selects
- Supports custom components
- Supports custom validations
- Inputs support pristine and visited state
- Dynamically add or remove form fields
  to/from existing forms
- Easy to get started!

## Motivation and inception

See [my multi-part article series for background](https://medium.com/@shanplourde/react-hooks-designing-a-simple-forms-api-part-1-307b04bc6007). I took it upon myself to develop this forms library as a part of learning a bit about [React hooks](https://reactjs.org/docs/hooks-intro.html) since I believe that hooks are a better way to develop React components.

## Demo

See [complete demo of all features](https://codesandbox.io/s/github/shanplourde/react-hooks-form-util).

# Getting started

## Installation

This is not an NPM package at this time. Two install options you can:

- `npm install --save https://github.com/shanplourde/react-hooks-form-util#master`
- Copy the source code under `src/components/form` into your project and run with it

## Setting up your initial form state

Call `useForm` and pass the form id along with your form's initial state.

- `useForm` returns your form's current state under the `inputValues` object.
- `useForm` returns `getFormProps`, which you need to expand onto your `form` tag
- Your `onSubmit` gets called by the `useForm` hook,
  via the `getFormProps` that you expand onto your form tag

```javascript
import { useForm } from "form/use-form";

const { inputValues, getFormProps } = useForm({
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

console.log(inputValues.firstName); // George

///

const onSubmit = async ({ evt, inputValues }) => {
  await sleep(2000);
  console.log("onSubmit was called", inputValues);
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

const { inputValues, api } = useForm({
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
  value: inputValues.firstName
});

//
<div className="field-group">
  <label htmlFor={firstNameInput.id}>
    First name {JSON.stringify(inputUiState.firstName)} --{" "}
    {JSON.stringify(formValidity.firstName)} *
  </label>
  <input type="text" {...firstNameInput.getInputProps()} />


```

## Removing input fields

- Call `api.removeInput` to remove an existing input field
- Removing an input field removes all state associated with the
  input, such validation state, input value, etc.
- The **demo/dynamic-form** example shows how to add
  and remove form fields dynamically to an already
  rendered form

```javascript
/// Add your inputs, say an input with id = firstName

api.removeInput("firstName");
```

## Setting up validations

- Pass a `validators` array to `api.addInput`
- See `validators.js` for out of the box validations
  (currently `required`, `email`, `mustBeTrue`)
- For each validator, specify the `when` array, which
  indicates when validators fire. Validators
  can be fired `onBlur`, `onSubmit`, and `onChange`
- Validity state is not set for form fields that
  don't specify validity
- Validity state is only set once a validation
  has run
- `useForm` returns a `formValidity` object. Each
  key is an input id. Each value is an array of
  validation errors

```javascript
import { validators, validateInputEvents } from "validators";
const { required, email } = validators;

const { onBlur, onSubmit, onChange } = validateInputEvents;

const { formValidity, inputValues, api } = useForm({
  ...
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

const { formValidity, inputValues, api } = useForm({
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
  value: inputValues.custom,
  validators: [{ ...customValidator, when: [onBlur, onSubmit] }]
});


console.log(formValidity.custom); // returns validity state

```

## Validating one form field against another

- When creating a custom validator with `createValidator`,
  `validateFn` receives a `inputValues` argument that allows you to
  compare a form field against all other values in the current form

```javascript
import { createValidator, validateInputEvents } from "validators";

const { onBlur, onSubmit } = validateInputEvents;

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
  validateFn: ({ value, inputValues }) =>
    value === inputValues.email;
  },
  error: "EMAILS_DO_NOT_MATCH"
});

const confirmEmailInput = api.addInput({
  id: "confirmEmail",
  value: inputValues.confirmEmail,
  validators: [{ ...confirmEmailValidator, when: [onBlur, onSubmit] }]
});

```

## Setting up asynchronous validations

- Nothing else needs to be done for asynchronous validations, they're
  supported right out of the box
- The custom validator below is one example

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

## Deciding when validators should fire

- When defining your `when` condition for validators, you can choose from the events `onBlur`, `onChange`, and `onSubmit`
- In addition, you can define your own custom expression with
  `evaluateCondition` that decides if your validator should trigger
- Predefined evaluateConditions:
  - `evaluateConditions.rewardEarlyValidateLate`: Returns true if the
    `formValidity` for the given input is false
- evaluateCondition functions receive `{ id, inputValues, formValidity }` as
  - `id` is the given input's id
  - `inputValues` are the given form's input values
  - `formValidity` is the current form's input validity

```javascript
import { validators, validateInputEvents, evaluateConditions } from "validators";
const { required, email } = validators;

const { onBlur, onSubmit, onChange } = validateInputEvents;

const { formValidity, inputValues, api } = useForm({
  ...
});

// Example of using the stock evaluateConditions.rewardEarlyValidateLate
// evaluator with the onChange event:
const firstNameInput = api.addInput({
  id: "firstName",
  value: inputValues.firstName,
  validators: [
    {
      ...required,
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

// Example of using a custom evaluateCondition
// evaluator with the onChange event. evaluateCondition
// returns true, so the validation is always evaluated
// onChange
const firstNameInput = api.addInput({
  id: "firstName",
  value: inputValues.firstName,
  validators: [
    {
      ...required,
      when: [
        {
          eventType: onChange,
          evaluateCondition: ({ id, inputValues, formValidity }) => true
        },
        onBlur,
        onSubmit
      ]
    }
  ]
});

```

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
const { getFormProps, inputValues, uiState, formValidity } = useForm({
  id: "settingsForm",
  initialState: {
    firstName: "George",
    lastName: "OfTheJungle"
    ///
  }
});

const handleOnSubmit = async ({ evt, inputValues }) => {
  await sleep(2000);
  console.log("sample-form onSubmit, inputValues", inputValues);
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

## Tracking input visited and pristine state

`useForm`'s `api.addInput` returns an input with a `uiState` property. You can use this to get the input's visited and pristine state.

`visited` is set to true whenever an input receives focus.

`pristine` is set to false whenever an input's value changes from its original value. `pristine` can be set to `false`, then `true` should the user change the input value back to its original value.

```javascript
const firstNameInput = api.addInput({
  id: "firstName",
  value: inputValues.firstName,
  validators: [{ ...required, when: [onChange, onSubmit] }]
});

console.log(firstNameInput.uiState); // { visited: false, pristine: true }
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

## Asynchronous validation behaviour

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

## Contributing, comments, etc.

Feel free to [open an issue](https://github.com/shanplourde/react-hooks-form-util/issues) to raise questions, bugs, suggestions, etc.
