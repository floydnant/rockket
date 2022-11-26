import { Component } from '@angular/core'
import { Validators } from '@angular/forms'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { map } from 'rxjs'
import { FormBuilderOptions } from 'src/app/components/molecules/form/types'
import { betterEmailValidator, matchSibling } from 'src/app/components/molecules/form/validators'
import { SignupCredentialsDto } from 'src/app/models/auth.model'
import { AppState } from 'src/app/store'
import { authActions } from 'src/app/store/user/user.actions'
import { userSelectors } from 'src/app/store/user/user.selectors'
import { getErrorMapUpdates } from '../getErrorMap'

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
    constructor(private store: Store<AppState>, private actions$: Actions) {}

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

    isLoading$ = this.store.select(userSelectors.selectLoginState).pipe(map(({ isLoading }) => isLoading))
    errorMap$ = getErrorMapUpdates({
        actions$: this.actions$,
        fields: Object.keys(this.formOptions),
        successAction: authActions.loginOrSignupSuccess,
        errorAction: authActions.loginOrSignupError,
    })

    callbackUrl?: string

    onSubmit(credentials: SignupCredentialsDto) {
        this.store.dispatch(authActions.signup({ credentials, callbackUrl: this.callbackUrl }))
    }
}
