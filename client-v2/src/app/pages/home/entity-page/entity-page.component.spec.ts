import { CdkMenuModule } from '@angular/cdk/menu'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { activatedRouteMock, storeMock } from 'src/app/utils/unit-test.mocks'

import { EntityPageComponent } from './entity-page.component'

describe('EntityPageComponent', () => {
    let component: EntityPageComponent
    let fixture: ComponentFixture<EntityPageComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CdkMenuModule],
            declarations: [EntityPageComponent],
            providers: [storeMock, activatedRouteMock],
        }).compileComponents()

        fixture = TestBed.createComponent(EntityPageComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
