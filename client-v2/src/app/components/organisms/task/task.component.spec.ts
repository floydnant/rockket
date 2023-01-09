import { CdkMenuModule } from '@angular/cdk/menu'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { TaskPriority, TaskStatus } from 'src/app/models/task.model'
import { DoubleEllipsisIconComponent } from '../../atoms/icons/double-ellipsis-icon/double-ellipsis-icon.component'
import { IconComponent } from '../../atoms/icons/icon/icon.component'
import { IconsModule } from '../../atoms/icons/icons.module'
import { PriorityIconComponent } from '../../atoms/icons/priority-icon/priority-icon.component'

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
        component.task = {
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
        }
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
    // @TODO: test for appearance if data here
})
