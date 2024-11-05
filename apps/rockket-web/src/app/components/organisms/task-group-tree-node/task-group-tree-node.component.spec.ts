import { ComponentFixture, TestBed } from '@angular/core/testing'
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
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
