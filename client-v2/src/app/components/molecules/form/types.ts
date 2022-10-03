import { ValidatorFn, FormControlOptions, AsyncValidatorFn, FormControl } from '@angular/forms'
import { FormValidationErrorMessages } from '../../atoms/input/input.component'

export type FormControlParams = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formState?: any,
    validatorOrOpts?: ValidatorFn | ValidatorFn[] | FormControlOptions | null,
    asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null
]

export interface FormBuilderOptions {
    [name: string]:
        | FormControlParams
        | {
              name?: string
              type?: string
              control: FormControlParams
              errorMessages?: Partial<FormValidationErrorMessages> & Record<string, string>
          }
}

export interface FormInput {
    key: string
    name: string
    type: string
    control: FormControl
    errorMessages: Partial<FormValidationErrorMessages>
}
