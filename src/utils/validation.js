import * as yup from 'yup'

export const passwordRules = yup
  .string()
  .required('Password required')
  .min(8, 'Use at least 8 characters')
  .matches(/[A-Za-z]/, 'Include at least one letter')
  .matches(/\d/, 'Include at least one number')

export const phoneRules = yup
  .string()
  .trim()
  .required('Phone number required')
  .matches(/^\+?[0-9 ]{10,16}$/, 'Phone number invalid')

// Converts '' from number inputs into undefined so `required` messages show.
export const numberField = (label) =>
  yup
    .number()
    .transform((v, orig) => (orig === '' || orig === null ? undefined : v))
    .typeError(`${label} must be a number`)
