import { User } from 'src/app/models/user.model'
import { PartialRequired } from 'src/app/utils/type.helpers'

export interface UserState {
    me: PartialRequired<User, 'id' | 'username'> | null
    authToken: string | null
    isLoggedIn: boolean
    isLoading: boolean
}
