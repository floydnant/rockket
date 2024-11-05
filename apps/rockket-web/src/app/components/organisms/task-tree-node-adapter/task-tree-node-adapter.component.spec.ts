import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TaskTreeNodeAdapterComponent } from './task-tree-node-adapter.component'

describe('TaskTreeNodeAdapterComponent', () => {
    let component: TaskTreeNodeAdapterComponent
    let fixture: ComponentFixture<TaskTreeNodeAdapterComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TaskTreeNodeAdapterComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(TaskTreeNodeAdapterComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
