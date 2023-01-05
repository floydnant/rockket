import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'

import { EditableEntityNameComponent } from './editable-entity-name.component'

describe('EditableEntityHeadingComponent', () => {
    let component: EditableEntityNameComponent
    let fixture: ComponentFixture<EditableEntityNameComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EditableEntityNameComponent, FocusableDirective],
            providers: [storeMock, actionsMock],
        }).compileComponents()

        fixture = TestBed.createComponent(EditableEntityNameComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
