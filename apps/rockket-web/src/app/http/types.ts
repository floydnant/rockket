import { HttpClient, HttpErrorResponse } from '@angular/common/http'

type HttpMethods = 'get' | 'put' | 'post' | 'delete' | 'patch' | 'options'
type HttpMethodsWithoutBodyParam = 'get' | 'delete' | 'options'
type OriginalHttpClientOptions<K extends keyof HttpClient & HttpMethods> = Parameters<
    HttpClient[K]
>[K extends HttpMethodsWithoutBodyParam ? 1 : 2]

type HttpClientOptionsMap = {
    [method in HttpMethods]: OriginalHttpClientOptions<method> & {
        disableErrorInterception?: boolean
        // If only we had more options...
    }
}

export type HttpClientOptions<K extends HttpMethods | null = null> = K extends HttpMethods
    ? HttpClientOptionsMap[K]
    : HttpClientOptionsMap[HttpMethods]

export type StatusCode = number | '0 - SERVER DOWN' | '0 - OFFLINE'

export interface HttpServerErrorResponse extends Omit<HttpErrorResponse, 'type'> {
    error: {
        message: string | string[]
        error?: string
        statusCode: StatusCode
    }
}

export type HttpServerErrorResponseWithMeta<T = { id: string }> = HttpServerErrorResponse & T

export type HttpSuccessResponse<T extends Record<string, unknown> = Record<never, unknown>> = T & {
    successMessage: string
}
