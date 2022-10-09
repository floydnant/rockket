import { Injectable } from '@angular/core'
import { HotToastService } from '@ngneat/hot-toast'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { catchError, map, mergeMap, Observable, of } from 'rxjs'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { UserService } from 'src/app/services/user.service'
import { userActions } from './user.actions'
import { AuthSuccessResponse } from './user.model'

@Injectable()
export class UserEffects {
    constructor(private actions$: Actions, private userService: UserService, private toast: HotToastService) {}

    loginOrSignup = createEffect(() => {
        return this.actions$.pipe(
            ofType(userActions.login, userActions.signup),
            mergeMap(({ type, ...credentials }) => {
                const res$: Observable<AuthSuccessResponse> = /login/.test(type)
                    ? this.userService.login(credentials)
                    : this.userService.signup(credentials)

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
}
