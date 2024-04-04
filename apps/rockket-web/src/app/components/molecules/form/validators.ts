import { UntypedFormControl, ValidatorFn } from '@angular/forms'

/**
 * Validator for comparing to another form control's value in a group
 * @param otherValueKey
 */
export const matchSibling =
    (otherValueKey: string): ValidatorFn =>
    control => {
        const otherValue = (control as UntypedFormControl).parent?.get(otherValueKey)?.value
        return control.value === otherValue ? null : { notMatching: true }
    }

export const betterEmailValidator: ValidatorFn = control => {
    // eslint-disable-next-line no-useless-escape
    const emailRegex = /^[\w\d\-\.]+@([\w\-]+\.)+\w+$/i
    return emailRegex.test(control.value) ? null : { email: true }
}
