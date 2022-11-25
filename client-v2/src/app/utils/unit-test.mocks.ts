/* eslint-disable @typescript-eslint/no-empty-function */
import { Store } from '@ngrx/store'

export const storeMock = {
    provide: Store,
    useValue: {
        subscribe() {},
        select() {
            return this
        },
    },
}
