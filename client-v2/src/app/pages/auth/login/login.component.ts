import { Component } from '@angular/core'
import { Validators } from '@angular/forms'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { map } from 'rxjs'
import { FormBuilderOptions } from 'src/app/components/molecules/form/types'
import { betterEmailValidator } from 'src/app/components/molecules/form/validators'
import { LoginCredentialsDto } from 'src/app/models/auth.model'
import { AppState } from 'src/app/store'
import { userActions } from 'src/app/store/user/user.actions'
import { userSelectors } from 'src/app/store/user/user.selectors'
import { getErrorMap } from '../getErrorMap'

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
    errorMap$ = getErrorMap(this.actions$, Object.keys(this.formOptions))

    callbackUrl?: string

    onSubmit(credentials: LoginCredentialsDto) {
        this.store.dispatch(userActions.login({ credentials, callbackUrl: this.callbackUrl }))
    }
}
