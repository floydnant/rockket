import { createAction, props } from '@ngrx/store'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { LoggedInUser, LoginCredentialsDto, SignupCredentialsDto } from 'src/app/models/auth.model'

export const userActions = {
    signup: createAction('[User] signup', props<SignupCredentialsDto>()),
    login: createAction('[User] login', props<LoginCredentialsDto>()),
    loginOrSignupSuccess: createAction('[User] login or signup success', props<LoggedInUser>()),
    loginOrSignupError: createAction('[User] login error', props<HttpServerErrorResponse>()),

    logout: createAction('[User] logout'),

    loadAuthTokenSuccess: createAction('[User] load authToken success', props<{ authToken: string }>()),
    confirmLoginError: createAction('[User] confirm login error'),
}
