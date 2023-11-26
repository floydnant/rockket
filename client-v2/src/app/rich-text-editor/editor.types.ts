import { ChainedCommands, Editor, Extensions } from '@tiptap/core'
import { MenuItem } from 'src/app/dropdown/drop-down/drop-down.component'
import { IconKey } from '../components/atoms/icons/icon/icons'
import { HotToastServiceMethods } from '@ngneat/hot-toast'

export enum EditorFeatureId {
    Base = 'base',
    Inline = 'inline',
    Blocks = 'blocks',
    History = 'history',
    Indentation = 'indentation',
    Placeholder = 'placeholder',
    Typography = 'typography',
    Link = 'link',
    Blur = 'blur',
    StarterKit = 'starter-kit',
    Markdown = 'markdown',
    CustomEvents = 'custom-events',
    MoreMenu = 'more-menu',
    ChecklistCounter = 'checklist-counter',
    SearchAndReplace = 'search-and-replace',
}

export enum EditorControlId {
    Bold = 'bold',
    Italic = 'italic',
    Strike = 'strike',
    InlineCode = 'inline-code',
    Link = 'link',

    Blocks = 'blocks',
    Paragraph = 'paragraph',
    Headings = 'headings',
    Heading1 = 'heading-1',
    Heading2 = 'heading-2',
    Heading3 = 'heading-3',
    Heading4 = 'heading-4',
    Heading5 = 'heading-5',
    Heading6 = 'heading-6',
    BulletList = 'bullet-list',
    OrderedList = 'ordered-list',
    TaskList = 'task-list',
    CodeBlock = 'code-block',
    Blockquote = 'blockquote',
    HorizontalRule = 'horizontal-rule',

    More = 'more',
    Undo = 'undo',
    Redo = 'redo',
    Indent = 'indent',
    Outdent = 'outdent',
    CopyAsMarkdown = 'copy-as-markdown',

    Blur = 'blur',
}

export interface EditorControlArgs {
    chain: (autoFocus?: boolean) => ChainedCommands
    editor: Editor
    toast: HotToastServiceMethods
}

export interface EditorControl {
    controlId: EditorControlId
    title: string | ((args: EditorControlArgs) => string)
    icon: IconKey | ((args: EditorControlArgs) => IconKey)
    keybinding?: string
    isActive?: (args: EditorControlArgs) => boolean
    action?: (args: EditorControlArgs) => boolean
    fixedWith?: string
}

type Separator = { isSeparator: true }
export const separator = { isSeparator: true } as Separator
export const isSeparator = (item: unknown): item is Separator =>
    /* item == separator || */ typeof item == 'object' && item != null && 'isSeparator' in item

export interface EditorLayoutParentItem {
    controlId: EditorControlId
    dropdown: (EditorControlId | Separator)[]
}
export type EditorLayoutItem = EditorControlId | EditorLayoutParentItem | Separator

export interface EditorFeature {
    featureId: EditorFeatureId
    // extensions: (Extension | Node | Mark)[]
    extensions: Extensions
    controls?: EditorControl[]
    layout?: EditorLayoutItem[]
}

export type ResolvedEditorControl = EditorControl & {
    dropdownItems?: MenuItem<EditorControlArgs>[]
}

export type ResolvedEditorControlItem = ResolvedEditorControl | Separator
