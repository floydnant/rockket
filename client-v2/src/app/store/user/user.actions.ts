import { UrlTree } from '@angular/router'
import { createAction, props } from '@ngrx/store'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { SignupCredentialsDto, LoginCredentialsDto, LoggedInUser } from 'src/app/models/auth.model'

export const userActions = {
    ////////////// Auth ////////////////
    signup: createAction(
        '[User] signup',
        props<{ credentials: SignupCredentialsDto; callbackUrl?: string | UrlTree }>()
    ),
    login: createAction('[User] login', props<{ credentials: LoginCredentialsDto; callbackUrl?: string | UrlTree }>()),
    loginOrSignupSuccess: createAction('[User] login or signup success', props<LoggedInUser>()),
    loginOrSignupError: createAction('[User] login error', props<HttpServerErrorResponse>()),

    logout: createAction('[User] logout'),

    loadAuthTokenSuccess: createAction('[User] load authToken success', props<{ authToken: string }>()),
    confirmLogin: createAction('[User] confirm login'),
    confirmLoginError: createAction('[User] confirm login error'),

    ///////////// Account ///////////////
    updateUsername: createAction('[User/Account] update username', props<{ username: string }>()),
    updateUsernameSuccess: createAction('[User/Account] update username success', props<{ username: string }>()),

    updateEmail: createAction('[User/Account] update email', props<{ password: string; email: string }>()),
    updateEmailSuccess: createAction('[User/Account] update email success', props<{ email: string }>()),

    updatePassword: createAction('[User/Account] update password', props<{ password: string; newPassword: string }>()),
    updatePasswordSuccess: createAction('[User/Account] update password success'),
    resetPassword: createAction('[User/Account] reset password'),

    deleteAccount: createAction('[User/Account] delete account', props<{ password: string }>()),
    deleteAccountSuccess: createAction('[User/Account] delete account success'),

    loadEmail: createAction('[User/Account] load email', props<{ ignoreCache?: boolean }>()),
    loadEmailSuccess: createAction('[User/Account] load email success', props<{ email: string }>()),
}
