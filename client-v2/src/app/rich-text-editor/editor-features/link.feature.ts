import { Editor } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import { EditorFeature, EditorControlId, EditorFeatureId } from '../editor.types'

const toggleLink = (editor: Editor) => {
    const selectionStart = editor.state.selection.from
    const selectionEnd = editor.state.selection.to
    const selectedText = editor.state.doc.textBetween(selectionStart, selectionEnd).trim()
    // console.log(editor.getAttributes('link').href)
    // @TODO: just a quick hack, needs improvement
    const linkRegex = /https?:\/\/[^\s]+/
    const parsedLink = linkRegex.exec(selectedText)?.[0]

    const link = parsedLink || prompt('Enter a link')?.trim()
    if (!link) return false // @TODO: check if returning `false` indicates non-successful invocation

    return editor.chain().focus().toggleLink({ href: link }).run()
}

export const linkFeature: EditorFeature = {
    featureId: EditorFeatureId.Link,
    extensions: [
        Link.extend({
            addKeyboardShortcuts() {
                return {
                    'Ctrl-k': () => toggleLink(this.editor),
                }
            },
        }),
    ],
    controls: [
        {
            title: 'Link',
            controlId: EditorControlId.Link,
            icon: 'editor.link',
            // displayKeybinding: 'mod+K',
            // registerKeybinding: 'Mod-k',
            keybinding: 'ctrl+k',
            isActive: ({ editor }) => editor.isActive('link'),
            action: ({ editor }) => toggleLink(editor),
        },
    ],
}
