import { CdkMenuModule } from '@angular/cdk/menu'
import { Injector } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { EntityPreviewRecursive, EntityType } from 'src/app/fullstack-shared-models/entities.model'
import { TasklistDetail } from 'src/app/fullstack-shared-models/list.model'
import { storeMock } from 'src/app/utils/unit-test.mocks'
import { EntityPageLabelComponent } from '../../atoms/entity-page-label/entity-page-label.component'
import { EditableEntityTitleComponent } from '../../molecules/editable-entity-heading/editable-entity-title.component'
import { EntityViewComponent, entityViewComponentMap } from './entity-view.component'
import { TaskViewComponent } from './views/task-view/task-view.component'
import { TasklistViewComponent } from './views/tasklist-view/tasklist-view.component'
import { DropdownModule } from 'src/app/dropdown/dropdown.module'
import { RxModule } from 'src/app/rx/rx.module'

const defaultTemplate = `
<app-entity-view [entity]="activeEntity$ | async" [entityOptionsMap]="entityOptionsMap$ | async"> </app-entity-view>
`

const setupComponent = (template = defaultTemplate) => {
    const entityViewComponents: (typeof entityViewComponentMap)[keyof typeof entityViewComponentMap][] = [
        TasklistViewComponent,
        TaskViewComponent,
    ]
    cy.mount(template, {
        componentProperties: {
            activeEntity$: new BehaviorSubject(null),
            entityOptionsMap$: new BehaviorSubject(null),
        },
        imports: [CdkMenuModule, DropdownModule, RxModule],
        declarations: [
            EntityViewComponent,
            ...entityViewComponents,
            EditableEntityTitleComponent,
            EntityPageLabelComponent,
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
    entityType: EntityType.TASKLIST,
    title: 'The mock name',
    children: [],
    parentId: '',
}
const entityDetailFixture: TasklistDetail = { description: null, createdAt: '', ownerId: '' }

describe('EntityViewComponent', () => {
    it('renders the entity view', () => {
        setupComponent()

        // @TODO: Write tests here
    })
})
