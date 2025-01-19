import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TaskTreeNodeAdapterComponent } from './task-tree-node-adapter.component'
import { actionsMock, storeMock } from 'src/app/utils/unit-test.mocks'
import { taskTreeConfigInjectionToken } from '../task-tree/task-tree.component'

describe('TaskTreeNodeAdapterComponent', () => {
    let component: TaskTreeNodeAdapterComponent
    let fixture: ComponentFixture<TaskTreeNodeAdapterComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            providers: [storeMock, actionsMock, { provide: taskTreeConfigInjectionToken, useValue: {} }],
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
