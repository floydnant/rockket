import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { betterEmailValidator, matchSibling } from 'src/app/components/molecules/form/validators'
import { FormBuilderOptions } from 'src/app/components/molecules/form/types'

@Component({
    selector: 'component-playground',
    templateUrl: './component-playground.component.html',
    styleUrls: ['./component-playground.component.css'],
})
export class ComponentPlaygroundComponent {
    fullnameControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(35)])

    formOptions: FormBuilderOptions = {
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(35)]],
        email: {
            type: 'email',
            control: ['', [Validators.required, betterEmailValidator]],
        },
        age: {
            name: 'Age (years old)',
            type: 'number',
            control: ['', [Validators.required, Validators.min(18)]],
            errorMessages: {
                min: 'You must be at least $value years old.',
            },
        },
        password: {
            name: 'New Password',
            type: 'password',
            control: ['', [Validators.required, Validators.minLength(8)]],
        },
        confirmPassword: {
            name: 'Confirm password',
            type: 'password',
            control: ['', matchSibling('password')],
            errorMessages: {
                notMatching: 'Passwords must match',
            },
        },
    }

    onSubmit(value: Record<string, string>) {
        console.log(value)
        this.isLoading = true
        setTimeout(() => {
            this.isLoading = false
        }, 4000)
    }
    isLoading = false
}
