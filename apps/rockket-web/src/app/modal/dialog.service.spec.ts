import { Dialog } from '@angular/cdk/dialog'
import { TestBed } from '@angular/core/testing'

import { DialogService } from './dialog.service'

describe('DialogService', () => {
    let service: DialogService

    beforeEach(() => {
        TestBed.configureTestingModule({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            providers: [{ provide: Dialog, useValue: { open() {} } }],
        })
        service = TestBed.inject(DialogService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
