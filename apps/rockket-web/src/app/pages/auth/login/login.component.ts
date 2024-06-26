import { Component } from '@angular/core'
import { Validators } from '@angular/forms'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { LoginDto } from '@rockket/commons'
import { map } from 'rxjs'
import { FormBuilderOptions } from 'src/app/components/molecules/form/types'
import { betterEmailValidator } from 'src/app/components/molecules/form/validators'
import { AppState } from 'src/app/store'
import { authActions } from 'src/app/store/user/user.actions'
import { userSelectors } from 'src/app/store/user/user.selectors'
import { getErrorMapUpdates } from '../../../utils/store.helpers'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent {
    constructor(private store: Store<AppState>, private actions$: Actions) {}

    formOptions: FormBuilderOptions = {
        email: {
            type: 'email',
            control: ['', [Validators.required, betterEmailValidator]],
            errorMessages: {
                required: 'You must provide your email adress.',
            },
        },
        password: {
            type: 'password',
            control: ['', [Validators.required]],
            errorMessages: {
                required: 'You must provide your password.',
            },
        },
    }

    isLoading$ = this.store.select(userSelectors.selectLoginState).pipe(map(({ isLoading }) => isLoading))
    errorMap$ = getErrorMapUpdates({
        actions$: this.actions$,
        fields: Object.keys(this.formOptions),
        resetAction: authActions.loginOrSignupSuccess,
        errorAction: authActions.loginOrSignupError,
    })

    callbackUrl?: string

    onSubmit(credentials: LoginDto) {
        this.store.dispatch(authActions.login({ credentials, callbackUrl: this.callbackUrl }))
    }
}
