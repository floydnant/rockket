import { ComponentFixture, TestBed } from '@angular/core/testing'
import { TooltipDirective } from 'src/app/directives/tooltip.directive'

import { TooltipComponent, TOOLTIP_DATA } from './tooltip.component'

describe('TooltipComponent', () => {
    let component: TooltipComponent
    let fixture: ComponentFixture<TooltipComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TooltipComponent],
            providers: [TooltipDirective, { provide: TOOLTIP_DATA, useValue: 'testing tooltip' }],
        }).compileComponents()

        fixture = TestBed.createComponent(TooltipComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
