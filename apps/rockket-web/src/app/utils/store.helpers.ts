import { Actions, ofType } from '@ngrx/effects'
import { Action, ActionCreator, Creator, ReducerTypes } from '@ngrx/store'
import { map, merge, Observable, scan, shareReplay, startWith, tap } from 'rxjs'
import { HttpServerErrorResponse } from '../http/types'
import { filterWith } from './observable.helpers'

export const getMessageFromHttpError = (err: HttpServerErrorResponse) =>
    err.error.message instanceof Array
        ? err.error.message[0].replace(/^\w+:/, '')
        : err.error.message.replace(/^\w+:/, '')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyActionCreator<T extends Record<string, any> = Record<string, any>> = ActionCreator<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Creator<any[], Action & T>
>
export type ErrorActionCreator = AnyActionCreator<{
    error: {
        message: string | string[]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}>

export type ReducerOns<State extends object> = ReducerTypes<State, readonly AnyActionCreator[]>[]

interface GetErrorMapUpdatesOptions {
    actions$: Actions
    /** Keywords to organize the error map by */
    fields: string[]
    /** This action will reset the error map */
    resetAction: AnyActionCreator
    /** The errors will come from this action */
    errorAction: ErrorActionCreator
}

/** Returns an observable of error messages, mapped by their matching `field` */
export const getErrorMapUpdates = ({ actions$, fields, resetAction, errorAction }: GetErrorMapUpdatesOptions) => {
    const resetActions = actions$.pipe(
        ofType(resetAction),
        map(() => ({}))
    )
    const errorActions = actions$.pipe(
        ofType(errorAction),
        map(action => {
            let messages: string[]
            if (action.error.message instanceof Array) messages = action.error.message
            else messages = [action.error.message]

            const errorMap: Record<string, string[]> = {}
            messages.forEach(msg => {
                const fieldName = fields.find(field => new RegExp(field, 'i').test(msg))
                if (fieldName) errorMap[fieldName] = [...(errorMap[fieldName] || []), msg.replace(/^\w+:/, '')]
            })

            return errorMap
        })
    )

    return merge(resetActions, errorActions)
}

/** Returns an observable of the loading state, specified by `actionsToListenFor` i.e.:

 * | action type matching | loading state |
 * | ---------------------|---------------|
 * | `/error/i`           | `false`       |
 * | `/success/i`         | `false`       |
 * | all other cases      | `true`        |
 * 
 * You can optionally specify a predicate to filter the actions that fired (e.g. only take an action with a matching id)
 */
export const loadingUpdates = <T extends AnyActionCreator>(
    actionsToListenFor: T[],
    filterPredicate?: (action: ReturnType<T>) => boolean | Observable<boolean>
) => {
    return (source: Actions) =>
        source.pipe(
            ofType(...actionsToListenFor),
            filterPredicate ? filterWith(filterPredicate) : tap(),
            interpretLoadingStates(),
            map(action => action.isLoading),
            startWith(false),
            shareReplay({ bufferSize: 1, refCount: true })
        )
}

/** Injects `isLoading` interpreted by the action type:

 * | action type matching | loading state |
 * | -------------------- | ------------- |
 * | `/error/i`           | `false`       |
 * | `/success/i`         | `false`       |
 * | all other cases      | `true`        |
 *
 */
export const interpretLoadingStates = <T extends Action>() =>
    map<T, T & { isLoading: boolean }>(action => ({
        ...action,
        isLoading: !/success|error/i.test(action.type),
    }))

/** Maps loading states to their `id` field in the action */
export const collectLoadingMap = <T extends Action & { id: string; isLoading: boolean }>() => {
    const operator = (source: Actions<T>) =>
        source.pipe(
            scan(
                ({ loadingStateMap }, { type, id, isLoading }) => {
                    loadingStateMap[id] = isLoading
                    return { type, id, loadingStateMap }
                },
                {
                    type: '' as T['type'],
                    id: '',
                    loadingStateMap: {} as Record<string, boolean>,
                }
            ),
            shareReplay({ bufferSize: 1, refCount: true })
        )

    operator.getMap = () => (source: Actions<T>) => operator(source).pipe(map(res => res.loadingStateMap))

    return operator
}
