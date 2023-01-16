import { LoggedInUser } from 'src/app/fullstack-shared-models/auth.model'
import { HttpSuccessResponse } from 'src/app/http/types'

export type AuthSuccessResponse = HttpSuccessResponse<{ user: LoggedInUser }>
