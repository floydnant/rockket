import { createAction, props } from '@ngrx/store'
import { HttpServerErrorResponse } from 'src/app/http/types'
import { LoggedInUser, LoginCredentialsDto, SignupCredentialsDto } from './user.model'

export const userActions = {
    signup: createAction('[User] signup', props<SignupCredentialsDto>()),
    login: createAction('[User] login', props<LoginCredentialsDto>()),
    loginOrSignupSuccess: createAction('[User] login or signup success', props<LoggedInUser>()),
    loginOrSignupError: createAction('[User] login error', props<HttpServerErrorResponse>()),

    logout: createAction('[User] logout'),

    // load credentials from localStorage
    loadUser: createAction('[User] load user'),
    loadUserSuccess: createAction('[User] load user success', props<LoggedInUser>()),
}
