import { ActionReducerMap, MetaReducer } from '@ngrx/store'
import { environment } from '../../environments/environment'
import { AppEffects } from './app.effects'
import { UserEffects } from './user/user.effects'
import { UserState } from './user/user.model'
import { userReducer } from './user/user.reducer'

export interface AppState {
    user: UserState
}
export const reducers: ActionReducerMap<AppState> = {
    user: userReducer,
}

export const effects = [AppEffects, UserEffects]

const actionLogger: MetaReducer<AppState> = reducer => (state, action) => {
    console.info('%caction: %c' + action.type, 'color: hsl(130, 0%, 50%);', 'color: hsl(130, 100%, 50%);')
    return reducer(state, action)
}
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [actionLogger] : []
