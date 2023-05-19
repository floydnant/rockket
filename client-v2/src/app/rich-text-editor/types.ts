import type { ChainedCommands, Editor } from '@tiptap/core'
import { IconKey } from '../components/atoms/icons/icon/icons'
import { MenuItem } from '../dropdown/drop-down/drop-down.component'

export interface EditorConfig {
    basic?: boolean
    bold?: boolean
    italic?: boolean
    strike?: boolean
    link?: boolean
    blocks?: boolean
    headings?: boolean
    lists?: boolean
    taskLists?: boolean
    code?: boolean
    codeBlock?: boolean
    rule?: boolean
    undoRedo?: boolean
}

export type ConfigKey = keyof EditorConfig | (keyof EditorConfig)[]

export interface FormattingControlGroup {
    configKey: ConfigKey
    controls: FormattingControl[]
}
export type FormattingControlMenuItem<TDropdownData = unknown> = MenuItem<{
    chain: (autoFocus?: boolean) => ChainedCommands
    editor: Editor
    data: TDropdownData
}>

export interface FormattingControl<TDropdownData = unknown> {
    configKey: ConfigKey
    title: string | ((editor: Editor) => string)
    icon: IconKey | ((editor: Editor) => IconKey)
    displayKeybinding?: string
    registerKeybinding?: string
    dropdown?: {
        items: FormattingControlMenuItem<TDropdownData>[]
        data?: TDropdownData
    }
    isActive?: (editor: Editor) => boolean
    action?: (chain: ChainedCommands, editor: Editor) => ChainedCommands
    testName: string
}
