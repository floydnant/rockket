import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Store } from '@ngrx/store'
import {
    OperatorFunction,
    catchError,
    Observable,
    throwError,
    mergeMap,
    delay,
    tap,
    retry,
    timer,
} from 'rxjs'
import { environment } from 'src/environments/environment'
import { AppState } from '../store'
import { userSelectors } from '../store/user/user.selectors'
import { HttpClientOptions } from './types'
import { AppContext } from 'src/environments/env.types'

const useDelay = <T>(enable = environment.CONTEXT == AppContext.Development) => {
    if (!enable) return tap<T>()
    return delay<T>(500)
}

/** Catches errors and re-throws an `HttpServerErrorResponse` */
const interceptErrors = <T>(http: HttpService): OperatorFunction<T, T> => {
    return <T>(source: Observable<T>) => {
        return source.pipe(
            retry({
                count: 4,
                delay: (err: HttpErrorResponse) => {
                    if (!navigator.onLine) throwError(() => err)
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

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    constructor(public http: HttpClient, private store: Store<AppState>) {
        this.store
            .select(userSelectors.selectAuthtoken)
            .subscribe(authToken => (this.bearerToken = authToken))
    }

    private bearerToken?: string | null
    private baseUrl = environment.SERVER_BASE_URL

    /**
     * @param endpoint Note: needs to start with a slash
     * @param options The HTTP options to send with the request. */
    get<T>(endpoint: string, options?: HttpClientOptions<'get'>) {
        const url = this.baseUrl + endpoint
        const response$ = this.http.get<T>(url, this.addBearerToken(options))

        return this.handleResponse(response$, options)
    }

    /**
     * @param endpoint Note: needs to start with a slash
     * @param body
     * @param options The HTTP options to send with the request. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post<T>(endpoint: string, body?: Record<string, any>, options?: HttpClientOptions<'post'>) {
        const url = this.baseUrl + endpoint
        const response$ = this.http.post<T>(url, body || {}, this.addBearerToken(options))

        return this.handleResponse(response$, options)
    }

    /**
     * @param endpoint Note: needs to start with a slash
     * @param body
     * @param options The HTTP options to send with the request */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patch<T>(endpoint: string, body: Record<string, any>, options?: HttpClientOptions<'patch'>) {
        const url = this.baseUrl + endpoint
        const response$ = this.http.patch<T>(url, body, this.addBearerToken(options))

        return this.handleResponse(response$, options)
    }

    delete<T>(endpoint: string, options?: HttpClientOptions<'delete'>) {
        const url = this.baseUrl + endpoint
        const response$ = this.http.delete<T>(url, this.addBearerToken(options))

        return this.handleResponse(response$, options)
    }

    private handleResponse<T>(response$: Observable<T>, options: HttpClientOptions | undefined) {
        if (options?.disableErrorInterception) return response$.pipe(useDelay())

        return response$.pipe(useDelay(), interceptErrors(this))
    }

    /** Adds bearer token inside the 'headers'*/
    private addBearerToken(options: HttpClientOptions | undefined): HttpClientOptions {
        if (!this.bearerToken) return options || {}

        options ||= {}
        options.headers ||= {}
        const headers = options.headers as { Authorization: string }
        headers.Authorization ||= `Bearer ${this.bearerToken}`

        return options
    }
}
