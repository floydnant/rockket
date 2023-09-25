import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TipTapEditorToolbarComponent } from './tip-tap-editor-toolbar.component'

describe('TipTapEditorToolbarComponent', () => {
    let component: TipTapEditorToolbarComponent
    let fixture: ComponentFixture<TipTapEditorToolbarComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TipTapEditorToolbarComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(TipTapEditorToolbarComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
