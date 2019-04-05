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

See [complete demo of all features](https://codesandbox.io/s/9lr6r8z8yw).

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
import { validators } from "validators";
const { required, email } = validators;


const { formValidity, formValues, api } = useForm({
  ...
});

const firstNameInput = api.addInput({
  id: "firstName",
  value: formValues.firstName,
  validators: [{ ...required, when: ["onChange", "onSubmit"] }]
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
import { createValidator } from "validators";

const { formValidity, formValues, api } = useForm({
  ...
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
  validators: [
    { ...customValidator, when: ["onBlur", "onSubmit"], debounce: 1000 }
  ]
});


console.log(formValidity.custom); // returns validity state

```

## Setting up asynchronous validations

- Nothing else needs to be done for asychronous validations, they're
  supported right out of the box

## Handling form submits

- useForm does not block form submits if the form is
  in an invalid state
- This allows you to either submit the form on error
  or suppress submission
