import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UiStateService } from 'src/app/services/ui-state.service'
import { actionsMock } from 'src/app/utils/unit-test.mocks'

import { MenuToggleComponent } from './menu-toggle.component'

describe('MenuToggleComponent', () => {
    let component: MenuToggleComponent
    let fixture: ComponentFixture<MenuToggleComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MenuToggleComponent],
            providers: [UiStateService, actionsMock],
        }).compileComponents()

        fixture = TestBed.createComponent(MenuToggleComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
