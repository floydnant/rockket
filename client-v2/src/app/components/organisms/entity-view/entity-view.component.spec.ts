import { CdkMenuModule } from '@angular/cdk/menu'
import { AsyncPipe } from '@angular/common'
import { Injector } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { storeMock } from 'src/app/utils/unit-test.mocks'

import { EntityViewComponent } from './entity-view.component'
import { TasklistViewComponent } from './views/tasklist-view/tasklist-view.component'

describe('EntityViewComponent', () => {
    let component: EntityViewComponent
    let fixture: ComponentFixture<EntityViewComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [EntityViewComponent, TasklistViewComponent],
            providers: [Injector, storeMock],
            imports: [CdkMenuModule, AsyncPipe],
        }).compileComponents()

        fixture = TestBed.createComponent(EntityViewComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
