import { ChangeDetectionStrategy, Component } from '@angular/core'
import { TaskPriority, TaskRecursive, TaskStatus } from '@rockket/commons'
import {
    createLocalKvBooleanStoreProxy,
    createLocalKvObjectStoreProxy,
    defaultViewSettings,
} from 'src/app/services/ui-state.service'

const listId = 'priority-demo'
const demoTasks: TaskRecursive[] = [
    {
        id: listId + 'task-one',
        title: 'This needs to be done yesterday',
        description: '',
        listId,
        status: TaskStatus.Open,
        priority: TaskPriority.Urgent,
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
        status: TaskStatus.Open,
        priority: TaskPriority.High,
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
        status: TaskStatus.Open,
        priority: TaskPriority.Medium,
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
        status: TaskStatus.Open,
        priority: TaskPriority.None,
        parentTaskId: '',
        children: [],
        createdAt: new Date(),
        statusUpdatedAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-five',
        title: 'This thing got deprioritized',
        description: '',
        listId,
        status: TaskStatus.Open,
        priority: TaskPriority.Low,
        parentTaskId: '',
        children: [],
        createdAt: new Date(),
        statusUpdatedAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-six',
        title: 'This thing can wait until everything is else is done',
        description: '',
        listId,
        status: TaskStatus.Open,
        priority: TaskPriority.Optional,
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
    template: `
        <app-task-tree
            [tasks]="tasks"
            [readonly]="true"
            [viewSettingsStore]="viewSettingsStore"
            [expandedStore]="expandedStore"
            parentId="nesting-demo"
        ></app-task-tree>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskPriorityDemoComponent {
    tasks = demoTasks
    viewSettingsStore = createLocalKvObjectStoreProxy(defaultViewSettings)
    expandedStore = createLocalKvBooleanStoreProxy()
}
