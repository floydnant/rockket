export interface FormValidationErrorMessages {
    required: string
    minLength: string
    maxLength: string
    min: string
    max: string
    email: string
    pattern: string
}

export const defaultErrorMessages: FormValidationErrorMessages = {
    required: '$name is required.',
    email: 'Must be a valid email address.',
    minLength: 'Must be at least $value characters long.',
    maxLength: 'Must not be longer than $value characters.',
    min: 'Must be at least $value.',
    max: 'Must not be higher than $value.',
    pattern: 'Must match the pattern.',
}
