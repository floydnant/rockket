import { ComponentFixture, TestBed } from '@angular/core/testing'
import { activatedRouteMock } from 'src/app/utils/unit-test.mocks'

import { SettingsComponent } from './settings.component'

describe('SettingsComponent', () => {
    let component: SettingsComponent
    let fixture: ComponentFixture<SettingsComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
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
