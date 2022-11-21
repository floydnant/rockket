import { createReducer, on } from '@ngrx/store'
import { userActions } from './user.actions'
import { UserState } from './user.model'

const initialState: UserState = {
    me: null,
    authToken: null,
    email: null,
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
    on(userActions.loginOrSignupSuccess, (state, { type, authToken, ...user }) => ({
        ...state,
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

    on(userActions.loadAuthTokenSuccess, (state, { authToken }) => ({
        ...state,
        authToken,
    })),

    on(userActions.confirmLogin, state => ({
        ...state,
        isLoading: true,
    })),
    on(userActions.confirmLoginError, state => ({
        ...state,
        authToken: null,
        isLoading: false,
        isLoggedIn: false,
    })),

    // logout
    on(userActions.logout, () => initialState),

    // Update username success
    on(userActions.updateUsernameSuccess, (state, { username }) => ({
        ...state,
        me: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...state.me!,
            username,
        },
    })),

    on(userActions.updateEmailSuccess, (state, { email }) => ({
        ...state,
        email,
    })),

    on(userActions.loadEmailSuccess, (state, { email }) => ({
        ...state,
        email,
    }))
)
