/* eslint-disable @typescript-eslint/no-empty-function */
import { Store } from '@ngrx/store'
import { HttpService } from '../http/http.service'

export const storeMock = {
    provide: Store,
    useValue: {
        subscribe() {},
        select() {
            return this
        },
        pipe() {},
        dispatch() {},
    },
}

export const httpServiceMock = {
    provide: HttpService,
    useValue: {
        get() {},
        put() {},
        post() {},
        delete() {},
    },
}
