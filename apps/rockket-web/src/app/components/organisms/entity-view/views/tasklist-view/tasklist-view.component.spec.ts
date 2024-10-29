import { AsyncPipe } from '@angular/common'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BehaviorSubject } from 'rxjs'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'
import { EntityViewData, ENTITY_VIEW_DATA } from '../../entity-view.component'

import { TasklistViewComponent } from './tasklist-view.component'
import { RxModule } from 'src/app/rx/rx.module'

describe('TasklistViewComponent', () => {
    let component: TasklistViewComponent
    let fixture: ComponentFixture<TasklistViewComponent>

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entityViewDataMock: EntityViewData<any> = {
            detail$: new BehaviorSubject(null),
            entity$: new BehaviorSubject(null),
            options$: new BehaviorSubject(null),
        }
        await TestBed.configureTestingModule({
            declarations: [TasklistViewComponent],
            providers: [{ provide: ENTITY_VIEW_DATA, useValue: entityViewDataMock }, storeMock, actionsMock],
            imports: [AsyncPipe, RxModule],
        }).compileComponents()

        fixture = TestBed.createComponent(TasklistViewComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
