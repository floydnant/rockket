import { HighlightPipe } from './highlight.pipe'

describe('HighlightPipe', () => {
    it('create an instance', () => {
        const pipe = new HighlightPipe()
        expect(pipe).toBeTruthy()
    })

    it('returns highlighted html', () => {
        const pipe = new HighlightPipe()
        const text = 'Hello World World'
        const highlight = 'World'

        const result = pipe.transform(text, highlight)
        const expected = 'Hello <span class="highlight">World</span> <span class="highlight">World</span>'

        expect(result).toEqual(expected)
    })

    // it.skip('does not include html syntax', () => {})
    // it.skip('includes href attributes', () => {})
})
