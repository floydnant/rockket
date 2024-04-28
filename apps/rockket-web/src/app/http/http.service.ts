import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { AppState } from '../store'
import { userSelectors } from '../store/user/user.selectors'
import { HttpClientOptions } from './types'
import { interceptErrors } from './http.utils'
import { useDelay } from './http.utils'

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
