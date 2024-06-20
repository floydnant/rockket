import { ResizeDirective } from './resize.directive'

describe('ResizeDirective', () => {
    it('should create an instance', () => {
        const directive = new ResizeDirective({ nativeElement: new HTMLDivElement() })
        expect(directive).toBeTruthy()
    })
})
