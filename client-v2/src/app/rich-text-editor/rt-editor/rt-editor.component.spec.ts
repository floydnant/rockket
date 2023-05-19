import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RtEditorComponent } from './rt-editor.component'

describe('RichTextEditorComponent', () => {
    let component: RtEditorComponent
    let fixture: ComponentFixture<RtEditorComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RtEditorComponent],
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(RtEditorComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
