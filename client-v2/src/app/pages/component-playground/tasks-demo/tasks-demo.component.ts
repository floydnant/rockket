import { Component } from '@angular/core'
import { ITask, prioritySortingMap, statusSortingMap, TaskPriority, TaskStatus } from '../../../models/task.model'

type TaskSorter = (a: ITask, b: ITask) => number

const sortByStatus: TaskSorter = (a, b) => statusSortingMap[a.status] - statusSortingMap[b.status]
const sortByPriority: TaskSorter = (a, b) => prioritySortingMap[a.priority] - prioritySortingMap[b.priority]

const tasklist = Object.values(TaskStatus)
    .map(status =>
        Object.values(TaskPriority).map<Partial<ITask>>((priority, i) => ({
            title: `This is a task (${status}, ${priority})`,
            description:
                i % 2 == 0
                    ? ''
                    : 'Here could be notes. Or even multiline notes? fhsdjkalf hasjksldhjafksldf hasjkdlfjkasldhfjkas ldhfjka lsdhfjklashdjfk lashdfjklas dhfjk',
            status,
            priority,
        }))
    )
    .flat()

const sortTasklist = (tasklist: ITask[]) => {
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
    tasks: ITask[] = sortTasklist(tasklist as unknown as ITask[])
}
