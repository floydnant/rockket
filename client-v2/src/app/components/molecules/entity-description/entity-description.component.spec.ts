import { ComponentFixture, TestBed } from '@angular/core/testing'

import { EntityDescriptionComponent } from './entity-description.component'

describe('EntityDescriptionComponent', () => {
    let component: EntityDescriptionComponent
    let fixture: ComponentFixture<EntityDescriptionComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
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
