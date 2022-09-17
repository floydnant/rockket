import { ElementRef } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { FocusableDirective } from './focusable.directive'

describe('FocusableDirective', () => {
    let directive: FocusableDirective
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                FocusableDirective,
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: ElementRef, useValue: { nativeElement: { click() {}, focus() {} } } },
            ],
        })
        directive = TestBed.inject(FocusableDirective)
    })
    it('should create an instance', () => {
        expect(directive).toBeTruthy()
    })
})
