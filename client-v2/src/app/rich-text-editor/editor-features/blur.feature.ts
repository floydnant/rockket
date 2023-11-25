import { Extension } from '@tiptap/core'
import { EditorControlId, EditorFeatureId } from '../editor.types'
import { createEditorFeature } from '../editor.helpers'

export const blurFeature = createEditorFeature({
    featureId: EditorFeatureId.Blur,
    extensions: [
        Extension.create({
            addKeyboardShortcuts() {
                return {
                    'Mod-Enter': () => this.editor.commands.blur(),
                }
            },
        }),
    ],
    layout: [EditorControlId.Blur],
    controls: [
        {
            controlId: EditorControlId.Blur,
            icon: 'close',
            title: 'Done',
            keybinding: 'Mod-Enter',
            action: ({ editor }) => {
                editor.commands.focus()
                editor.commands.blur()
                return true
            },
        },
    ],
})
