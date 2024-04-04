import { HttpClient } from '@angular/common/http'
import { TestBed } from '@angular/core/testing'
import { storeMock } from '../utils/unit-test.mocks'

import { HttpService } from './http.service'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const httpClientMock = { provide: HttpClient, useValue: { get() {}, post() {}, patch() {}, delete() {} } }

describe('HttpService', () => {
    let service: HttpService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [httpClientMock, storeMock],
        })
        service = TestBed.inject(HttpService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
