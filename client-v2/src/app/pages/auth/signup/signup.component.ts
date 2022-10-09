import { Component } from '@angular/core'
import { Validators } from '@angular/forms'
import { Store } from '@ngrx/store'
import { FormBuilderOptions } from 'src/app/components/molecules/form/types'
import { betterEmailValidator, matchSibling } from 'src/app/components/molecules/form/validators'
import { AppState } from 'src/app/store'
import { userActions } from 'src/app/store/user/user.actions'
import { SignupCredentialsDto } from 'src/app/store/user/user.model'

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
    constructor(private store: Store<AppState>) {}

    formOptions: FormBuilderOptions = {
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(35)]],
        email: {
            type: 'email',
            control: ['', [Validators.required, betterEmailValidator]],
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
    isLoading$ = this.store.select(state => state.user.isLoading)
    extraErrorMessages: Record<string, string[]> = {}

    onSubmit(event: SignupCredentialsDto) {
        this.store.dispatch(userActions.signup(event))
    }
}
