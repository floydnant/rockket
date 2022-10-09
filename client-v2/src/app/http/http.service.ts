import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Store } from '@ngrx/store'
import { OperatorFunction, catchError, Observable, throwError, mergeMap } from 'rxjs'
import { environment } from 'src/environments/environment'
import { AppState } from '../store'
import { HttpClientOptions } from './types'

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    constructor(public http: HttpClient, private store: Store<AppState>) {
        this.store.subscribe(state => (this.bearerToken = state.user?.authToken))
    }

    private bearerToken?: string | null
    private baseUrl = environment.SERVER_BASE_URL

    // /**
    //  * @param endpoint Note: needs to start with a slash
    //  * @param options The HTTP options to send with the request. */
    // getAsync<T>(...args: Parameters<HttpService['get']>) {
    //     const res = this.get<T>(...args)
    //     return promisifyObservable(res, 'if error property exists')
    // }
    /**
     * @param endpoint Note: needs to start with a slash
     * @param options The HTTP options to send with the request. */
    get<T>(endpoint: string, options?: HttpClientOptions<'get'>) {
        const url = this.baseUrl + endpoint
        const response$ = this.http.get<T>(url, this.addBearerToken(options))

        if (options?.disableErrorInterception) return response$
        return response$.pipe(this.getErrorInterceptor())
    }

    // /**
    //  * @param endpoint Note: needs to start with a slash
    //  * @param body
    //  * @param options The HTTP options to send with the request. */
    // postAsync<T>(...args: Parameters<HttpService['post']>) {
    //     const res = this.post<T>(...args)
    //     return promisifyObservable(res, 'if error property exists')
    // }
    /**
     * @param endpoint Note: needs to start with a slash
     * @param body
     * @param options The HTTP options to send with the request. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post<T>(endpoint: string, body?: Record<string, any>, options?: HttpClientOptions<'post'>) {
        const url = this.baseUrl + endpoint
        const response$ = this.http.post<T>(url, body || {}, this.addBearerToken(options))

        if (options?.disableErrorInterception) return response$
        return response$.pipe(this.getErrorInterceptor())
    }

    /**
     * @param endpoint Note: needs to start with a slash
     * @param body
     * @param options The HTTP options to send with the request */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patch<T>(endpoint: string, body: Record<string, any>, options?: HttpClientOptions<'patch'>) {
        const url = this.baseUrl + endpoint
        const response$ = this.http.patch<T>(url, body, this.addBearerToken(options))

        if (options?.disableErrorInterception) return response$
        return response$.pipe(this.getErrorInterceptor())
    }

    delete<T>(endpoint: string, options?: HttpClientOptions<'delete'>) {
        const url = this.baseUrl + endpoint
        const response$ = this.http.delete<T>(url, this.addBearerToken(options))

        if (options?.disableErrorInterception) return response$
        return response$.pipe(this.getErrorInterceptor())
    }

    /** adds bearer token inside the 'headers'*/
    private addBearerToken<T extends HttpClientOptions>(options: T | undefined): HttpClientOptions {
        if (!this.bearerToken) return options || {}

        return {
            ...(options || {}),
            headers: {
                ...(options?.headers || {}),
                Authorization: `Bearer ${this.bearerToken}`,
            },
        }
    }

    /** catches errors and re-throws an `HttpServerErrorResponse` */
    private getErrorInterceptor<T>(): OperatorFunction<T, T> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return catchError<T, Observable<T>>(({ type, ...err }: HttpErrorResponse) => {
            if (err.status !== 0) return throwError(() => err)

            // check if client is connected to internet
            if (!navigator.onLine)
                return throwError(() => ({
                    ...err,
                    error: {
                        statusCode: '0 - OFFLINE',
                        message: 'You are offline. Please connect to the internet and try again.',
                        error: 'network error',
                    },
                }))

            // check if the server is even up
            return this.get('/health', { disableErrorInterception: true }).pipe(
                // server is up
                mergeMap(() => {
                    return throwError(() => ({
                        ...err,
                        error: {
                            statusCode: 0,
                            message:
                                'An unkown error occurred. Please refresh and try again. If the problem presists, please report it.',
                            error: 'unknown',
                        },
                    }))
                }),
                // server is down
                catchError<T, Observable<T>>(err => {
                    console.warn('second catchError catched:', err)
                    return throwError(() => ({
                        ...err,
                        error: {
                            statusCode: '0 - SERVER DOWN',
                            message: 'We may be experiencing some issues with the server. Please report it.',
                            error: 'server error',
                        },
                    }))
                })
            )
        })
    }
}
