import { createActionGroup, emptyProps } from '@ngrx/store'

export const appActions = createActionGroup({
    source: 'App',
    events: {
        nothing: emptyProps(),
        // error: props<HttpServerErrorResponse>(),
    },
})
