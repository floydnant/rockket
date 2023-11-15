import { Blockquote } from '@tiptap/extension-blockquote'
import { BulletList } from '@tiptap/extension-bullet-list'
import { CodeBlock } from '@tiptap/extension-code-block'
import { HardBreak } from '@tiptap/extension-hard-break'
import { Heading } from '@tiptap/extension-heading'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { ListItem } from '@tiptap/extension-list-item'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { Paragraph } from '@tiptap/extension-paragraph'
import { TaskItem } from '@tiptap/extension-task-item'
import { TaskList } from '@tiptap/extension-task-list'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'
import { EditorControl, EditorControlId, EditorFeatureId, separator } from '../editor.types'
import { createEditorFeature, getActiveListType } from '../editor.helpers'

const extensionDisplayName = {
    bulletList: 'Bullet list',
    orderedList: 'Ordered list',
    taskList: 'Checklist',
    codeBlock: 'Code Block',
    blockquote: 'Blockquote',
    paragraph: 'Paragraph',
}

export type HeadingLevel = 1 | 2 | 3 | 4

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        toggleTaskItem: () => ReturnType
    }
}

export const blocksFeature = createEditorFeature({
    featureId: EditorFeatureId.Blocks,
    extensions: [
        Paragraph,
        Heading,
        BulletList,
        OrderedList,
        ListItem,
        TaskList,
        TaskItem.extend({
            addCommands() {
                return {
                    ...this.parent?.(),
                    toggleTaskItem: () => {
                        // if (this.editor.isActive('taskItem')) {
                        //     return this.editor.commands.toggleTaskList()
                        // }
                        // return this.editor.commands.command(({ tr, dispatch }) => {
                        //     const { selection } = tr
                        //     const transaction = tr.setNodeAttribute(selection.anchor, 'checked', false)
                        //     // const { $from, $to } = selection
                        //     // const range = $from.blockRange($to)
                        //     // if (!range) return false

                        //     // const { start } = range
                        //     // const { checked } = node.attrs

                        //     // const taskItem = this.type.create({
                        //     //     checked: !checked,
                        //     // })

                        //     // const transaction = tr.replaceRangeWith(start, start + node.nodeSize, taskItem)

                        //     if (dispatch) {
                        //         dispatch(transaction)
                        //     }

                        //     return true
                        // })

                        return this.editor.commands.toggleNode('taskItem', 'paragraph')
                    },
                }
            },
            addKeyboardShortcuts() {
                return {
                    ...this.parent?.(),
                    'Mod-Shift-Enter': ({ editor }) =>
                        this.editor.commands.command(({ chain }) => {
                            const isChecked = editor.isActive('taskItem', { checked: true })
                            return chain().updateAttributes('taskItem', { checked: !isChecked }).run()
                        }),
                }
            },
        }).configure({ nested: true }),
        CodeBlock.extend({
            addKeyboardShortcuts() {
                return {
                    ...this.parent?.(),
                    // Remove the default shortcut
                    'Mod-Alt-c': () => false,
                }
            },
        }),
        HorizontalRule,
        HardBreak,
        Blockquote,
    ],
    layout: [
        {
            controlId: EditorControlId.Blocks,
            dropdown: [
                EditorControlId.Paragraph,
                separator,
                EditorControlId.Heading1,
                EditorControlId.Heading2,
                EditorControlId.Heading3,
                EditorControlId.Heading4,
                // EditorControlId.Heading5,
                // EditorControlId.Heading6,
                separator,
                EditorControlId.OrderedList,
                EditorControlId.BulletList,
                EditorControlId.TaskList,
                separator,
                EditorControlId.CodeBlock,
                EditorControlId.Blockquote,
                EditorControlId.HorizontalRule,
            ],
        },
    ],
    controls: [
        {
            controlId: EditorControlId.Paragraph,
            title: extensionDisplayName.paragraph,
            icon: 'editor.paragraph',
            keybinding: 'Mod-Alt-0',
            action: ({ chain }) => chain().setParagraph().run(),
        },
        {
            controlId: EditorControlId.Blocks,
            title: ({ editor }) => {
                if (editor.isActive('heading')) {
                    const { level } = editor.getAttributes('heading')
                    return `Heading ${level}`
                }

                const listType = getActiveListType(editor)?.list
                if (listType) return extensionDisplayName[listType]

                if (editor.isActive('codeBlock')) return extensionDisplayName.codeBlock
                if (editor.isActive('blockquote')) return extensionDisplayName.blockquote

                return extensionDisplayName.paragraph
            },
            icon: ({ editor }) => {
                if (editor.isActive('heading')) {
                    const { level } = editor.getAttributes('heading')
                    return `editor.heading${level <= 4 ? level : ''}` as `editor.heading${HeadingLevel | ''}`
                }

                const listType = getActiveListType(editor)?.list
                if (listType) return ('editor.' + listType) as IconKey

                if (editor.isActive('codeBlock')) return 'editor.codeBlock'
                if (editor.isActive('blockquote')) return 'editor.quote'

                return 'editor.paragraph'
            },
            // isActive: ({ editor }) =>
            //     editor.isActive('heading') || !!getActiveListType(editor) || editor.isActive('codeBlock'),
            fixedWith: '2.75rem',
        },
        // @TODO: currently only limited to 4 levels by FontAwesome only having 4 heading icons
        ...[1, 2, 3, 4, 5, 6].map<EditorControl>(level => ({
            title: 'Heading ' + level,
            controlId: `heading-${level}` as EditorControlId,
            icon: ('editor.heading' + level) as `editor.heading${HeadingLevel}`,
            keybinding: `Mod-Alt-${level}`,
            isActive: ({ editor }) => editor.isActive('heading', { level }),
            action: ({ chain }) =>
                chain()
                    .toggleHeading({ level: level as HeadingLevel })
                    .run(),
        })),
        {
            controlId: EditorControlId.CodeBlock,
            title: extensionDisplayName.codeBlock,
            icon: 'editor.codeBlock',
            // keybinding: 'mod+alt+C',
            isActive: ({ editor }) => editor.isActive('codeBlock'),
            action: ({ chain }) => chain().toggleCodeBlock().run(),
        },
        {
            controlId: EditorControlId.Blockquote,
            title: extensionDisplayName.blockquote,
            icon: 'editor.quote',
            isActive: ({ editor }) => editor.isActive('blockquote'),
            action: ({ chain }) => chain().toggleBlockquote().run(),
        },
        {
            controlId: EditorControlId.HorizontalRule,
            title: 'Horizontal Rule',
            icon: 'editor.horizontalRule',
            action: ({ chain }) => chain().setHorizontalRule().run(),
        },
        {
            controlId: EditorControlId.BulletList,
            title: extensionDisplayName.bulletList,
            icon: 'editor.bulletList',
            keybinding: 'Mod-Shift-8',
            isActive: ({ editor }) => editor.isActive('bulletList'),
            action: ({ chain }) => chain().toggleBulletList().run(),
        },
        {
            controlId: EditorControlId.OrderedList,
            title: extensionDisplayName.orderedList,
            keybinding: 'Mod-Shift-7',
            icon: 'editor.orderedList',
            isActive: ({ editor }) => editor.isActive('orderedList'),
            action: ({ chain }) => chain().toggleOrderedList().run(),
        },
        {
            controlId: EditorControlId.TaskList,
            title: extensionDisplayName.taskList,
            keybinding: 'Mod-Shift-9',
            icon: 'editor.taskList',
            isActive: ({ editor }) => editor.isActive('taskList'),
            action: ({ chain }) => chain().toggleTaskList().run(),
        },
    ],
})
