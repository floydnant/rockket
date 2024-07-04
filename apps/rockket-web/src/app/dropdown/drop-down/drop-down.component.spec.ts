import { ComponentFixture, TestBed } from '@angular/core/testing'

import { DialogModule } from '@angular/cdk/dialog'
import { DropDownComponent } from './drop-down.component'

describe('DropDownComponent', () => {
    let component: DropDownComponent
    let fixture: ComponentFixture<DropDownComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DialogModule],
            declarations: [DropDownComponent],
        }).compileComponents()

        fixture = TestBed.createComponent(DropDownComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
