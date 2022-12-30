import { Actions, ofType } from '@ngrx/effects'
import { Action, ActionCreator, Creator } from '@ngrx/store'
import { concatMap, filter, map, merge, Observable, of, shareReplay, startWith } from 'rxjs'
import { HttpServerErrorResponse } from '../http/types'

export const getMessageFromHttpError = (err: HttpServerErrorResponse) =>
    err.error.message instanceof Array
        ? err.error.message[0].replace(/^\w+:/, '')
        : err.error.message.replace(/^\w+:/, '')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyActionCreator = ActionCreator<string, Creator<any[], Action & Record<string, any>>>
export type ErrorActionCreator = ActionCreator<
    string,
    Creator<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any[],
        Action & {
            error: {
                message: string | string[]
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [key: string]: any
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [key: string]: any
        }
    >
>

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
 */
export const getLoadingUpdates = <T extends AnyActionCreator>(
    actions$: Actions,
    actionsToListenFor: T[],
    filterPredicate?: (action: ReturnType<T>) => boolean | Observable<boolean>
) =>
    actions$.pipe(
        ofType(...actionsToListenFor),
        concatMap(action => {
            if (!filterPredicate) return of(action)

            const predicateResult = filterPredicate(action)

            let shouldPass$: Observable<boolean>
            if (typeof predicateResult == 'boolean') shouldPass$ = of(predicateResult)
            else shouldPass$ = predicateResult

            return shouldPass$.pipe(
                filter(shouldPass => shouldPass),
                map(() => action)
            )
        }),
        map(({ type }) => {
            if (/success|error/i.test(type)) return false
            else return true
        }),
        startWith(false),
        shareReplay({ bufferSize: 1, refCount: true })
    )
