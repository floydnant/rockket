import { CdkMenuModule } from '@angular/cdk/menu'
import { Injector } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { EntityPreviewRecursive } from 'src/app/fullstack-shared-models/entities.model'
import { TasklistDetail } from 'src/app/fullstack-shared-models/list.model'
import { storeMock } from 'src/app/utils/unit-test.mocks'
import { EntityPageLabelComponent } from '../../atoms/entity-page-label/entity-page-label.component'
import { DropDownComponent } from '../../molecules/drop-down/drop-down.component'
import { EditableEntityTitleComponent } from '../../molecules/editable-entity-heading/editable-entity-title.component'
import { EntityViewComponent, entityViewComponentMap } from './entity-view.component'
import { TasklistViewComponent } from './views/tasklist-view/tasklist-view.component'

const defaultTemplate = `
<app-entity-view [entity]="activeEntity$ | async" [entityOptionsMap]="entityOptionsMap$ | async"> </app-entity-view>
`

const setupComponent = (template = defaultTemplate) => {
    const entityViewComponents: typeof entityViewComponentMap[keyof typeof entityViewComponentMap][] = [
        TasklistViewComponent,
    ]
    cy.mount(template, {
        componentProperties: {
            activeEntity$: new BehaviorSubject(null),
            entityOptionsMap$: new BehaviorSubject(null),
        },
        imports: [CdkMenuModule],
        declarations: [
            EntityViewComponent,
            ...entityViewComponents,
            EditableEntityTitleComponent,
            EntityPageLabelComponent,
            DropDownComponent,
        ],
        providers: [
            storeMock,
            {
                provide: Injector,
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                useValue: { create() {} },
            },
        ],
    })
}

const entityFixture: EntityPreviewRecursive = {
    id: 'the mock id',
    title: 'The mock name',
    children: [],
    parentListId: '',
}
const entityDetailFixture: TasklistDetail = { description: null, createdAt: '', ownerId: '' }

describe('EntityViewComponent', () => {
    it('renders the entity view', () => {
        setupComponent()

        // @TODO: Write tests here
    })
})
