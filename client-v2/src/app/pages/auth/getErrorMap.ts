import { Actions, ofType } from '@ngrx/effects'
import { map, merge } from 'rxjs'
import { authActions } from 'src/app/store/user/user.actions'

export const getErrorMap = (actions$: Actions, fields: string[]) => {
    const successActions = actions$.pipe(
        ofType(authActions.loginOrSignupSuccess),
        map(() => ({}))
    )
    const errorActions = actions$.pipe(
        ofType(authActions.loginOrSignupError),
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
