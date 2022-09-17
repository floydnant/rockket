import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { TaskPriority, TaskStatus } from 'src/app/models/task.model'
import { DoubleEllipsisIconComponent } from '../../atoms/icons/double-ellipsis-icon/double-ellipsis-icon.component'
import { IconComponent } from '../../atoms/icons/icon/icon.component'
import { PriorityIconComponent } from '../../atoms/icons/priority-icon/priority-icon.component'
import { StatusIconComponent } from '../../atoms/icons/status-icon/status-icon.component'

import { TaskComponent } from './task.component'

describe('TaskComponent', () => {
    let component: TaskComponent
    let fixture: ComponentFixture<TaskComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                TaskComponent,
                FocusableDirective,
                StatusIconComponent,
                PriorityIconComponent,
                IconComponent,
                DoubleEllipsisIconComponent,
            ],
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskComponent)
        component = fixture.componentInstance
        component.data = {
            title: 'Task title here',
            priority: TaskPriority.NONE,
            status: TaskStatus.OPEN,
        }
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
    // @TODO: test for appearance if data here
})
