import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RtEditorToolbarComponent } from './rt-editor-toolbar.component'

describe('FormattingOptionswComponent', () => {
    let component: RtEditorToolbarComponent
    let fixture: ComponentFixture<RtEditorToolbarComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RtEditorToolbarComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(RtEditorToolbarComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
