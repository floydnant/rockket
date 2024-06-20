import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ResizeHandleComponent } from './resize-handle.component'
import { ResizeDirective } from './resize.directive'

describe('ResizeComponent', () => {
    let component: ResizeHandleComponent
    let fixture: ComponentFixture<ResizeHandleComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResizeHandleComponent, ResizeDirective],
        }).compileComponents()

        fixture = TestBed.createComponent(ResizeHandleComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
