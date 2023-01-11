import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'

import { EditableEntityTitleComponent } from './editable-entity-title.component'

describe('EditableEntityHeadingComponent', () => {
    let component: EditableEntityTitleComponent
    let fixture: ComponentFixture<EditableEntityTitleComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EditableEntityTitleComponent, FocusableDirective],
            providers: [storeMock, actionsMock],
        }).compileComponents()

        fixture = TestBed.createComponent(EditableEntityTitleComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
