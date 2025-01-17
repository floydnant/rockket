import { ChangeDetectionStrategy, Component } from '@angular/core'
import { TaskPriority, TaskRecursive, TaskStatus } from '@rockket/commons'
import {
    createLocalKvBooleanStoreProxy,
    createLocalKvObjectStoreProxy,
    defaultViewSettings,
} from 'src/app/services/ui-state.service'

const listId = 'status-demo'

const demoTasks: TaskRecursive[] = [
    {
        id: listId + 'task-one',
        title: 'This thing is currently in the making',
        description: '',
        listId,
        status: TaskStatus.InProgress,
        priority: TaskPriority.None,
        parentTaskId: '',
        children: [],
        statusUpdatedAt: new Date(),
        createdAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-six',
        title: 'This thing is being reviewed',
        description: '',
        listId,
        status: TaskStatus.InReview,
        priority: TaskPriority.None,
        parentTaskId: '',
        children: [],
        statusUpdatedAt: new Date(),
        createdAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-two',
        title: "A thing that's ready to be worked on",
        description: '',
        listId,
        status: TaskStatus.Open,
        priority: TaskPriority.None,
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
        status: TaskStatus.Backlog,
        priority: TaskPriority.None,
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
        status: TaskStatus.Completed,
        priority: TaskPriority.None,
        parentTaskId: '',
        children: [],
        statusUpdatedAt: new Date(),
        createdAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
    {
        id: listId + 'task-five',
        title: 'A thing that turned out to be unwanted',
        description: '',
        listId,
        status: TaskStatus.Discarded,
        priority: TaskPriority.None,
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
export class TaskStatusDemoComponent {
    tasks = demoTasks
    viewSettingsStore = createLocalKvObjectStoreProxy(defaultViewSettings)
    expandedStore = createLocalKvBooleanStoreProxy()
}
