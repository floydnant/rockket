import { ComponentFixture, TestBed } from '@angular/core/testing'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'

import { GenericTreeComponent } from './generic-tree.component'

describe('TaskTreeComponent', () => {
    let component: GenericTreeComponent
    let fixture: ComponentFixture<GenericTreeComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GenericTreeComponent],
            providers: [storeMock, actionsMock],
        }).compileComponents()

        fixture = TestBed.createComponent(GenericTreeComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
