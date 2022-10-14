import { Injectable } from '@angular/core'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, map, mergeMap, Observable, of, tap } from 'rxjs'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { UserService } from 'src/app/services/user.service'
import { userActions } from './user.actions'
import { AuthSuccessResponse, SignupCredentialsDto } from './user.model'

@Injectable()
export class UserEffects {
    constructor(private actions$: Actions, private userService: UserService, private toast: HotToastService) {}

    loginOrSignup = createEffect(() => {
        return this.actions$.pipe(
            ofType(userActions.login, userActions.signup),
            mergeMap(({ type, ...credentials }) => {
                const isLogin = /login/.test(type)
                const res$: Observable<AuthSuccessResponse> = isLogin
                    ? this.userService.login(credentials)
                    : this.userService.signup(credentials as SignupCredentialsDto)

                return res$.pipe(
                    this.toast.observe({
                        success: res => res.successMessage,
                        // @TODO: show field specific error messages as input field errors instead
                        error: (err: HttpServerErrorResponse) =>
                            err.error.message instanceof Array ? err.error.message[0] : err.error.message,
                    }),
                    map(res => userActions.loginOrSignupSuccess(res.user)),
                    catchError((err: HttpServerErrorResponse) => of(userActions.loginOrSignupError(err)))
                )
            })
        )
    })

    saveAuthToken = createEffect(
        () =>
            this.actions$.pipe(
                ofType(userActions.loginOrSignupSuccess),
                tap(({ authToken }) => this.userService.saveToken(authToken))
            ),
        { dispatch: false }
    )
}
