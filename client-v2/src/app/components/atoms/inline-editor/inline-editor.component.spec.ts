import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FocusableDirective } from 'src/app/directives/focusable.directive'

import { InlineEditorComponent } from './inline-editor.component'
import { HighlightPipe } from 'src/app/pipes/highlight.pipe'
import { PushModule } from '@rx-angular/template/push'

describe('InlineEditorComponent', () => {
    let component: InlineEditorComponent
    let fixture: ComponentFixture<InlineEditorComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PushModule],
            declarations: [InlineEditorComponent, FocusableDirective, HighlightPipe],
        }).compileComponents()

        fixture = TestBed.createComponent(InlineEditorComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
