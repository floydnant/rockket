import Blockquote from '@tiptap/extension-blockquote'
import Heading from '@tiptap/extension-heading'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorFeature, EditorFeatureId } from '../editor.types'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        placeholder: {
            setPlaceholder: (placeholder: string) => ReturnType
        }
    }
}

export const placeholderFeature = (emptyEditorPlaceholder: string): EditorFeature => ({
    featureId: EditorFeatureId.Placeholder,
    extensions: [
        Placeholder.extend({
            addCommands() {
                return {
                    setPlaceholder: placeholder => {
                        return ({ editor }) => {
                            editor.storage[EditorFeatureId.Placeholder] = placeholder
                            return true
                        }
                    },
                }
            },
        }).configure({
            placeholder: ({ node, editor }) => {
                if (editor.isEmpty) return editor.storage[EditorFeatureId.Placeholder] || emptyEditorPlaceholder

                if (node.type.name == Heading.name) return 'Heading ' + node.attrs['level']
                if (node.type.name == Blockquote.name) return 'Quote'

                // Const parentNode = editor.state.selection.$anchor.parent
                // console.log('node', node.type.name)
                // console.log('parent', parentNode.type.name)
                // if (parentNode.type.name == 'bulletList') return 'List'
                // if (parentNode.type.name == 'taskList') return 'Task'
                // if (parentNode.type.name == 'codeBlock') return "Write some code let's goo!"

                // if (node.type.name == Paragraph.name) return 'Type "/" for commands'

                return ''
            },
            showOnlyCurrent: false,
        }),
    ],
})
