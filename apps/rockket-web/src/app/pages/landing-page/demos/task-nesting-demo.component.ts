import { ChangeDetectionStrategy, Component } from '@angular/core'
import { TaskPreviewRecursive, TaskPriority, TaskStatus } from '@rockket/commons'

const listId = 'nesting-demo'
const demoTasks: TaskPreviewRecursive[] = [
    {
        id: listId + 'task-one',
        title: 'Plan birthday party for sarah',
        description: '',
        listId,
        status: TaskStatus.OPEN,
        priority: TaskPriority.NONE,
        parentTaskId: '',
        closedAt: null,
        createdAt: new Date().toISOString(),
        children: [
            {
                id: listId + 'task-one-zero',
                title: 'Create a guest list and send out invitations ',
                description: '',
                listId,
                status: TaskStatus.OPEN,
                priority: TaskPriority.NONE,
                parentTaskId: '',
                children: [],
                createdAt: new Date().toISOString(),
                closedAt: null,
            },
            {
                id: listId + 'task-one-one',
                title: 'Set up the party space',
                description: '',
                listId,
                status: TaskStatus.OPEN,
                priority: TaskPriority.NONE,
                parentTaskId: '',
                closedAt: null,
                createdAt: new Date().toISOString(),
                children: [
                    {
                        id: listId + 'task-one-one-one',
                        title: 'Decorate the living room',
                        description: '',
                        listId,
                        status: TaskStatus.OPEN,
                        priority: TaskPriority.NONE,
                        parentTaskId: '',
                        children: [],
                        createdAt: new Date().toISOString(),
                        closedAt: null,
                    },
                    {
                        id: listId + 'task-one-one-two',
                        title: 'Setup DJ equipment',
                        description: '',
                        listId,
                        status: TaskStatus.OPEN,
                        priority: TaskPriority.NONE,
                        parentTaskId: '',
                        children: [],
                        createdAt: new Date().toISOString(),
                        closedAt: null,
                    },
                ],
            },
            {
                id: listId + 'task-one-two',
                title: 'Plan the menu and make purchases',
                description: `
                    <ul>
                        <li>food, drinks</li>
                        <li>snacks, appetizers</li>
                        <li>birthday cake</li>
                        <li>balloons</li>
                        <li>birthday banner</li>
                    </ul>
                `,
                listId,
                status: TaskStatus.OPEN,
                priority: TaskPriority.NONE,
                parentTaskId: '',
                children: [],
                createdAt: new Date().toISOString(),
                closedAt: null,
            },
        ],
    },
]

@Component({
    selector: 'app-task-nesting-demo',
    template: `<app-task-tree [tasks]="tasks" [readonly]="true" [expandAll]="true"></app-task-tree>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskNestingDemoComponent {
    tasks = demoTasks
}
