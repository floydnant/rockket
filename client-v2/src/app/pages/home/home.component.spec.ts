import { ComponentFixture, TestBed } from '@angular/core/testing'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'

import { HomeComponent } from './home.component'

describe('HomeComponent', () => {
    let component: HomeComponent
    let fixture: ComponentFixture<HomeComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomeComponent],
            providers: [storeMock, actionsMock],
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
