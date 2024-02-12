import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UiStateService } from 'src/app/services/ui-state.service'
import { actionsMock } from 'src/app/utils/unit-test.mocks'

import { SidebarLayoutComponent } from './sidebar-layout.component'
import { TooltipModule } from 'src/app/tooltip/tooltip.module'
import { MenuToggleComponent } from './menu-toggle/menu-toggle.component'
import { IconsModule } from '../../atoms/icons/icons.module'

describe('SidebarLayoutComponent', () => {
    let component: SidebarLayoutComponent
    let fixture: ComponentFixture<SidebarLayoutComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TooltipModule, IconsModule],
            declarations: [SidebarLayoutComponent, MenuToggleComponent],
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
