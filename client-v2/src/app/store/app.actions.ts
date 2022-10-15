import { createAction, props } from '@ngrx/store'
import { HttpServerErrorResponse } from '../http/types'

export const appActions = {
    nothing: createAction('[App] nothing'),
    error: createAction('[App] error', props<HttpServerErrorResponse>()),
}
