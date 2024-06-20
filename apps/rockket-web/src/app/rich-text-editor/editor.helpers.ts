import { Editor } from '@tiptap/core'
import { EditorState } from 'prosemirror-state'
import { EditorFeature } from './editor.types'
import { PropertiesWhereNotNull } from '@rockket/commons'

export const createEditorFeature = <TFeature extends EditorFeature>(feature: TFeature): TFeature => feature

export const createEditorFeatureMap = <T extends Record<string, EditorFeature | null>>(
    map: T,
): PropertiesWhereNotNull<T> => {
    const filteredMap = {} as PropertiesWhereNotNull<T>
    for (const key in map) {
        const feature = map[key]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (feature) (filteredMap as any)[key] = feature
    }

    return filteredMap
}

type ListType = typeof bulletListType | typeof orderedListType | typeof taskListType

const bulletListType = { list: 'bulletList', item: 'listItem' } as const
const orderedListType = { list: 'orderedList', item: 'listItem' } as const
const taskListType = { list: 'taskList', item: 'taskItem' } as const

export const getActiveListType = (editor: Editor): ListType | null => {
    if (editor.isActive(bulletListType.list)) return bulletListType
    if (editor.isActive(orderedListType.list)) return orderedListType
    if (editor.isActive(taskListType.list)) return taskListType

    return null
}

export interface ChecklistCount {
    totalItems: number
    checkedItems: number
    progress: number
}
export const countChecklistItems = (doc: EditorState['doc']): ChecklistCount => {
    let totalItems = 0
    let checkedItems = 0

    doc.descendants(node => {
        if (node.type.name != 'taskItem') return true

        totalItems++
        if (node.attrs['checked']) checkedItems++

        return true
    })

    return {
        totalItems,
        checkedItems,
        progress: (checkedItems / totalItems) * 100,
    }
}

export const isChecklistItem = (elem: HTMLElement | undefined) => {
    if (!elem?.matches('input[type="checkbox"]')) return false
    if (!elem?.parentElement?.matches('label[contenteditable]')) return false
    if (!elem?.parentElement?.parentElement?.matches('li[data-checked]')) return false

    return true
}
