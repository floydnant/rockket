import { UrlTree } from '@angular/router'
import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { SignupCredentialsDto, LoginCredentialsDto, LoggedInUser } from 'src/app/models/auth.model'

export const authActions = createActionGroup({
    source: 'User/Auth',
    events: {
        signup: props<{ credentials: SignupCredentialsDto; callbackUrl?: string | UrlTree }>(),
        login: props<{ credentials: LoginCredentialsDto; callbackUrl?: string | UrlTree }>(),
        'login or signup success': props<LoggedInUser>(),
        'login or signup error': props<HttpServerErrorResponse>(),

        logout: emptyProps(),

        'load auth token success': props<{ authToken: string }>(),
        'confirm login': emptyProps(),
        'confirm login error': emptyProps(),
    },
})

export const accountActions = createActionGroup({
    source: 'User/Account',
    events: {
        'update username': props<{ username: string }>(),
        'update username success': props<{ username: string }>(),

        'update email': props<{ password: string; email: string }>(),
        'update email success': props<{ email: string }>(),

        'update password': props<{ password: string; newPassword: string }>(),
        'update password success': emptyProps(),
        'reset password': emptyProps(),

        'delete account': props<{ password: string }>(),
        'delete account success': emptyProps(),

        'load email': props<{ ignoreCache?: boolean }>(),
        'load email success': props<{ email: string }>(),
    },
})

export const userActions = { ...authActions, ...accountActions }
