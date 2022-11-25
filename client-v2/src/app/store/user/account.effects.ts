import { Injectable } from '@angular/core'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { map, mergeMap, of } from 'rxjs'
import { UserService } from 'src/app/services/user.service'
import { AppState } from '..'
import { appActions } from '../app.actions'
import { accountActions, authActions } from './user.actions'
import { UserState } from './user.model'

@Injectable()
export class UserAccountEffects {
    constructor(
        private actions$: Actions,
        private userService: UserService,
        private toast: HotToastService,
        private store: Store<AppState>
    ) {
        this.store.subscribe(state => (this.userState = state.user))
    }

    userState: UserState | null = null

    updateUsername = createEffect(() => {
        return this.actions$.pipe(
            ofType(accountActions.updateUsername),
            mergeMap(dto => {
                const res$ = this.userService.updateUsername(dto)

                return res$.pipe(
                    this.toast.observe({
                        loading: 'Updating username...',
                        success: res => res.successMessage,
                        error: err => err.error.message,
                    }),
                    map(() => accountActions.updateUsernameSuccess(dto))
                )
            })
        )
    })

    updateEmail = createEffect(() => {
        return this.actions$.pipe(
            ofType(accountActions.updateEmail),
            mergeMap(dto => {
                const res$ = this.userService.updateEmail(dto)

                return res$.pipe(
                    this.toast.observe({
                        loading: 'Updating email...',
                        success: res => res.successMessage,
                        error: err => err.error.message,
                    }),
                    map(() => accountActions.updateEmailSuccess({ email: dto.email }))
                )
            })
        )
    })

    updatePassword = createEffect(() => {
        return this.actions$.pipe(
            ofType(accountActions.updatePassword),
            mergeMap(dto => {
                const res$ = this.userService.updatePassword(dto)

                return res$.pipe(
                    this.toast.observe({
                        loading: 'Updating password...',
                        success: res => res.successMessage,
                        error: err => err.error.message,
                    }),
                    map(() => accountActions.updatePasswordSuccess())
                )
            })
        )
    })

    resetPassword = createEffect(() => {
        return this.actions$.pipe(
            ofType(accountActions.resetPassword),
            mergeMap(() => {
                this.toast.info('Resetting passwords is not yet supported.')
                return of(appActions.nothing())
                // const res$ = this.userService.resetPassword()

                // return res$.pipe(
                //     this.toast.observe({
                //         loading: 'Resetting your password...',
                //         success: res => res.successMessage,
                //         error: err => err.error.message,
                //     }),
                //     map(() => userActions.deleteAccountSuccess())
                // )
            })
        )
    })

    deleteAccount = createEffect(() => {
        return this.actions$.pipe(
            ofType(accountActions.deleteAccount),
            mergeMap(({ password }) => {
                const res$ = this.userService.deleteAccount({ password })

                return res$.pipe(
                    this.toast.observe({
                        loading: 'Deleting your account...',
                        success: res => res.successMessage,
                        error: err => err.error.message,
                    }),
                    map(() => accountActions.deleteAccountSuccess())
                )
            })
        )
    })
    forwardDeleteAccount = createEffect(() =>
        this.actions$.pipe(
            ofType(accountActions.deleteAccountSuccess),
            map(() => authActions.logout())
        )
    )

    loadEmail = createEffect(() => {
        return this.actions$.pipe(
            ofType(accountActions.loadEmail),
            mergeMap(({ ignoreCache }) => {
                if (this.userState?.me?.email) {
                    if (!ignoreCache) return of(appActions.nothing())
                }
                const res$ = this.userService.loadEmail()

                return res$.pipe(map(({ email }) => accountActions.loadEmailSuccess({ email })))
            })
        )
    })
}
