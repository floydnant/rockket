import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { tap } from 'rxjs'
import { FormBuilderOptions } from 'src/app/components/molecules/form/types'
import { betterEmailValidator, matchSibling } from 'src/app/components/molecules/form/validators'
import { AppState } from 'src/app/store'
import { accountActions, authActions } from 'src/app/store/user/user.actions'
import { moveToMacroQueue } from 'src/app/utils'
import { getErrorMapUpdates } from '../../../utils/store-helpers'

@Component({
    templateUrl: './account.component.html',
    styles: [],
})
export class SettingsAccountComponent {
    constructor(private store: Store<AppState>, private toast: HotToastService, private actions$: Actions) {
        this.store.dispatch(accountActions.loadEmail({}))
    }

    userState = this.store
        .select(state => state.user)
        .pipe(
            tap(userState =>
                moveToMacroQueue(() =>
                    this.usernameControl.patchValue(userState.me?.username || 'Failed to load username')
                )
            )
        )

    onUploadPhoto() {
        this.toast.info('Profile photos are not yet implemented.')
    }
    onDeleteAccount() {
        const message =
            'Do you really want to delete your account? Everything will be deleted. This action is irreversable!'
        if (!confirm(message)) return

        const password = prompt('Type in your password.')
        if (!password) return

        this.store.dispatch(accountActions.deleteAccount({ password }))
    }
    onLogout() {
        if (confirm('Do you want to logout?')) this.store.dispatch(authActions.logout())
    }

    usernameControl = new FormControl('', [Validators.required, Validators.minLength(8)])
    onUsernameSubmit() {
        if (this.usernameControl.invalid) return

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.store.dispatch(accountActions.updateUsername({ username: this.usernameControl.value! }))
    }

    activeForm: null | 'email' | 'password' = null
    setFormActive(form: typeof this.activeForm) {
        this.activeForm = form
    }

    // @TODO: integrate error messages
    emailFormOptions: FormBuilderOptions = {
        password: {
            type: 'password',
            control: ['', [Validators.required, Validators.minLength(8)]],
        },
        email: {
            name: 'New email address',
            type: 'email',
            control: ['', [Validators.required, betterEmailValidator]],
        },
    }
    onEmailSubmit(dto: { email: string; password: string }) {
        this.store.dispatch(accountActions.updateEmail(dto))
    }
    emailFormErrors$ = getErrorMapUpdates({
        actions$: this.actions$,
        fields: Object.keys(this.emailFormOptions),
        successAction: accountActions.updateEmailSuccess,
        errorAction: accountActions.updateEmailError,
    })

    // @TODO: integrate error messages
    passwordFormOptions: FormBuilderOptions = {
        password: {
            name: 'Old password',
            type: 'password',
            control: ['', [Validators.required, Validators.minLength(8)]],
        },
        newPassword: {
            name: 'New password',
            type: 'password',
            control: ['', [Validators.required, Validators.minLength(8)]],
        },
        confirmNewPassword: {
            name: 'Confirm new password',
            type: 'password',
            control: ['', matchSibling('newPassword')],
            errorMessages: {
                notMatching: 'Passwords must match',
            },
        },
    }
    onPasswordSubmit(dto: { password: string; newPassword: string }) {
        this.store.dispatch(accountActions.updatePassword(dto))
    }
    passwordFormErrors$ = getErrorMapUpdates({
        actions$: this.actions$,
        fields: Object.keys(this.passwordFormOptions),
        successAction: accountActions.updatePasswordSuccess,
        errorAction: accountActions.updatePasswordError,
    })

    onResetPassword() {
        this.store.dispatch(accountActions.resetPassword())
    }
}
