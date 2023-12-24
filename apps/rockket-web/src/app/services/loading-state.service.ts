import { Injectable } from '@angular/core'
import { Actions, ofType } from '@ngrx/effects'
import { map, tap, Observable, shareReplay } from 'rxjs'
import { loadingStateActions } from '../store/entities/entities.actions'
import { AnyActionCreator, collectLoadingMap, interpretLoadingStates } from '../utils/store.helpers'
import { filterWith } from '../utils/observable.helpers'
import { UnwrapObservable } from '../utils/type.helpers'

@Injectable({
    providedIn: 'root',
})
export class LoadingStateService {
    constructor(private actions$: Actions) {}
    bufferedActions$ = this.actions$.pipe(shareReplay({ bufferSize: 1, refCount: true }))

    entityActions$ = this.bufferedActions$.pipe(ofType(...loadingStateActions))
    entityLoadingStates$ = this.entityActions$.pipe(
        interpretLoadingStates(),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    private entityLoadingStateMap$ = this.entityLoadingStates$.pipe(collectLoadingMap())
    getEntitiesLoadingStateMap(
        filterPredicate?: (
            action: UnwrapObservable<LoadingStateService['entityLoadingStateMap$']>,
        ) => boolean | Observable<boolean>,
    ) {
        const loadingActions$ = this.entityLoadingStateMap$.pipe(
            filterPredicate ? filterWith(filterPredicate) : tap(),
            shareReplay({ bufferSize: 1, refCount: true }),
        )

        return Object.assign(loadingActions$.pipe(map(action => action.loadingStateMap)), {
            withActionData$: loadingActions$,
        })
    }

    getEntityLoadingState(
        filterPredicate: (
            action: UnwrapObservable<LoadingStateService['entityLoadingStates$']>,
        ) => boolean | Observable<boolean>,
    ) {
        const loadingActions$ = this.entityLoadingStates$.pipe(
            filterWith(filterPredicate),
            shareReplay({ bufferSize: 1, refCount: true }),
        )

        return Object.assign(loadingActions$.pipe(map(action => action.isLoading)), {
            withActionData$: loadingActions$,
        })
    }

    getLoadingState<T extends AnyActionCreator>(actions: T[]) {
        const loadingActions$ = this.bufferedActions$.pipe(
            ofType(...actions),
            interpretLoadingStates(),
            shareReplay({ bufferSize: 1, refCount: true }),
        )

        return Object.assign(loadingActions$.pipe(map(action => action.isLoading)), {
            withActionData$: loadingActions$,
        })
    }
}
