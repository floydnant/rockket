import { ComponentFixture, TestBed } from '@angular/core/testing'

import { TaskTreeComponent } from './task-tree.component'

describe('TaskTreeComponent', () => {
    let component: TaskTreeComponent
    let fixture: ComponentFixture<TaskTreeComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TaskTreeComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(TaskTreeComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
