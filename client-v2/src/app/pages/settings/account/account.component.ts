import { DialogRef } from '@angular/cdk/dialog'
import { Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { Observable, tap } from 'rxjs'
import { FormBuilderOptions } from 'src/app/components/molecules/form/types'
import { betterEmailValidator, matchSibling } from 'src/app/components/molecules/form/validators'
import { DialogService } from 'src/app/modal/dialog.service'
import { AppState } from 'src/app/store'
import { accountActions, authActions } from 'src/app/store/user/user.actions'
import { userFeature } from 'src/app/store/user/user.selectors'
import { moveToMacroQueue } from 'src/app/utils'
import { getErrorMapUpdates, getLoadingUpdates } from '../../../utils/store.helpers'

@Component({
    templateUrl: './account.component.html',
    styles: [],
})
export class SettingsAccountComponent implements OnDestroy {
    constructor(
        private store: Store<AppState>,
        private toast: HotToastService,
        private actions$: Actions,
        private dialogService: DialogService
    ) {
        this.store.dispatch(accountActions.loadEmail({}))
    }
    ngOnDestroy(): void {
        this.usernameSuccessActionSubscription.unsubscribe()
        this.emailOrPasswordSuccessActionSubscription.unsubscribe()
    }

    userState = this.store.select(userFeature).pipe(
        tap(userState =>
            moveToMacroQueue(() => {
                this.usernameFromStore = userState.me?.username || 'Failed to load username'
                this.usernameControl.patchValue(this.usernameFromStore)
            })
        )
    )

    onUploadPhoto() {
        // @TODO: implement this
        this.toast.info('Profile photos are not yet implemented.')
    }
    onDeleteAccount() {
        // @TODO: implement this with cdk stepper
        const dialogRef = this.dialogService.confirm({
            title: 'Delete account',
            text: `Are you sure you want to delete your account? All data associated with your account will be lost. This action cannot be undone.`,
            buttons: [
                { text: 'Cancel' },
                {
                    text: 'I understand, delete',
                    resCode: 'Delete',
                    className: 'button--danger',
                },
            ],
        })

        dialogRef.closed.subscribe(res => {
            if (res != 'Delete') return

            moveToMacroQueue(() => {
                const password = prompt('Type in your password.')
                if (!password) return

                this.store.dispatch(accountActions.deleteAccount({ password }))
            })
        })
    }
    onLogout() {
        this.store.dispatch(authActions.logout())
    }

    @ViewChild('emailForm') emailForm!: TemplateRef<HTMLElement>
    @ViewChild('passwordForm') passwordForm!: TemplateRef<HTMLElement>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modalRef: null | DialogRef<any, any> = null
    openFormModal(form: 'email' | 'password') {
        const formRefMap = {
            email: this.emailForm,
            password: this.passwordForm,
        }

        this.modalRef = this.dialogService.open(formRefMap[form], {})
        this.modalRef.closed.subscribe(() => (this.modalRef = null))
    }
    closeFormModal() {
        this.modalRef?.close()
    }
    emailOrPasswordSuccessActionSubscription = this.actions$
        .pipe(ofType(accountActions.updateEmailSuccess, accountActions.updatePasswordSuccess))
        .subscribe(() => this.closeFormModal())

    /////////////////// Username Form ///////////////////
    usernameControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(35)])
    usernameFromStore!: string
    onUsernameSubmit() {
        if (this.usernameControl.invalid) return

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.store.dispatch(accountActions.updateUsername({ username: this.usernameControl.value! }))
    }
    resetUsername() {
        this.usernameControl.reset()
        this.usernameControl.patchValue(this.usernameFromStore)
    }
    usernameFormLoading$ = getLoadingUpdates(this.actions$, [
        accountActions.updateUsername,
        accountActions.updateUsernameSuccess,
        accountActions.updateUsernameError,
    ]).pipe(
        tap(isLoading => {
            if (isLoading) this.usernameControl.disable()
            else this.usernameControl.enable()
        })
    )
    usernameSuccessActionSubscription = this.actions$
        .pipe(ofType(accountActions.updateUsernameSuccess))
        .subscribe(() => this.usernameControl.markAsPristine())

    /////////////////// Email Form ///////////////////
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
    onEmailFormSubmit(dto: { email: string; password: string }) {
        this.store.dispatch(accountActions.updateEmail(dto))
    }
    emailFormLoading$: NonNullable<Observable<boolean>> = getLoadingUpdates(this.actions$, [
        accountActions.updateEmail,
        accountActions.updateEmailSuccess,
        accountActions.updateEmailError,
    ])
    emailFormErrors$ = getErrorMapUpdates({
        actions$: this.actions$,
        fields: Object.keys(this.emailFormOptions),
        resetAction: accountActions.updateEmailSuccess,
        errorAction: accountActions.updateEmailError,
    })

    /////////////////// Password Form ///////////////////
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
    onPasswordFormSubmit(dto: { password: string; newPassword: string }) {
        this.store.dispatch(accountActions.updatePassword(dto))
    }
    passwordFormLoading$ = getLoadingUpdates(this.actions$, [
        accountActions.updatePassword,
        accountActions.updatePasswordSuccess,
        accountActions.updatePasswordError,
    ])
    passwordFormErrors$ = getErrorMapUpdates({
        actions$: this.actions$,
        fields: Object.keys(this.passwordFormOptions),
        resetAction: accountActions.updatePasswordSuccess,
        errorAction: accountActions.updatePasswordError,
    })

    onResetPassword() {
        this.store.dispatch(accountActions.resetPassword())
    }
}
