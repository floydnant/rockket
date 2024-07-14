import { ComponentFixture, TestBed } from '@angular/core/testing'
import { actionsMock, activatedRouteMock, storeMock } from 'src/app/utils/unit-test.mocks'

import { HomeComponent } from './home.component'
import { DialogModule } from '@angular/cdk/dialog'

describe('HomeComponent', () => {
    let component: HomeComponent
    let fixture: ComponentFixture<HomeComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DialogModule],
            declarations: [HomeComponent],
            providers: [storeMock, actionsMock, activatedRouteMock],
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
