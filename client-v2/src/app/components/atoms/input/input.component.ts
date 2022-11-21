import { Component, Input, OnInit } from '@angular/core'
import { AbstractControl, FormControl, FormGroup } from '@angular/forms'
import { stripNonWordChars } from 'src/app/utils'
import { defaultErrorMessages } from './error-messages'
import { FormValidationErrorMessages } from './error-messages'

const errorValueKeyMap = {
    minLength: 'requiredLength',
    maxLength: 'requiredLength',
    min: 'min',
    max: 'max',
}

@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.css'],
})
export class InputComponent implements OnInit {
    ngOnInit() {
        this.id ||= stripNonWordChars(this.name)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getErrorMessage(errName: string, errValue: any) {
        const key = errorValueKeyMap[errName as keyof typeof errorValueKeyMap]
        const value = key ? errValue[key] : errValue
        const messages = { ...defaultErrorMessages, ...(this.errorMessages || {}) }

        return messages[errName as keyof FormValidationErrorMessages]
            .replace(/\$value/, value)
            .replace(/\$name/, this.name)
    }

    get errors() {
        return Object.keys({ ...defaultErrorMessages, ...(this.errorMessages || {}) })
    }

    @Input() name!: string
    @Input() type = 'text'
    @Input() id!: string
    @Input() enableLabel = true

    @Input() control!: FormControl | AbstractControl
    get formControl() {
        return this.control as FormControl
    }
    @Input() controlName?: string
    @Input() parentControl?: FormGroup

    @Input() errorMessages?: Partial<FormValidationErrorMessages>
    @Input() extraErrorMessages?: string[]
}
