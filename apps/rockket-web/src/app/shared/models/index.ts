import { LoggedInUser } from '@rockket/commons'
import { HttpSuccessResponse } from 'src/app/http/types'

export type AuthSuccessResponse = HttpSuccessResponse<{ user: LoggedInUser }>
