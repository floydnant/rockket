import { FormattingControlGroup, FormattingControlMenuItem } from './types'
import { getActiveListType } from './helpers'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'

const extensionDisplayName = {
    bulletList: 'Bullet List',
    orderedList: 'Ordered List',
    taskList: 'Task List',
}

export type HeadingLevel = 1 | 2 | 3 | 4

// @TODO: add '.can()' feature
export const formattingControlGroups: FormattingControlGroup[] = [
    {
        configKey: 'basic',
        controls: [
            {
                title: 'Bold',
                configKey: 'bold',
                icon: 'editor.bold',
                displayKeybinding: 'mod+B',
                isActive: editor => editor.isActive('bold'),
                action: chain => chain.toggleBold(),
                testName: 'bold',
            },
            {
                title: 'Italic',
                configKey: 'italic',
                icon: 'editor.italic',
                displayKeybinding: 'mod+I',
                isActive: editor => editor.isActive('italic'),
                action: chain => chain.toggleItalic(),
                testName: 'italic',
            },
            {
                title: 'Strikethrough',
                configKey: 'strike',
                icon: 'editor.strike',
                displayKeybinding: 'mod+shift+S',
                isActive: editor => editor.isActive('strike'),
                action: chain => chain.toggleStrike(),
                testName: 'strike',
            },
            {
                title: 'Link',
                configKey: 'link',
                icon: 'editor.link',
                displayKeybinding: 'mod+K',
                registerKeybinding: 'Mod-k',
                isActive: editor => editor.isActive('link'),
                action: (chain, editor) => {
                    const selectionStart = editor.state.selection.from
                    const selectionEnd = editor.state.selection.to
                    const selectedText = editor.state.doc.textBetween(selectionStart, selectionEnd).trim()
                    // console.log(editor.getAttributes('link').href)

                    // @TODO: just a quick hack, needs improvement
                    const linkRegex = /https?:\/\/[^\s]+/
                    const parsedLink = linkRegex.exec(selectedText)?.[0]

                    const link = parsedLink ? parsedLink : prompt('Enter a link')?.trim()
                    if (!link) return chain

                    return chain.toggleLink({ href: link })
                },
                testName: 'link',
            },
        ],
    },
    {
        configKey: 'blocks',
        controls: [
            {
                title: 'Paragraph',
                configKey: ['headings', 'blocks', 'lists'],
                icon: 'editor.paragrapgh',
                action: chain => chain.setParagraph(),
                testName: 'p',
            },
            {
                title: editor => {
                    if (!editor.isActive('heading')) return 'Headings'

                    const { level } = editor.getAttributes('heading')
                    return `Heading ${level}`
                },
                configKey: 'headings',
                icon: editor => {
                    const { level } = editor.getAttributes('heading')
                    return `editor.heading${level <= 4 ? level : ''}` as `editor.heading${HeadingLevel | ''}`
                },
                isActive: editor => editor.isActive('heading'),
                dropdown: {
                    items: [1, 2, 3, 4].map<FormattingControlMenuItem>(level => ({
                        title: 'Heading ' + level,
                        icon: ('editor.heading' + level) as `editor.heading${HeadingLevel}`,
                        keybinding: `Mod-Alt-${level}`,
                        isActive: ({ editor }) => editor.isActive('heading', { level }),
                        action: ({ chain }) =>
                            chain()
                                .toggleHeading({ level: level as HeadingLevel })
                                .run(),
                    })),
                },
                testName: 'headings-dropdown',
            },
            {
                configKey: ['lists', 'taskLists'],
                title: editor => {
                    const listType = (getActiveListType(editor)?.list || '') as keyof typeof extensionDisplayName
                    return extensionDisplayName[listType] || 'Lists'
                },
                icon: editor => {
                    const activeListType = getActiveListType(editor)?.list
                    return activeListType ? (('editor.' + activeListType) as IconKey) : 'editor.bulletList'
                },
                isActive: editor => !!getActiveListType(editor),
                dropdown: {
                    items: [
                        {
                            title: 'Ordered List',
                            keybinding: 'Mod-Shift-7',
                            icon: 'editor.orderedList',
                            isActive: ({ editor }) => editor.isActive('orderedList'),
                            action: ({ chain }) => chain().toggleOrderedList().run(),
                        },
                        {
                            title: 'Bulleted List',
                            icon: 'editor.bulletList',
                            keybinding: 'Mod-Shift-8',
                            isActive: ({ editor }) => editor.isActive('bulletList'),
                            action: ({ chain }) => chain().toggleBulletList().run(),
                        },
                        {
                            title: 'Task List',
                            keybinding: 'Mod-Shift-9',
                            icon: 'editor.taskList',
                            isActive: ({ editor }) => editor.isActive('taskList'),
                            action: ({ chain }) => chain().toggleTaskList().run(),
                        },
                    ],
                },
                testName: 'more-dropdown',
            },
        ],
    },
    {
        configKey: ['code', 'codeBlock', 'rule', 'lists', 'taskLists'],
        controls: [
            {
                title: 'More',
                configKey: ['blocks'],
                icon: 'ellipsis-h',
                dropdown: {
                    items: [
                        {
                            title: 'Indent',
                            icon: 'editor.indent',
                            keybinding: 'Tab',
                            action: ({ chain }) => chain().indent().run(),
                        },
                        {
                            title: 'Outdent',
                            icon: 'editor.outdent',
                            keybinding: 'Shift-Tab',
                            action: ({ chain }) => chain().outdent().run(),
                        },
                        { isSeperator: true },
                        {
                            title: 'Horizontal Rule',
                            icon: 'editor.horizontalRule',
                            action: ({ chain }) => chain().setHorizontalRule().run(),
                        },
                        {
                            title: 'Inline Code',
                            icon: 'editor.code',
                            keybinding: 'mod+E',
                            isActive: ({ editor }) => editor.isActive('code'),
                            action: ({ chain }) => chain().toggleCode().run(),
                        },
                        {
                            title: 'Code Block',
                            icon: 'editor.codeBlock',
                            isActive: ({ editor }) => editor.isActive('codeBlock'),
                            action: ({ chain }) => chain().toggleCodeBlock().run(),
                        },
                    ],
                },
                testName: 'more-dropdown',
            },
        ],
    },
    {
        configKey: 'undoRedo',
        controls: [
            {
                title: 'Undo',
                configKey: 'undoRedo',
                icon: 'editor.undo',
                displayKeybinding: 'mod+Z',
                action: chain => chain.undo(),
                testName: 'undo',
            },
            {
                title: 'Redo',
                configKey: 'undoRedo',
                icon: 'editor.redo',
                displayKeybinding: 'mod+shift+Z',
                action: chain => chain.redo(),
                testName: 'redo',
            },
        ],
    },
]
