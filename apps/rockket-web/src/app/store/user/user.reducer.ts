import { createReducer, on } from '@ngrx/store'
import { accountActions, authActions } from './user.actions'
import { UserState } from './user.state'

const initialState: UserState = {
    me: null,
    authToken: null,
    isLoggedIn: false,
    isLoading: false,
}

export const userReducer = createReducer<UserState>(
    initialState,

    on(authActions.signup, state => ({
        ...state,
        isLoading: true,
    })),
    on(authActions.login, state => ({
        ...state,
        isLoading: true,
    })),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(authActions.loginOrSignupSuccess, (_state, { type, authToken, ...user }) => ({
        me: user,
        authToken,
        isLoading: false,
        isLoggedIn: true,
    })),

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(authActions.loginOrSignupError, state => ({
        ...state,
        isLoading: false,
        isLoggedIn: false,
    })),

    on(authActions.loadAuthTokenSuccess, (state, { authToken }) => ({
        ...state,
        authToken,
    })),

    on(authActions.confirmLogin, state => ({
        ...state,
        isLoading: true,
    })),
    on(authActions.confirmLoginError, state => ({
        ...state,
        authToken: null,
        isLoading: false,
        isLoggedIn: false,
    })),

    // logout
    on(authActions.logoutProceed, () => initialState),

    // Update username success
    on(accountActions.updateUsernameSuccess, (state, { username }) => ({
        ...state,
        me: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...state.me!,
            username,
        },
    })),

    on(accountActions.updateEmailSuccess, (state, { email }) => ({
        ...state,
        me: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...state.me!,
            email,
        },
    })),

    on(accountActions.loadEmailSuccess, (state, { email }) => ({
        ...state,
        me: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...state.me!,
            email,
        },
    }))
)
