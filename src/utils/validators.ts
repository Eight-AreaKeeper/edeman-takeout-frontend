import type { FormItemRule } from 'element-plus'

export const PHONE_REGEX = /^1[3-8]\d{9}$/
export const ID_NUMBER_REGEX = /^\d{17}[0-9Xx]$|^\d{15}$/
export const USERNAME_REGEX = /^[a-zA-Z0-9]{3,20}$/
export const PASSWORD_REGEX = /^[0-9A-Za-z]{6,20}$/
export const PRICE_REGEX = /^\d+(\.\d{1,2})?$/

export function requiredRule(message: string): FormItemRule {
  return { required: true, message, trigger: 'blur' }
}

export function patternRule(pattern: RegExp, message: string): FormItemRule {
  return { pattern, message, trigger: 'blur' }
}

export function confirmPasswordRule(getOriginal: () => string, message: string): FormItemRule {
  return {
    validator: (_rule, value: string, callback) => {
      if (value !== getOriginal()) {
        callback(new Error(message))
      } else {
        callback()
      }
    },
    trigger: 'blur',
  }
}
