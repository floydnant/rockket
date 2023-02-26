import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UiStateService } from 'src/app/services/ui-state.service'
import { actionsMock } from 'src/app/utils/unit-test.mocks'

import { SidebarLayoutComponent } from './sidebar-layout.component'

describe('SidebarLayoutComponent', () => {
    let component: SidebarLayoutComponent
    let fixture: ComponentFixture<SidebarLayoutComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SidebarLayoutComponent],
            providers: [UiStateService, actionsMock],
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarLayoutComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
