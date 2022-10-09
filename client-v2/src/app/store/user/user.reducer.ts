import { createReducer, on } from '@ngrx/store'
import { userActions } from './user.actions'
import { UserState } from './user.model'

const initialState: UserState = {
    me: null,
    authToken: null,
    isLoggedIn: false,
    isLoading: false,
}

export const userReducer = createReducer<UserState>(
    initialState,

    on(userActions.signup, state => ({
        ...state,
        isLoading: true,
    })),
    on(userActions.login, state => ({
        ...state,
        isLoading: true,
    })),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(userActions.loginOrSignupSuccess, (_state, { type, authToken, ...user }) => ({
        me: user,
        authToken,
        isLoading: false,
        isLoggedIn: true,
    })),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(userActions.loginOrSignupError, state => ({
        ...state,
        isLoading: false,
        isLoggedIn: false,
    })),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(userActions.loadUserSuccess, (state, { type, authToken, ...user }) => ({
        ...state,
        me: user,
        authToken,
    })),

    // logout
    on(userActions.logout, () => initialState)
)
