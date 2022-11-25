import { ActionReducerMap, MetaReducer } from '@ngrx/store'
import { environment } from '../../environments/environment'
import { AppEffects } from './app.effects'
import { AuthEffects } from './user/auth.effects'
import { UserState } from './user/user.model'
import { userReducer } from './user/user.reducer'

export interface AppState {
    user: UserState
}
export const reducers: ActionReducerMap<AppState> = {
    user: userReducer,
}

export const effects = [AppEffects, AuthEffects]

const actionLogger: MetaReducer<AppState> = reducer => (state, action) => {
    console.info('%caction: %c' + action.type, 'color: hsl(130, 0%, 50%);', 'color: hsl(130, 100%, 50%);')
    return reducer(state, action)
}
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [actionLogger] : []
