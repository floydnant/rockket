import { ComponentFixture, TestBed } from '@angular/core/testing'
import { of } from 'rxjs'
import { createLocalKvBooleanStoreProxy } from 'src/app/services/ui-state.service'
import { TaskGroupTreeNodeComponent } from './task-group-tree-node.component'

describe('TaskGroupTreeNodeComponent', () => {
    let component: TaskGroupTreeNodeComponent
    let fixture: ComponentFixture<TaskGroupTreeNodeComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TaskGroupTreeNodeComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(TaskGroupTreeNodeComponent)
        component = fixture.componentInstance
        component.node = {
            id: '1',
            component: class {
                node!: never
            },
            data: { id: '1', label: 'Test', icon: 'group' },
            hasChildren: false,
            path: [],
            shouldRender$: of(true),
            indentationOffset: 0,
            expandedStore: createLocalKvBooleanStoreProxy(),
        }
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
