import { IndentationExtension } from './extensions/indentation.extension'
import { EditorFeature, EditorControlId, EditorFeatureId } from '../editor.types'

export const indentationFeature: EditorFeature = {
    featureId: EditorFeatureId.Indentation,
    extensions: [IndentationExtension],
    controls: [
        {
            controlId: EditorControlId.Indent,
            title: 'Indent',
            icon: 'editor.indent',
            keybinding: 'Tab',
            action: ({ chain }) => chain().indent().run(),
        },
        {
            controlId: EditorControlId.Outdent,
            title: 'Outdent',
            icon: 'editor.outdent',
            keybinding: 'Shift-Tab',
            action: ({ chain }) => chain().outdent().run(),
        },
    ],
}
