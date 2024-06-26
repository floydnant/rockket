import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType, ROOT_EFFECTS_INIT } from '@ngrx/effects'
import { SignupDto } from '@rockket/commons'
import { catchError, map, mergeMap, Observable, of, tap } from 'rxjs'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { DialogService } from 'src/app/modal/dialog.service'
import { AuthService } from 'src/app/services/auth.service'
import { AuthSuccessResponse } from 'src/app/shared/models'
import { getMessageFromHttpError } from 'src/app/utils/store.helpers'
import { appActions } from '../app.actions'
import { authActions } from './user.actions'

@Injectable()
export class AuthEffects {
    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private toast: HotToastService,
        private router: Router,
        private dialogService: DialogService,
    ) {}

    loginOrSignup = createEffect(() => {
        return this.actions$.pipe(
            ofType(authActions.login, authActions.signup),
            mergeMap(({ type, credentials, callbackUrl }) => {
                const isLogin = /login/.test(type)
                const res$: Observable<AuthSuccessResponse> = isLogin
                    ? this.authService.login(credentials)
                    : this.authService.signup(credentials as SignupDto)

                return res$.pipe(
                    this.toast.observe({
                        success: res => res.successMessage,
                        error: getMessageFromHttpError,
                    }),
                    tap(() => {
                        if (callbackUrl) this.router.navigateByUrl(callbackUrl)
                    }),
                    map(res => authActions.loginOrSignupSuccess(res.user)),
                    catchError((err: HttpServerErrorResponse) => of(authActions.loginOrSignupError(err))),
                )
            }),
        )
    })

    saveAuthToken = createEffect(
        () =>
            this.actions$.pipe(
                ofType(authActions.loginOrSignupSuccess),
                tap(({ authToken }) => this.authService.saveToken(authToken)),
            ),
        { dispatch: false },
    )

    loadSavedAuthToken = createEffect(() => {
        return this.actions$.pipe(
            ofType(ROOT_EFFECTS_INIT),
            map(() => {
                const authToken = this.authService.getToken()
                if (authToken) return authActions.loadAuthTokenSuccess({ authToken })
                else return appActions.nothing()
            }),
        )
    })

    forwardLoadTokenSuccess = createEffect(() => {
        return this.actions$.pipe(
            ofType(authActions.loadAuthTokenSuccess),
            map(() => authActions.confirmLogin()),
        )
    })
    confirmLogin = createEffect(() => {
        return this.actions$.pipe(
            ofType(authActions.confirmLogin),
            mergeMap(() => {
                const res$ = this.authService.confirmLogin()

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
                        if (isOnAuthPage) this.router.navigateByUrl('/home', { replaceUrl: true })
                    }),
                    map(res => authActions.loginOrSignupSuccess(res.user)),
                    catchError(() => of(authActions.confirmLoginError())),
                )
            }),
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
                    }),
                )
            }),
        )
    })

    logoutProceed = createEffect(
        () => {
            return this.actions$.pipe(
                ofType(authActions.logoutProceed),
                tap(() => {
                    this.authService.deleteToken()
                    this.router.navigateByUrl('/auth')
                }),
            )
        },
        { dispatch: false },
    )
}
