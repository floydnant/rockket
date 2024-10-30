import { CdkMenuModule } from '@angular/cdk/menu'
import { EntityPreviewRecursive, EntityType, TaskDetail, TaskPriority, TaskStatus } from '@rockket/commons'
import { testName } from 'cypress/support/helpers'
import { BehaviorSubject, of } from 'rxjs'
import { EntityPageLabelComponent } from 'src/app/components/atoms/entity-page-label/entity-page-label.component'
import { InlineEditorComponent } from 'src/app/components/atoms/inline-editor/inline-editor.component'
import { EditableEntityTitleComponent } from 'src/app/components/molecules/editable-entity-heading/editable-entity-title.component'
import { PageProgressBarComponent } from 'src/app/components/molecules/page-progress-bar/page-progress-bar.component'
import { FocusableDirective } from 'src/app/focusable/focusable.directive'
import { MutationDirective } from 'src/app/directives/mutation.directive'
import { DropdownModule } from 'src/app/dropdown/dropdown.module'
import { HighlightPipe } from 'src/app/pipes/highlight.pipe'
import { RxModule } from 'src/app/rx/rx.module'
import { TaskTreeMap } from 'src/app/store/entities/entities.state'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'
import { ENTITY_VIEW_DATA, EntityViewComponent, EntityViewData } from '../../entity-view.component'
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
        imports: [CdkMenuModule, RxModule, DropdownModule],
        declarations: [
            TaskViewComponent,
            MutationDirective,
            FocusableDirective,
            EditableEntityTitleComponent,
            EntityPageLabelComponent,
            PageProgressBarComponent,
            InlineEditorComponent,
            HighlightPipe,
        ],
        providers: [
            { provide: ENTITY_VIEW_DATA, useValue: viewData },
            store,
            {
                provide: EntityViewComponent,
                useValue: { progress$: new BehaviorSubject<number | null>(null) },
            },
            actionsMock,
        ],
    })
}

const entityFixture: EntityPreviewRecursive = {
    id: 'the mock id',
    entityType: EntityType.Task,
    title: 'The mock title',
    children: [],
    parentId: '',
    description: '',
    createdAt: new Date(),
    statusUpdatedAt: new Date(),
    ownerId: '5',
    deadline: null,
    listId: '',
    parentTaskId: '',
    priority: TaskPriority.Medium,
    status: TaskStatus.Open,
}
const taskDetailFixture: TaskDetail = {}

describe('TaskViewComponent', () => {
    it('renders the task', () => {
        setupComponent({
            entity$: new BehaviorSubject(entityFixture),
            detail$: new BehaviorSubject(taskDetailFixture),
            options$: new BehaviorSubject(null),
        })

        cy.get(testName('editable-entity-name')).contains(entityFixture.title)
        // Cy.get(testName('description-editor')).should('be.hidden')
    })
})
