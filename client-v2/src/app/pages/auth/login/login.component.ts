import { Component } from '@angular/core'
import { Validators } from '@angular/forms'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { map } from 'rxjs'
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
    isLoading$ = this.store.select(state => state.user.isLoading)
    errorMap$ = this.actions$.pipe(
        ofType(userActions.loginOrSignupError),
        map(action => {
            let messages: string[]
            if (action.error.message instanceof Array) messages = action.error.message
            else messages = [action.error.message]

            const fields = Object.keys(this.formOptions)

            // const generalErrors: string[] = []
            const errorMap: Record<string, string[]> = {}
            messages.forEach(msg => {
                const fieldName = fields.find(field => new RegExp(field, 'i').test(msg))
                if (fieldName) errorMap[fieldName] = [...(errorMap[fieldName] || []), msg.replace(/^\w+:/, '')]
                // else generalErrors.push(msg)
            })

            return errorMap
        })
    )

    onSubmit(event: LoginCredentialsDto) {
        this.store.dispatch(userActions.login(event))
    }
}
