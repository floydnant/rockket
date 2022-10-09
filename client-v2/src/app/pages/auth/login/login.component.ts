import { Component } from '@angular/core'
import { Validators } from '@angular/forms'
import { Store } from '@ngrx/store'
import { FormBuilderOptions } from 'src/app/components/molecules/form/types'
import { betterEmailValidator } from 'src/app/components/molecules/form/validators'
import { AppState } from 'src/app/store'
import { userActions } from 'src/app/store/user/user.actions'
import { LoginCredentialsDto } from 'src/app/store/user/user.model'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent {
    constructor(private store: Store<AppState>) {}

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
    isLoading$ = this.store.select(state => state.user.isLoading)
    extraErrorMessages: Record<string, string[]> = {}

    onSubmit(event: LoginCredentialsDto) {
        this.store.dispatch(userActions.signup(event))
    }
}
