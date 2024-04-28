import { CdkMenuModule } from '@angular/cdk/menu'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TaskFlattend, TaskPriority, TaskStatus } from '@rockket/commons'
import { BehaviorSubject } from 'rxjs'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { HighlightPipe } from 'src/app/pipes/highlight.pipe'
import { RxModule } from 'src/app/rx/rx.module'
import { IconsModule } from '../../atoms/icons/icons.module'
import { TaskComponent } from './task.component'

describe('TaskComponent', () => {
    let component: TaskComponent
    let fixture: ComponentFixture<TaskComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [IconsModule, CdkMenuModule, RxModule],
            declarations: [TaskComponent, FocusableDirective, HighlightPipe],
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskComponent)
        component = fixture.componentInstance
        component.task$ = new BehaviorSubject<TaskFlattend | null>({
            id: '',
            title: 'Task title here',
            priority: TaskPriority.NONE,
            status: TaskStatus.OPEN,
            description: '',
            listId: '',
            ownerId: '5',
            deadline: null,
            createdAt: new Date(),
            statusUpdatedAt: new Date(),
            parentTaskId: '',
            children: [],
            path: [],
        })
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
    // @TODO: test for appearance if data here
})
