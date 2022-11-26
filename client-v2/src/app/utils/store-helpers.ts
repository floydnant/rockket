import { Actions, ofType } from '@ngrx/effects'
import { ActionCreator, Creator } from '@ngrx/store'
import { map, merge } from 'rxjs'
import { HttpServerErrorResponse } from '../http/types'

export const getMessageFromHttpError = (err: HttpServerErrorResponse) =>
    err.error.message instanceof Array
        ? err.error.message[0].replace(/^\w+:/, '')
        : err.error.message.replace(/^\w+:/, '')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SuccessAction = ActionCreator<string, Creator<any[], Record<string, any>>>
type ErrorAction = ActionCreator<
    string,
    Creator<
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any[],
        {
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
export const getErrorMapUpdates = ({
    actions$,
    fields,
    successAction,
    errorAction,
}: {
    actions$: Actions
    fields: string[]
    successAction: SuccessAction
    errorAction: ErrorAction
}) => {
    const successActions = actions$.pipe(
        ofType(successAction),
        map(() => ({}))
    )
    const errorActions = actions$.pipe(
        ofType(errorAction),
        map(action => {
            let messages: string[]
            if (action.error.message instanceof Array) messages = action.error.message
            else messages = [action.error.message]

            // const generalErrors: string[] = []
            const errorMap: Record<string, string[]> = {}
            messages.forEach(msg => {
                const fieldName = fields.find(field => new RegExp(field, 'i').test(msg))
                if (fieldName) errorMap[fieldName] = [...(errorMap[fieldName] || []), msg.replace(/^\w+:/, '')]
                // else generalErrors.push(msg)
            })

            return errorMap
        })
    )

    return merge(successActions, errorActions)
}
