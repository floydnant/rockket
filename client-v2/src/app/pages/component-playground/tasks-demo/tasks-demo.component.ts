import { Component } from '@angular/core'
import { convertToTaskTreeNode, TaskTreeNode } from 'src/app/components/organisms/task-tree/task-tree.component'
import {
    prioritySortingMap,
    statusSortingMap,
    TaskPreview,
    TaskPreviewFlattend,
    TaskPriority,
    TaskStatus,
} from '../../../fullstack-shared-models/task.model'

type TaskSorter = (a: TaskPreview, b: TaskPreview) => number

const sortByStatus: TaskSorter = (a, b) => statusSortingMap[a.status] - statusSortingMap[b.status]
const sortByPriority: TaskSorter = (a, b) => prioritySortingMap[a.priority] - prioritySortingMap[b.priority]

const tasklist = Object.values(TaskStatus)
    .map(status =>
        Object.values(TaskPriority).map<TaskPreview>((priority, i) => ({
            title: `This is a task (${status}, ${priority})`,
            description:
                i % 2 == 0
                    ? ''
                    : 'Here could be notes. Or even multiline notes? fhsdjkalf hasjksldhjafksldf hasjkdlfjkasldhfjkas ldhfjka lsdhfjklashdjfk lashdfjklas dhfjk',
            status,
            priority,
            id: '',
            listId: '',
            parentTaskId: '',
        }))
    )
    .flat()

const sortTasklist = (tasklist: TaskPreview[]) => {
    const openTasks = tasklist
        .filter(
            // prettier-ignore
            t => t.status != TaskStatus.NOT_PLANNED &&
                t.status != TaskStatus.COMPLETED &&
                t.status != TaskStatus.BACKLOG
        )
        .sort(sortByStatus)
        .sort(sortByPriority)
    const backlogTasks = tasklist.filter(t => t.status == TaskStatus.BACKLOG).sort(sortByPriority)
    const closedTasks = tasklist.filter(t => t.status == TaskStatus.NOT_PLANNED || t.status == TaskStatus.COMPLETED) // @TODO: sort by closedAt

    return [...openTasks, ...backlogTasks, ...closedTasks]
}

@Component({
    selector: 'app-tasks-demo',
    templateUrl: './tasks-demo.component.html',
    styleUrls: [],
})
export class TasksDemoComponent {
    tasks: TaskTreeNode[] = sortTasklist(tasklist)
        .map<TaskPreviewFlattend>(task => ({
            ...task,
            path: [],
            childrenCount: 0,
        }))
        .map(convertToTaskTreeNode)
}
