import { ComponentFixture, TestBed } from '@angular/core/testing'

import { EntityDescriptionComponent } from './entity-description.component'
import { RichTextEditorModule } from 'src/app/rich-text-editor/rich-text-editor.module'
import { RxModule } from 'src/app/rx/rx.module'

describe('EntityDescriptionComponent', () => {
    let component: EntityDescriptionComponent
    let fixture: ComponentFixture<EntityDescriptionComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RichTextEditorModule, RxModule],
            declarations: [EntityDescriptionComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(EntityDescriptionComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
