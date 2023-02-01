import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FocusableDirective } from 'src/app/directives/focusable.directive'

import { InlineEditorComponent } from './inline-editor.component'

describe('InlineEditorComponent', () => {
    let component: InlineEditorComponent
    let fixture: ComponentFixture<InlineEditorComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InlineEditorComponent, FocusableDirective],
        }).compileComponents()

        fixture = TestBed.createComponent(InlineEditorComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
