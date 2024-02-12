/* eslint-disable @typescript-eslint/no-empty-function */
import { ActivatedRoute } from '@angular/router'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { BehaviorSubject, Observable } from 'rxjs'
import { HttpService } from '../http/http.service'
import { InsightsService } from '../services/insights.service'
import { MenuService } from '../components/templates/sidebar-layout/menu.service'

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

export const insightsMock = {
    provide: InsightsService,
    useValue: {},
}

export const menuServiceMock = {
    provide: MenuService,
    useValue: { sidebarWidth$: new BehaviorSubject(180) } as MenuService,
}
