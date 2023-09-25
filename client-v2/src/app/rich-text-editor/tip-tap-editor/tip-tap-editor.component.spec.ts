import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TipTapEditorComponent } from './tip-tap-editor.component'

describe('TipTapEditorComponent', () => {
    let component: TipTapEditorComponent
    let fixture: ComponentFixture<TipTapEditorComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TipTapEditorComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(TipTapEditorComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
