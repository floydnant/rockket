import { User } from '@rockket/commons'
import { PartialRequired } from 'src/app/utils/type.helpers'

export type UserState = {
    me: PartialRequired<User, 'id' | 'username'> | null
    authToken: string | null
    isLoggedIn: boolean
    isLoading: boolean
}
