import { createFeatureSelector } from '@ngrx/store'
import { EntitiesState } from './entities.state'

export const entitiesFeature = createFeatureSelector<EntitiesState>('entities')

export const entitiesSelectors = {}
