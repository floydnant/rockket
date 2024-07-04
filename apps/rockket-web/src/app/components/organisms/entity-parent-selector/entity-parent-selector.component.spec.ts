import { ComponentFixture, TestBed } from '@angular/core/testing'
import { EntityParentSelectorComponent } from './entity-parent-selector.component'

describe('EntityParentSelectorComponent', () => {
    let component: EntityParentSelectorComponent
    let fixture: ComponentFixture<EntityParentSelectorComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EntityParentSelectorComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(EntityParentSelectorComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
