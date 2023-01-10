import { CdkMenuModule } from '@angular/cdk/menu'
import { testName } from 'cypress/support/helpers'
import { BehaviorSubject, of } from 'rxjs'
import { EntityPageLabelComponent } from 'src/app/components/atoms/entity-page-label/entity-page-label.component'
import { DropDownComponent } from 'src/app/components/molecules/drop-down/drop-down.component'
import { EditableEntityNameComponent } from 'src/app/components/molecules/editable-entity-heading/editable-entity-name.component'
import { FocusableDirective } from 'src/app/directives/focusable.directive'
import { MutationDirective } from 'src/app/directives/mutation.directive'
import { EntityPreviewRecursive } from 'src/app/models/entities.model'
import { TasklistDetail } from 'src/app/models/list.model'
import { TaskTreeMap } from 'src/app/store/entities/entities.state'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'
import { EntityViewComponent, EntityViewData, ENTITY_VIEW_DATA } from '../../entity-view.component'
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
        imports: [CdkMenuModule],
        declarations: [
            TasklistViewComponent,
            MutationDirective,
            FocusableDirective,
            EditableEntityNameComponent,
            EntityPageLabelComponent,
            DropDownComponent,
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
    name: 'The mock name',
    children: [],
    parentListId: '',
}
const entityDetailFixture: TasklistDetail = { description: null, createdAt: '', ownerId: '' }

describe('TasklistViewComponent', () => {
    it('renders the tasklist', () => {
        setupComponent({
            entity$: new BehaviorSubject(entityFixture),
            detail$: new BehaviorSubject(entityDetailFixture),
            options$: new BehaviorSubject(null),
        })

        cy.get(testName('editable-entity-name')).contains(entityFixture.name)
        cy.get(testName('description-editor')).should('be.hidden')
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

        it.skip('can update the description')
    })

    describe('Children', () => {
        const childEntity = { name: 'A child within', children: [], id: '123', parentListId: 'the mock id' }
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
            cy.get(testName('entity-child')).contains(childEntity.name)
        })

        it('right click on child opens menu', () => {
            cy.get(testName('entity-child')).rightclick()
            cy.get(testName('drop-down-menu')).should('exist')
        })

        it.skip('can add a child')
    })
})
