import { ChangeDetectionStrategy, Component } from '@angular/core'
import { TaskRecursive, TaskPriority, TaskStatus } from '@rockket/commons'

const listId = 'status-demo'

const demoTasks: TaskRecursive[] = [
    {
        id: listId + 'task-one',
        title: 'This thing is currently in the making',
        description: '',
        listId,
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.NONE,
        parentTaskId: '',
        children: [],
        statusUpdatedAt: new Date(),
        createdAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-two',
        title: 'A thing that can be worked on at any time',
        description: '',
        listId,
        status: TaskStatus.OPEN,
        priority: TaskPriority.NONE,
        parentTaskId: '',
        children: [],
        statusUpdatedAt: new Date(),
        createdAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-three',
        title: 'A thing that is pushed to later points in time',
        description: '',
        listId,
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.NONE,
        parentTaskId: '',
        children: [],
        statusUpdatedAt: new Date(),
        createdAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-four',
        title: 'A thing that is done',
        description: '',
        listId,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.NONE,
        parentTaskId: '',
        children: [],
        statusUpdatedAt: new Date(),
        createdAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-five',
        title: 'A thing that turned out to be unnecessary',
        description: '',
        listId,
        status: TaskStatus.NOT_PLANNED,
        priority: TaskPriority.NONE,
        parentTaskId: '',
        children: [],
        statusUpdatedAt: new Date(),
        createdAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
]

@Component({
    selector: 'app-task-status-demo',
    template: `<app-task-tree [tasks]="tasks" [readonly]="true"></app-task-tree>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStatusDemoComponent {
    tasks = demoTasks
}
