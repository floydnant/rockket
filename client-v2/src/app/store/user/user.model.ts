import { UserPreview } from 'src/app/models'

export interface UserState {
    me: UserPreview | null
    authToken: string | null
    email: string | null
    isLoggedIn: boolean
    isLoading: boolean
}
