import { Component } from '@angular/core'
import { Validators } from '@angular/forms'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { map } from 'rxjs'
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

    onSubmit(event: SignupCredentialsDto) {
        this.store.dispatch(userActions.signup(event))
    }
}
