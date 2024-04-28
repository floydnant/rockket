import { HttpErrorResponse } from '@angular/common/http'
import {
    Observable,
    OperatorFunction,
    catchError,
    delay,
    mergeMap,
    of,
    retry,
    switchMap,
    tap,
    throwError,
    timer,
} from 'rxjs'
import { z } from 'zod'
import { HttpService } from './http.service'
import { AppContext } from 'src/environments/env.types'
import { environment } from 'src/environments/environment'

/**
 * Validates incoming data with the given schema. If the data is invalid, an http like error is thrown.
 * @param schema
 * @param logContext A string that describes the context of the validation. This is used for debugging.
 */
export const validateWith = <TOutput>(
    schema: z.Schema<TOutput>,
    logContext: string,
): OperatorFunction<unknown, TOutput> => {
    return switchMap(data => {
        const validationResult = schema.safeParse(data)
        if (validationResult.success) return of(validationResult.data)

        console.error(`[${logContext}] Validation failed:`, validationResult.error.issues)

        return throwError(() => ({
            error: {
                statusCode: 0,
                message: 'An unknown error occurred. Please refresh the page and try again.',
                error: 'validation error',
            },
        }))
    })
}

/** Catches errors and re-throws an `HttpServerErrorResponse` */
export const interceptErrors = <T>(http: HttpService): OperatorFunction<T, T> => {
    return <T>(source: Observable<T>) => {
        return source.pipe(
            retry({
                count: 4,
                delay: (err: HttpErrorResponse) => {
                    if (!navigator.onLine) return throwError(() => err)
                    if (err.status == 401) return throwError(() => err)
                    if (err.status == 409) return throwError(() => err)

                    return timer(300)
                },
            }),
            catchError<T, Observable<T>>(({ type, ...err }: HttpErrorResponse) => {
                if (err.status !== 0) return throwError(() => err)

                // Check if client is connected to internet
                if (!navigator.onLine)
                    return throwError(() => ({
                        ...err,
                        error: {
                            statusCode: '0 - OFFLINE',
                            message: 'You are offline. Please connect to the internet and try again.',
                            error: 'network error',
                        },
                    }))

                // Check if the server is even up
                return http.get('/health', { disableErrorInterception: true }).pipe(
                    // Server is up
                    mergeMap(() => {
                        return throwError(() => ({
                            ...err,
                            error: {
                                statusCode: 0,
                                message:
                                    'An unknown error occurred. Please refresh and try again. If the problem presists, please report it.',
                                error: 'unknown',
                            },
                        }))
                    }),
                    // Server is down
                    catchError<T, Observable<T>>(err => {
                        console.warn('second catchError catched:', err)
                        return throwError(() => ({
                            ...err,
                            error: {
                                statusCode: '0 - SERVER DOWN',
                                message:
                                    'We may be experiencing some issues with the server. Please report it.',
                                error: 'server error',
                            },
                        }))
                    }),
                )
            }),
        )
    }
}

export const useDelay = <T>(enable = environment.CONTEXT == AppContext.Development) => {
    if (!enable) return tap<T>()
    return delay<T>(300)
}
