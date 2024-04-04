import { History } from '@tiptap/extension-history'
import { EditorFeature, EditorControlId, EditorFeatureId } from '../editor.types'

export const historyFeature: EditorFeature = {
    featureId: EditorFeatureId.History,
    extensions: [History],
    controls: [
        {
            title: 'Undo',
            controlId: EditorControlId.Undo,
            icon: 'editor.undo',
            // DisplayKeybinding: 'mod+Z',
            keybinding: 'mod+Z',
            action: ({ chain }) => chain().undo().run(),
        },
        {
            title: 'Redo',
            controlId: EditorControlId.Redo,
            icon: 'editor.redo',
            // DisplayKeybinding: 'mod+shift+Z',
            keybinding: 'mod+shift+Z',
            action: ({ chain }) => chain().redo().run(),
        },
    ],
}
