import { ComponentFixture, TestBed } from '@angular/core/testing'
import { activatedRouteMock } from 'src/app/utils/unit-test.mocks'

import { SettingsComponent } from './settings.component'
import { IconsModule } from 'src/app/components/atoms/icons/icons.module'

describe('SettingsComponent', () => {
    let component: SettingsComponent
    let fixture: ComponentFixture<SettingsComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IconsModule],
            declarations: [SettingsComponent],
            providers: [activatedRouteMock],
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(SettingsComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
