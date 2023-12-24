import { Bold } from '@tiptap/extension-bold'
import { Code } from '@tiptap/extension-code'
import { Italic } from '@tiptap/extension-italic'
import { Strike } from '@tiptap/extension-strike'
import { EditorControlId, EditorFeatureId } from '../editor.types'
import { createEditorFeature } from '../editor.helpers'

export const inlineFeature = createEditorFeature({
    featureId: EditorFeatureId.Inline,
    extensions: [
        Bold,
        Italic,
        Code.extend({
            excludes: 'bold italic code', // Allow links and strikethrough in code
            code: true,
            exitable: true,

            addKeyboardShortcuts() {
                return {
                    // Add shift to the default keybinding
                    // 'Mod-E': () => this.editor.chain().focus().toggleCode().run(),
                    'Control-e': () => this.editor.chain().focus().toggleCode().run(),
                }
            },
        }),
        Strike.extend({
            addKeyboardShortcuts(this) {
                const toggleStrike = () => this.editor.chain().focus().toggleStrike().run()
                return {
                    'Mod-shift-S': toggleStrike,
                    'Mod-shift-X': toggleStrike,
                }
            },
        }),
    ],
    layout: [EditorControlId.Bold, EditorControlId.Italic, EditorControlId.Strike, EditorControlId.InlineCode],
    controls: [
        {
            title: 'Bold',
            controlId: EditorControlId.Bold,
            icon: 'editor.bold',
            keybinding: 'mod+B',
            isActive: ({ editor }) => editor.isActive('bold'),
            action: ({ chain }) => chain().toggleBold().run(),
        },
        {
            title: 'Italic',
            controlId: EditorControlId.Italic,
            icon: 'editor.italic',
            keybinding: 'mod+I',
            isActive: ({ editor }) => editor.isActive('italic'),
            action: ({ chain }) => chain().toggleItalic().run(),
        },
        {
            title: 'Strikethrough',
            controlId: EditorControlId.Strike,
            icon: 'editor.strike',
            keybinding: 'mod+shift+S',
            isActive: ({ editor }) => editor.isActive('strike'),
            action: ({ chain }) => chain().toggleStrike().run(),
        },
        {
            title: 'Inline Code',
            controlId: EditorControlId.InlineCode,
            icon: 'editor.code',
            keybinding: 'ctrl-E',
            isActive: ({ editor }) => editor.isActive('code'),
            action: ({ chain }) => chain().toggleCode().run(),
        },
    ],
})
