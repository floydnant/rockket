import { ResizeDirective } from './resize.directive'

describe('ResizeDirective', () => {
    it('should create an instance', () => {
        const directive = new ResizeDirective({ nativeElement: document.createElement('div') })
        expect(directive).toBeTruthy()
    })
})
