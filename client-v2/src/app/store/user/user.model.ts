import { UserPreview } from 'src/app/models'

export interface UserState {
    me: UserPreview | null
    authToken: string | null
    isLoggedIn: boolean
    isLoading: boolean
}
