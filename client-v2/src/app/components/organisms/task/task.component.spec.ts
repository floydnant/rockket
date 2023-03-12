import { CdkMenuModule } from '@angular/cdk/menu'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { BehaviorSubject } from 'rxjs'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { TaskPreview, TaskPreviewFlattend, TaskPriority, TaskStatus } from 'src/app/fullstack-shared-models/task.model'
import { IconsModule } from '../../atoms/icons/icons.module'

import { TaskComponent } from './task.component'

describe('TaskComponent', () => {
    let component: TaskComponent
    let fixture: ComponentFixture<TaskComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IconsModule, CdkMenuModule],
            declarations: [TaskComponent, FocusableDirective],
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskComponent)
        component = fixture.componentInstance
        component.task$ = new BehaviorSubject({
            id: '',
            title: 'Task title here',
            priority: TaskPriority.NONE,
            status: TaskStatus.OPEN,
            description: '',
            listId: '',
            // ownerId: '',
            // closedAt: '',
            // deadline: '',
            // openedAt: '',
            // createdAt: '',
            // subtaskIds: [],
            // blockedById: '',
            parentTaskId: '',
            // inProgressSince: '',
        } as null | TaskPreviewFlattend)
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
    // @TODO: test for appearance if data here
})
