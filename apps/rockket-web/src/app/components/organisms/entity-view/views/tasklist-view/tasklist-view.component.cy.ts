import { CdkMenuModule } from '@angular/cdk/menu'
import { EntityPreviewRecursive, EntityType, TasklistDetail } from '@rockket/commons'
import { testName } from 'cypress/support/helpers'
import { BehaviorSubject, of } from 'rxjs'
import { EntityPageLabelComponent } from 'src/app/components/atoms/entity-page-label/entity-page-label.component'
import { IconsModule } from 'src/app/components/atoms/icons/icons.module'
import { InlineEditorComponent } from 'src/app/components/atoms/inline-editor/inline-editor.component'
import { EditableEntityTitleComponent } from 'src/app/components/molecules/editable-entity-heading/editable-entity-title.component'
import { EntityDescriptionComponent } from 'src/app/components/molecules/entity-description/entity-description.component'
import { PageProgressBarComponent } from 'src/app/components/molecules/page-progress-bar/page-progress-bar.component'
import { ToolbarComponent } from 'src/app/components/molecules/toolbar/toolbar.component'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { IntersectionDirective } from 'src/app/directives/intersection.directive'
import { MutationDirective } from 'src/app/directives/mutation.directive'
import { DropdownModule } from 'src/app/dropdown/dropdown.module'
import { HighlightPipe } from 'src/app/pipes/highlight.pipe'
import { RichTextEditorModule } from 'src/app/rich-text-editor/rich-text-editor.module'
import { RxModule } from 'src/app/rx/rx.module'
import { LoadingStateService } from 'src/app/services/loading-state.service'
import { TaskTreeMap } from 'src/app/store/entities/entities.state'
import { TooltipModule } from 'src/app/tooltip/tooltip.module'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'
import { ENTITY_VIEW_DATA, EntityViewComponent, EntityViewData } from '../../entity-view.component'
import { TasklistViewComponent } from './tasklist-view.component'

const setupComponent = (viewData: EntityViewData<TasklistDetail>, taskTreeMap: TaskTreeMap = {}) => {
    const store = {
        ...storeMock,
        useValue: {
            ...storeMock.useValue,
            select() {
                return of(taskTreeMap)
            },
        },
    }
    cy.mount(`<app-tasklist-view></app-tasklist-view> `, {
        componentProperties: {},
        imports: [CdkMenuModule, IconsModule, RxModule, DropdownModule, RichTextEditorModule, TooltipModule],
        declarations: [
            TasklistViewComponent,
            MutationDirective,
            FocusableDirective,
            EditableEntityTitleComponent,
            EntityPageLabelComponent,
            InlineEditorComponent,
            EntityDescriptionComponent,
            HighlightPipe,
            ToolbarComponent,
            PageProgressBarComponent,
            IntersectionDirective,
        ],
        providers: [
            { provide: ENTITY_VIEW_DATA, useValue: viewData },
            store,
            {
                provide: EntityViewComponent,
                useValue: { progress$: new BehaviorSubject<number | null>(null) },
            },
            actionsMock,
            {
                provide: LoadingStateService,
                useValue: { getEntityLoadingState: () => of(false) },
            },
        ],
    })
}

const entityFixture: EntityPreviewRecursive = {
    id: 'the mock id',
    entityType: EntityType.TASKLIST,
    title: 'The mock name',
    children: [],
    parentId: '',
}
const entityDetailFixture: TasklistDetail = { description: null, createdAt: new Date(), ownerId: '' }

describe('TasklistViewComponent', () => {
    it('renders the tasklist', () => {
        setupComponent({
            entity$: new BehaviorSubject(entityFixture),
            detail$: new BehaviorSubject(entityDetailFixture),
            options$: new BehaviorSubject(null),
        })

        cy.get(testName('editable-entity-name')).contains(entityFixture.title)
        cy.get(testName('description-editor')).should('not.exist')
        cy.get(testName('entity-children')).should('not.exist')
    })

    describe('Description', () => {
        it('renders the description', () => {
            const description = 'The mock description'
            setupComponent({
                entity$: new BehaviorSubject(entityFixture),
                detail$: new BehaviorSubject({ ...entityDetailFixture, description }),
                options$: new BehaviorSubject(null),
            })

            cy.get(testName('description-editor')).should('not.be.hidden')
            cy.get(testName('description-editor')).contains(description)
        })
    })

    describe('Children', () => {
        const childEntity: EntityPreviewRecursive = {
            title: 'A child within',
            entityType: EntityType.TASKLIST,
            children: [],
            id: '123',
            parentId: 'the mock id',
        }
        beforeEach(() => {
            setupComponent({
                entity$: new BehaviorSubject({
                    ...entityFixture,
                    children: [childEntity],
                }),
                detail$: new BehaviorSubject(entityDetailFixture),
                options$: new BehaviorSubject([{ title: 'Mock action' }]),
            })
        })

        it('renders the children', () => {
            cy.get(testName('entity-children')).should('exist')
            cy.get(testName('entity-child')).should('have.length', 1)
            cy.get(testName('entity-child')).contains(childEntity.title)
        })

        it('right click on child opens menu', () => {
            cy.get(testName('entity-child')).rightclick()
            cy.get(testName('drop-down-menu')).should('exist')
        })

        it.skip('can add a child')
    })

    describe('Task tree', () => {
        it.skip('displays the task tree')
        it.skip('test')
    })
})
