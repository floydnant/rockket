import { ComponentFixture, TestBed } from '@angular/core/testing'
import { storeMock } from 'src/app/utils/unit-test.mocks'

import { TaskTreeComponent } from './task-tree.component'

describe('TaskTreeComponent', () => {
    let component: TaskTreeComponent
    let fixture: ComponentFixture<TaskTreeComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TaskTreeComponent],
            providers: [storeMock],
        }).compileComponents()

        fixture = TestBed.createComponent(TaskTreeComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
