import { UserPreview } from './user.model'

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
