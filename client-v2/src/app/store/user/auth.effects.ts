import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects'
import { catchError, map, mergeMap, Observable, of, tap } from 'rxjs'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { DialogService } from 'src/app/modal/dialog.service'
import { AuthSuccessResponse, SignupCredentialsDto } from 'src/app/models/auth.model'
import { UserService } from 'src/app/services/user.service'
import { getMessageFromHttpError } from 'src/app/utils/store.helpers'
import { appActions } from '../app.actions'
import { authActions } from './user.actions'

@Injectable()
export class AuthEffects {
    constructor(
        private actions$: Actions,
        private userService: UserService,
        private toast: HotToastService,
        private router: Router,
        private dialogService: DialogService
    ) {}

    loginOrSignup = createEffect(() => {
        return this.actions$.pipe(
            ofType(authActions.login, authActions.signup),
            mergeMap(({ type, credentials, callbackUrl }) => {
                const isLogin = /login/.test(type)
                const res$: Observable<AuthSuccessResponse> = isLogin
                    ? this.userService.login(credentials)
                    : this.userService.signup(credentials as SignupCredentialsDto)

                return res$.pipe(
                    this.toast.observe({
                        success: res => res.successMessage,
                        error: getMessageFromHttpError,
                    }),
                    tap(() => {
                        if (callbackUrl) this.router.navigateByUrl(callbackUrl)
                    }),
                    map(res => authActions.loginOrSignupSuccess(res.user)),
                    catchError((err: HttpServerErrorResponse) => of(authActions.loginOrSignupError(err)))
                )
            })
        )
    })

    saveAuthToken = createEffect(
        () =>
            this.actions$.pipe(
                ofType(authActions.loginOrSignupSuccess),
                tap(({ authToken }) => this.userService.saveToken(authToken))
            ),
        { dispatch: false }
    )

    loadSavedAuthToken = createEffect(() => {
        return this.actions$.pipe(
            ofType(ROOT_EFFECTS_INIT),
            map(() => {
                const authToken = this.userService.getToken()
                if (authToken) return authActions.loadAuthTokenSuccess({ authToken })
                else return appActions.nothing()
            })
        )
    })

    forwardLoadTokenSuccess = createEffect(() => {
        return this.actions$.pipe(
            ofType(authActions.loadAuthTokenSuccess),
            map(() => authActions.confirmLogin())
        )
    })
    confirmLogin = createEffect(() => {
        return this.actions$.pipe(
            ofType(authActions.confirmLogin),
            mergeMap(() => {
                const res$ = this.userService.confirmLogin()

                return res$.pipe(
                    this.toast.observe({
                        success: { content: res => res.successMessage, duration: 900 },
                        // Explicitly dismiss these toasts from anywhere with `toast.close('confirm-login')`
                        loading: {
                            content: 'Confirming login...',
                            id: 'confirm-login',
                        },
                        error: {
                            content: 'Invalid session, please login again.',
                            id: 'confirm-login',
                        },
                    }),
                    tap(() => {
                        const isOnAuthPage =
                            this.router.url.includes('auth') && !this.router.url.includes('/login-loading')
                        if (isOnAuthPage) this.router.navigateByUrl('/home')
                    }),
                    map(res => authActions.loginOrSignupSuccess(res.user)),
                    catchError(() => of(authActions.confirmLoginError()))
                )
            })
        )
    })

    logout = createEffect(() => {
        return this.actions$.pipe(
            ofType(authActions.logout),
            mergeMap(() => {
                const dialogRef = this.dialogService.confirm({
                    title: 'Logout',
                    text: 'Are you sure you want to log out?',
                    buttons: [{ text: 'Cancel' }, { text: 'Logout', className: 'button--danger' }],
                })

                return dialogRef.closed.pipe(
                    map(res => {
                        if (res == 'Logout') return authActions.logoutProceed()

                        return authActions.logoutAbort()
                    })
                )
            })
        )
    })

    logoutProceed = createEffect(
        () => {
            return this.actions$.pipe(
                ofType(authActions.logoutProceed),
                tap(() => {
                    this.userService.deleteToken()
                    this.router.navigateByUrl('/auth')
                })
            )
        },
        { dispatch: false }
    )
}
