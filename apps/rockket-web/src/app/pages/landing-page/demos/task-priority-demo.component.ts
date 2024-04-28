import { ChangeDetectionStrategy, Component } from '@angular/core'
import { TaskRecursive, TaskPriority, TaskStatus } from '@rockket/commons'

const listId = 'priority-demo'
const demoTasks: TaskRecursive[] = [
    {
        id: listId + 'task-one',
        title: 'Do that extremely urgent thing',
        description: '',
        listId,
        status: TaskStatus.OPEN,
        priority: TaskPriority.URGENT,
        parentTaskId: '',
        children: [],
        createdAt: new Date(),
        statusUpdatedAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-two',
        title: 'Do that really important thing',
        description: '',
        listId,
        status: TaskStatus.OPEN,
        priority: TaskPriority.HIGH,
        parentTaskId: '',
        children: [],
        createdAt: new Date(),
        statusUpdatedAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-three',
        title: 'Do that somewhat important thing',
        description: '',
        listId,
        status: TaskStatus.OPEN,
        priority: TaskPriority.MEDIUM,
        parentTaskId: '',
        children: [],
        createdAt: new Date(),
        statusUpdatedAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-four',
        title: 'No priority assigned',
        description: '',
        listId,
        status: TaskStatus.OPEN,
        priority: TaskPriority.NONE,
        parentTaskId: '',
        children: [],
        createdAt: new Date(),
        statusUpdatedAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-five',
        title: 'This thing can wait until everything is else is done',
        description: '',
        listId,
        status: TaskStatus.OPEN,
        priority: TaskPriority.OPTIONAL,
        parentTaskId: '',
        children: [],
        createdAt: new Date(),
        statusUpdatedAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
]

@Component({
    selector: 'app-task-priority-demo',
    template: `<app-task-tree [tasks]="tasks" [readonly]="true"></app-task-tree>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskPriorityDemoComponent {
    tasks = demoTasks
}
