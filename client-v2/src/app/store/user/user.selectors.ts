import { createFeatureSelector, createSelector } from '@ngrx/store'
import { UserState } from './user.state'

export const userFeature = createFeatureSelector<UserState>('user')

export const userSelectors = {
    selectLoginState: createSelector(userFeature, state => ({
        isLoggedIn: state.isLoading,
        isLoading: state.isLoading,
    })),
    selectUserData: createSelector(userFeature, state => state.me),
    selectAuthtoken: createSelector(userFeature, state => state.authToken),
}
