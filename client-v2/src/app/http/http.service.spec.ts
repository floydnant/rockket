import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { Store } from '@ngrx/store'

import { HttpService } from './http.service'

describe('HttpService', () => {
    let service: HttpService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: HttpClient,
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    useValue: { get() {}, post() {}, patch() {}, delete() {} },
                },
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: Store, useValue: { subscribe() {} } },
            ],
        })
        service = TestBed.inject(HttpService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
