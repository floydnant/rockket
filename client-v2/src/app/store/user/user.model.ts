import { HttpSuccessResponse } from 'src/app/http/types'

export interface UserState {
    me: UserPreview | null
    authToken: string | null
    isLoggedIn: boolean
    isLoading: boolean
}

// @TODO: These should be in another file

export interface UserPreview {
    id: string
    username: string
}

export interface SignupCredentialsDto {
    username: string
    email: string
    password: string
}
export interface LoginCredentialsDto {
    email: string
    password: string
}

export type LoggedInUser = UserPreview & {
    authToken: string
}

export type AuthSuccessResponse = HttpSuccessResponse<{ user: LoggedInUser }>
