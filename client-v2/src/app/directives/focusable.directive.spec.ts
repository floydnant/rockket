import { ElementRef } from '@angular/core'
import { FocusableDirective } from './focusable.directive'

describe('FocusableDirective', () => {
    it('should create an instance', () => {
        const directive = new FocusableDirective(new ElementRef(new HTMLDivElement()))
        expect(directive).toBeTruthy()
    })
})
