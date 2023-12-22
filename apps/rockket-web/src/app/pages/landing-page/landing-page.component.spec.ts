import { ComponentFixture, TestBed } from '@angular/core/testing'

import { LandingPageComponent } from './landing-page.component'
import { CenteredLayoutComponent } from 'src/app/components/templates/centered-layout/centered-layout.component'
import { RxModule } from 'src/app/rx/rx.module'
import { TooltipModule } from 'src/app/tooltip/tooltip.module'
import { UserMenuComponent } from 'src/app/components/organisms/user-menu/user-menu.component'
import { IconsModule } from 'src/app/components/atoms/icons/icons.module'

describe('LandingPageComponent', () => {
    let component: LandingPageComponent
    let fixture: ComponentFixture<LandingPageComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RxModule, TooltipModule, IconsModule],
            declarations: [LandingPageComponent, CenteredLayoutComponent],
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(LandingPageComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
