import { createAction, props } from '@ngrx/store'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { SignupCredentialsDto, LoginCredentialsDto, LoggedInUser } from 'src/app/models/auth.model'

export const userActions = {
    signup: createAction('[User] signup', props<SignupCredentialsDto>()),
    login: createAction('[User] login', props<LoginCredentialsDto>()),
    loginOrSignupSuccess: createAction('[User] login or signup success', props<LoggedInUser>()),
    loginOrSignupError: createAction('[User] login error', props<HttpServerErrorResponse>()),

    logout: createAction('[User] logout'),

    loadAuthTokenSuccess: createAction('[User] load authToken success', props<{ authToken: string }>()),
    confirmLogin: createAction('[User] confirm login'),
    confirmLoginError: createAction('[User] confirm login error'),
}
