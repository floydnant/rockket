import { TestBed } from '@angular/core/testing'
import { UiStateService } from 'src/app/services/ui-state.service'
import { actionsMock } from 'src/app/utils/unit-test.mocks'

import { MenuService } from './menu.service'

describe('MenuService', () => {
    let service: MenuService

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MenuService, UiStateService, actionsMock],
        })
        service = TestBed.inject(MenuService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
