import { CdkMenuModule } from '@angular/cdk/menu'
import { testName } from 'cypress/support/helpers'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { MutationDirective } from 'src/app/directives/mutation.directive'
import { TaskPreviewRecursive, TaskPriority, TaskStatus } from 'src/app/fullstack-shared-models/task.model'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'
import { IconsModule } from '../../atoms/icons/icons.module'
import { InlineEditorComponent } from '../../atoms/inline-editor/inline-editor.component'
import { TaskComponent } from '../task/task.component'
import { TaskTreeComponent } from './task-tree.component'
import { PushModule } from '@rx-angular/template/push'
import { HighlightPipe } from 'src/app/pipes/highlight.pipe'

const setupComponent = (taskTree: TaskPreviewRecursive[]) => {
    cy.mount(`<app-task-tree [tasks]="taskTree"></app-task-tree>`, {
        componentProperties: { taskTree },
        imports: [IconsModule, CdkMenuModule, PushModule],
        declarations: [
            TaskTreeComponent,
            TaskComponent,
            InlineEditorComponent,
            FocusableDirective,
            MutationDirective,
            HighlightPipe,
        ],
        providers: [storeMock, actionsMock],
    })
}

const newTaskRecursive = (args?: { children: TaskPreviewRecursive[] }): TaskPreviewRecursive => ({
    id: Math.random().toString(),
    title: 'A Task title',
    listId: '1',
    description: '',
    parentTaskId: '10',
    priority: TaskPriority.OPTIONAL,
    status: TaskStatus.BACKLOG,
    children: args?.children || [],
})

const taskTreeFixture: TaskPreviewRecursive[] = [
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

        cy.get(testName('task-tree-node')).should('have.length', 12)

        cy.get(testName('subtask-toggle')).first().click()
        cy.get(testName('task-tree-node')).should('have.length', 10)

        cy.get(testName('subtask-toggle')).first().click()
        cy.get(testName('task-tree-node')).should('have.length', 12)
    })
})
