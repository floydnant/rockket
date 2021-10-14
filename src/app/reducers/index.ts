import {
    Action,
    ActionReducer,
    ActionReducerMap,
    createFeatureSelector,
    createSelector,
    MetaReducer,
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import { AppData, appDataReducer } from './appData';

export * from './appData';

export interface State {
    appData: AppData;
}

export const reducers: ActionReducerMap<State> = {
    appData: appDataReducer,
};

export const metaReducers: MetaReducer<State>[] = !environment.production ? [] : [];
