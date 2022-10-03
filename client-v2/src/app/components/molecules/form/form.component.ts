import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { moveToMacroQueue } from 'src/app/utils'
import { FormBuilderOptions, FormInput } from './types'

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css'],
})
export class FormComponent implements OnInit, OnChanges {
    ngOnInit() {
        const formOptionEntries = Object.entries(this.formOptions)

        const formControlMap = Object.fromEntries(
            formOptionEntries.map(([inputKey, options]) => {
                if (options instanceof Array) return [inputKey, new FormControl(...options)]
                return [inputKey, new FormControl(...options.control)]
            })
        )

        this.formGroup = new FormGroup(formControlMap)
        this.inputs = formOptionEntries.map(([inputKey, options]) => {
            const defaultName = inputKey[0].toUpperCase() + inputKey.substring(1)
            const defaultErrors = {}
            const defaultType = 'text'

            return {
                key: inputKey,
                name: options instanceof Array ? defaultName : options.name || defaultName,
                type: options instanceof Array ? defaultType : options.type || defaultType,
                control: formControlMap[inputKey],
                errorMessages: options instanceof Array ? defaultErrors : options.errorMessages || defaultErrors,
            }
        })
    }

    @Input() formOptions!: FormBuilderOptions
    @Input() submitButton?: string
    @Input() extraErrorMessages?: Record<string, string[]>

    @Input() containerClasses?: string
    @Input() gridAreas?: string

    @Input() isLoading?: boolean
    ngOnChanges(changes: SimpleChanges) {
        if ('isLoading' in changes) {
            moveToMacroQueue(() => {
                if (this.isLoading) this.formGroup?.disable()
                else this.formGroup?.enable()
            })
        }
    }

    formGroup!: FormGroup
    inputs!: FormInput[]

    @Output() formSubmit = new EventEmitter()
    submit() {
        if (this.formGroup.invalid) {
            Object.values(this.formGroup.controls).forEach(control => control.markAsDirty())
            return
        }

        this.formSubmit.emit(this.formGroup.value)
    }
}
