import { AsyncPipe } from '@angular/common'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BehaviorSubject } from 'rxjs'
import { storeMock } from 'src/app/utils/unit-test.mocks'
import { EntityViewComponent, ENTITY_VIEW_DATA } from '../../entity-view.component'

import { TasklistViewComponent } from './tasklist-view.component'

describe('TasklistViewComponent', () => {
    let component: TasklistViewComponent
    let fixture: ComponentFixture<TasklistViewComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TasklistViewComponent],
            providers: [
                { provide: ENTITY_VIEW_DATA, useValue: new BehaviorSubject(null) },
                storeMock,
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: EntityViewComponent, useValue: { progress$: { next() {} } } },
            ],
            imports: [AsyncPipe],
        }).compileComponents()

        fixture = TestBed.createComponent(TasklistViewComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
