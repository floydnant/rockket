import { ActionReducerMap, MetaReducer } from '@ngrx/store'
import { environment } from '../../environments/environment'
import { AppEffects } from './app.effects'
import { EntitiesEffects } from './entities/entities.effects'
import { entitiesReducer } from './entities/entities.reducer'
import { EntitiesState } from './entities/entities.state'
import { ListEffects } from './entities/list/list.effects'
import { TaskEffects } from './entities/task/task.effects'
import { AccountEffects } from './user/account.effects'
import { AuthEffects } from './user/auth.effects'
import { userReducer } from './user/user.reducer'
import { UserState } from './user/user.state'

export interface AppState {
    user: UserState
    entities: EntitiesState
}
export const reducers: ActionReducerMap<AppState> = {
    user: userReducer,
    entities: entitiesReducer,
}

export const effects = [AppEffects, AuthEffects, AccountEffects, ListEffects, EntitiesEffects, TaskEffects]

const actionLogger: MetaReducer<AppState> = reducer => (state, action) => {
    const isErrorAction = /error/i.test(action.type)
    if (environment.isProduction && !isErrorAction) return reducer(state, action)

    const actionColor = isErrorAction ? 'color: hsl(345, 100%, 52%);' : 'color: hsl(155, 100%, 50%);'
    console.info('%caction: %c' + action.type, 'color: hsl(130, 0%, 50%);', actionColor)

    if (isErrorAction) {
        const { type, ...error } = action
        console.error(error)
    }

    return reducer(state, action)
}
export const metaReducers: MetaReducer<AppState>[] = environment.isProduction
    ? [actionLogger] // In production we only need the logger for error actions
    : [actionLogger]
