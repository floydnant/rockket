import { Editor } from '@tiptap/core'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'

export const getActiveListType = (editor: Editor) => {
    // prettier-ignore
    const type = editor.isActive(BulletList.name)
        ? { list: BulletList.name, item: ListItem.name }
        : editor.isActive(OrderedList.name)
            ? { list: OrderedList.name, item: ListItem.name }
            : editor.isActive(TaskList.name)
                ? { list: TaskList.name, item: TaskItem.name }
                : null

    return type
}
