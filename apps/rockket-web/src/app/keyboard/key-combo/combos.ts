interface ComboKey {
    key: string
    type: 'modifier' | 'letter' | 'digit' | 'other'
}

export const modifierKeyIconMap = {
    mod: '⌘',
    cmd: '⌘',
    shift: '⇧',
    alt: '⌥',
    ctrl: '⌃',
    control: '⌃',

    // ??
    space: 'Space',
    esc: 'Esc',
    enter: '⏎',
    backspace: 'Backspace',
    tab: 'Tab',
}

const isModifier = (key: string): key is keyof typeof modifierKeyIconMap => key in modifierKeyIconMap
const isUpperCase = (str: string) => str == str.toUpperCase()
const isLetter = (char: string) => /[a-zA-Z]/.test(char)
const isDigit = (char: string) => /\d/.test(char)

export const parseCombo = (
    combo: string,
    /** Wether 'tiptap mode' is enabled and 'Mod-S' should become 'Mod-Shift-S' */
    interpretUpperCaseAsShift = false
) => {
    const keys = combo.split(/[-+]/)
    return keys
        .map(key => {
            const lowerCaseKey = key.toLowerCase()
            if (isModifier(lowerCaseKey)) return modifierKeyIconMap[lowerCaseKey]
            if (interpretUpperCaseAsShift && isLetter(key) && isUpperCase(key)) return [modifierKeyIconMap.shift, key]

            return key.toUpperCase()
        })
        .flat()
}

export const parseBindingInput = (input: string) => {
    // Input: 'some-mod:another-mod: mod+shift+E => mod-S'
    const stripped = input.replace(/\s+/g, '')

    const [sequence, ...stateModifiers] = stripped.split(':').reverse()
    // Sequence: 'mod+shift+E => mod-S'
    // stateModifiers: ['another-mod', 'some-mod']

    // combos: ['mod+shift+E', 'mod-S'] -> [ComboKey[], ComboKey[]]
    const combos = sequence.split('=>').map(combo => parseComboWithType(combo))

    return { combos, stateModifiers }
}

export const parseComboWithType = (
    combo: string,
    /** Wether 'tiptap mode' is enabled and 'Mod-S' should be interpreted as 'Mod-Shift-S' */
    interpretUpperCaseAsShift = false
) => {
    const keys = combo.split(/[-+]/)
    return keys
        .map(key => {
            const lowerCaseKey = key.toLowerCase()

            if (isModifier(lowerCaseKey)) return { key: modifierKeyIconMap[lowerCaseKey], type: 'modifier' }

            if (interpretUpperCaseAsShift && isLetter(key) && isUpperCase(key))
                return [
                    { key: modifierKeyIconMap.shift, type: 'modifier' },
                    { key: key, type: 'letter' },
                ]

            const type = isDigit(key) ? 'digit' : isLetter(key) ? 'letter' : 'other'
            return { key: key.toUpperCase(), type }
        })
        .flat() as ComboKey[]
}
