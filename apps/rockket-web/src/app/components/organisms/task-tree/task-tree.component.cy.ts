import { CdkMenuModule } from '@angular/cdk/menu'
import { TaskRecursive, TaskPriority, TaskStatus } from '@rockket/commons'
import { testName } from 'cypress/support/helpers'
import { FocusableDirective } from 'src/app/focusable/focusable.directive'
import { MutationDirective } from 'src/app/directives/mutation.directive'
import { DropdownModule } from 'src/app/dropdown/dropdown.module'
import { HighlightPipe } from 'src/app/pipes/highlight.pipe'
import { RichTextEditorModule } from 'src/app/rich-text-editor/rich-text-editor.module'
import { RxModule } from 'src/app/rx/rx.module'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'
import { IconsModule } from '../../atoms/icons/icons.module'
import { InlineEditorComponent } from '../../atoms/inline-editor/inline-editor.component'
import { TaskComponent } from '../task/task.component'
import { TaskTreeComponent } from './task-tree.component'
import { GenericTreeComponent } from '../generic-tree/generic-tree.component'
import { TaskTreeNodeAdapterComponent } from '../task-tree-node-adapter/task-tree-node-adapter.component'
import {
    createLocalBooleanMapStoreProxy,
    createLocalSingleValueStoreProxy,
    defaultViewSettings,
} from 'src/app/services/ui-state.service'

const setupComponent = (taskTree: TaskRecursive[]) => {
    cy.mount(
        `<app-task-tree
            [tasks]="taskTree"
            [viewSettingsStore]="viewSettingsStore"
            [expandedStore]="expandedStore"
            [descriptionExpandedStore]="descriptionExpandedStore"
        ></app-task-tree>`,
        {
            componentProperties: {
                taskTree,
                viewSettingsStore: createLocalSingleValueStoreProxy(defaultViewSettings),
                expandedStore: createLocalBooleanMapStoreProxy(),
                descriptionExpandedStore: createLocalBooleanMapStoreProxy(false),
            },
            imports: [IconsModule, CdkMenuModule, RxModule, RichTextEditorModule, DropdownModule],
            declarations: [
                GenericTreeComponent,
                TaskTreeNodeAdapterComponent,
                TaskTreeComponent,
                TaskComponent,
                InlineEditorComponent,
                FocusableDirective,
                MutationDirective,
                HighlightPipe,
            ],
            providers: [storeMock, actionsMock],
        },
    )
}

const newTaskRecursive = (args?: { children: TaskRecursive[] }): TaskRecursive => ({
    id: Math.random().toString(),
    title: 'A Task title',
    listId: '1',
    description: '',
    parentTaskId: '10',
    priority: TaskPriority.Optional,
    status: TaskStatus.Backlog,
    children: args?.children || [],
    createdAt: new Date(),
    deadline: null,
    ownerId: '5',
    statusUpdatedAt: new Date(),
})

const taskTreeFixture: TaskRecursive[] = [
    newTaskRecursive({
        children: [newTaskRecursive(), newTaskRecursive()],
    }),
    newTaskRecursive(),
    newTaskRecursive({
        children: [
            newTaskRecursive(),
            newTaskRecursive({
                children: [newTaskRecursive(), newTaskRecursive()],
            }),
            newTaskRecursive(),
            newTaskRecursive(),
        ],
    }),
    newTaskRecursive(),
]

describe('TaskTreeComponent', () => {
    it('renders the tasks', () => {
        setupComponent(taskTreeFixture)

        cy.get(testName('task-tree-node')).should('have.length', 12)
        cy.get(`[data-test-node-level="${0}"]`).should('have.length', 4)
        cy.get(`[data-test-node-level="${1}"]`).should('have.length', 6)
        cy.get(`[data-test-node-level="${2}"]`).should('have.length', 2)
    })

    it('can toggle subtasks', () => {
        setupComponent(taskTreeFixture)

        cy.get(testName('task-tree-node') + ':visible').should('have.length', 12)

        cy.get(testName('subtask-toggle')).first().click()
        cy.get(testName('task-tree-node') + ':visible').should('have.length', 10)

        cy.get(testName('subtask-toggle')).first().click()
        cy.get(testName('task-tree-node') + ':visible').should('have.length', 12)
    })
})
