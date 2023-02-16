import { CdkMenuModule } from '@angular/cdk/menu'
import { testName } from 'cypress/support/helpers'
import { BehaviorSubject, of } from 'rxjs'
import { EntityPageLabelComponent } from 'src/app/components/atoms/entity-page-label/entity-page-label.component'
import { InlineEditorComponent } from 'src/app/components/atoms/inline-editor/inline-editor.component'
import { DropDownComponent } from 'src/app/components/molecules/drop-down/drop-down.component'
import { EditableEntityTitleComponent } from 'src/app/components/molecules/editable-entity-heading/editable-entity-title.component'
import { PageProgressBarComponent } from 'src/app/components/molecules/page-progress-bar/page-progress-bar.component'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { MutationDirective } from 'src/app/directives/mutation.directive'
import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TaskDetail, TaskPriority, TaskStatus } from 'src/app/fullstack-shared-models/task.model'
import { TaskTreeMap } from 'src/app/store/entities/entities.state'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'
import { EntityViewComponent, EntityViewData, ENTITY_VIEW_DATA } from '../../entity-view.component'
import { TaskViewComponent } from './task-view.component'

const setupComponent = (viewData: EntityViewData<TaskDetail>, taskTreeMap: TaskTreeMap = {}) => {
    const store = {
        ...storeMock,
        useValue: {
            ...storeMock.useValue,
            select() {
                return of(taskTreeMap)
            },
        },
    }
    cy.mount(`<app-task-view></app-task-view> `, {
        componentProperties: {},
        imports: [CdkMenuModule],
        declarations: [
            TaskViewComponent,
            MutationDirective,
            FocusableDirective,
            EditableEntityTitleComponent,
            EntityPageLabelComponent,
            PageProgressBarComponent,
            DropDownComponent,
            InlineEditorComponent,
        ],
        providers: [
            { provide: ENTITY_VIEW_DATA, useValue: viewData },
            store,
            { provide: EntityViewComponent, useValue: { progress$: new BehaviorSubject<number | null>(null) } },
            actionsMock,
        ],
    })
}

const entityFixture: EntityPreviewRecursive = {
    id: 'the mock id',
    entityType: EntityType.TASK,
    title: 'The mock title',
    children: [],
    parentId: '',
}
const taskDetailFixture: TaskDetail = {
    description: '',
    createdAt: '',
    ownerId: '',
    title: 'The mock title',
    blockedById: '',
    closedAt: '',
    deadline: '',
    id: 'the mock id',
    inProgressSince: '',
    listId: '',
    openedAt: '',
    parentTaskId: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.OPEN,
    subtaskIds: [],
}

describe('TaskViewComponent', () => {
    it('renders the task', () => {
        setupComponent({
            entity$: new BehaviorSubject(entityFixture),
            detail$: new BehaviorSubject(taskDetailFixture),
            options$: new BehaviorSubject(null),
        })

        cy.get(testName('editable-entity-name')).contains(entityFixture.title)
        // cy.get(testName('description-editor')).should('be.hidden')
    })
})
