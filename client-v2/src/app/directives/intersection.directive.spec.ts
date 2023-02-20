import { ElementRef } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { IntersectionDirective } from './intersection.directive'

describe('IntersectionDirective', () => {
    let directive: IntersectionDirective

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                IntersectionDirective,
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: ElementRef, useValue: { nativeElement: { click() {}, focus() {} } } },
            ],
        })
        directive = TestBed.inject(IntersectionDirective)
    })

    it('should create an instance', () => {
        expect(directive).toBeTruthy()
    })
})
