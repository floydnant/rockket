import { ActionReducerMap, MetaReducer } from '@ngrx/store'
import { environment } from '../../environments/environment'
import { AppEffects } from './app.effects'

export interface AppState {
}
export const reducers: ActionReducerMap<AppState> = {
}

export const effects = [
    AppEffects,
]

const actionLogger: MetaReducer<AppState> = reducer => (state, action) => {
    console.info('%caction: %c' + action.type, 'color: hsl(130, 0%, 50%);', 'color: hsl(130, 100%, 50%);')
    return reducer(state, action)
}
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [actionLogger] : []
