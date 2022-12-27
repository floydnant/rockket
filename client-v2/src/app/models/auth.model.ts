import { UserPreview } from './user.model'
import { HttpSuccessResponse } from '../http/types'

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
