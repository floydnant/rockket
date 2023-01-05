/* eslint-disable @typescript-eslint/no-empty-function */
import { ActivatedRoute } from '@angular/router'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { Observable } from 'rxjs'
import { HttpService } from '../http/http.service'

export const storeMock = {
    provide: Store,
    useValue: {
        subscribe() {},
        select() {
            return this
        },
        pipe() {
            return new Observable()
        },
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

export const activatedRouteMock = {
    provide: ActivatedRoute,
    useValue: {
        url: {
            pipe() {
                return new Observable()
            },
        },
        paramMap: {
            pipe() {
                return new Observable()
            },
        },
    },
}

export const actionsMock = {
    provide: Actions,
    useValue: {
        pipe() {
            return new Observable()
        },
    },
}
