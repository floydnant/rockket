import { ActionReducerMap, MetaReducer } from '@ngrx/store'
import { environment } from '../../environments/environment'
import { AppEffects } from './app.effects'
import { AuthEffects } from './user/auth.effects'
import { AccountEffects } from './user/account.effects'
import { UserState } from './user/user.state'
import { userReducer } from './user/user.reducer'
import { entitiesReducer } from './entities/entities.reducer'
import { EntitiesState } from './entities/entities.state'
import { ListEffects } from './entities/list.effects'
import { EntitiesEffects } from './entities/entities.effects'
import { TaskEffects } from './entities/task.effects'

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
    const isProd = environment.CONTEXT == 'Production' || environment.CONTEXT == 'Staging'
    const isErrorAction = /error/i.test(action.type)
    if (isProd && !isErrorAction) return reducer(state, action)

    const actionColor = isErrorAction ? 'color: hsl(345, 100%, 52%);' : 'color: hsl(155, 100%, 50%);'
    console.info('%caction: %c' + action.type, 'color: hsl(130, 0%, 50%);', actionColor)

    if (isErrorAction) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { type, ...error } = action
        console.error(error)
    }

    return reducer(state, action)
}
export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [actionLogger] : [actionLogger]
