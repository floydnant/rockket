import { parseCombo } from './combos'

describe('Combos', () => {
    it('should parse', () => {
        const expected = {
            a: 'A',
            M: 'M',
            mod: '⌘',
            Mod: '⌘',
            shift: '⇧',
            Shift: '⇧',
            'mod+s': '⌘+S',
            'mod-shift-S': '⌘+⇧+S',
        }
        Object.entries(expected).forEach(([combo, expected]) => {
            expect(parseCombo(combo).join('+')).toEqual(expected)
        })
    })

    it('can recognize uppercase letters as holding shift', () => {
        const expected = {
            'mod+S': '⌘+⇧+S',
        }
        Object.entries(expected).forEach(([combo, expected]) => {
            expect(parseCombo(combo, true).join('+')).toEqual(expected)
        })
    })
})
