import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TipTapEditorToolbarComponent } from './tip-tap-editor-toolbar.component'
import { provideEditorFeatures, getDefaultEditorFeatures } from '../editor.features'
import { CdkMenuModule } from '@angular/cdk/menu'
import { TipTapEditorComponent } from '../tip-tap-editor/tip-tap-editor.component'

describe('TipTapEditorToolbarComponent', () => {
    let component: TipTapEditorToolbarComponent
    let fixture: ComponentFixture<TipTapEditorToolbarComponent>

    beforeEach(async () => {
        const editorFeaturesProvider = provideEditorFeatures(getDefaultEditorFeatures())
        await TestBed.configureTestingModule({
            imports: [CdkMenuModule],
            declarations: [TipTapEditorToolbarComponent],
            providers: [editorFeaturesProvider],
        }).compileComponents()

        fixture = TestBed.createComponent(TipTapEditorToolbarComponent)
        component = fixture.componentInstance
        component.ttEditor = new TipTapEditorComponent(editorFeaturesProvider.useValue)
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
