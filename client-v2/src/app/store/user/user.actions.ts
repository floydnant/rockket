import { UrlTree } from '@angular/router'
import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { SignupCredentialsDto, LoginCredentialsDto, LoggedInUser } from 'src/app/models/auth.model'

export const userActions = createActionGroup({
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
