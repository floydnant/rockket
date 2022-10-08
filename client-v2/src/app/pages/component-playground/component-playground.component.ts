import { Component } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { betterEmailValidator, matchSibling } from 'src/app/components/molecules/form/validators'
import { FormBuilderOptions } from 'src/app/components/molecules/form/types'
import { ITask, prioritySortingMap, statusSortingMap, TaskPriority, TaskStatus } from '../../models/task.model'

type TaskSorter = (a: ITask, b: ITask) => number

const sortByStatus: TaskSorter = (a, b) => statusSortingMap[a.status] - statusSortingMap[b.status]
const sortByPriority: TaskSorter = (a, b) => prioritySortingMap[a.priority] - prioritySortingMap[b.priority]

const tasklist = Object.values(TaskStatus)
    .map(status =>
        Object.values(TaskPriority).map((priority, i) => ({
            title: `This is a task (${status}, ${priority})`,
            notes:
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
            t => t.status != TaskStatus.CLOSED && 
                 t.status != TaskStatus.COMPLETED &&
                 t.status != TaskStatus.BACKLOG
        )
        .sort(sortByStatus)
        .sort(sortByPriority)
    const backlogTasks = tasklist.filter(t => t.status == TaskStatus.BACKLOG).sort(sortByPriority)
    const closedTasks = tasklist.filter(t => t.status == TaskStatus.CLOSED || t.status == TaskStatus.COMPLETED) // @TODO: sort by closedAt

    return [...openTasks, ...backlogTasks, ...closedTasks]
}

@Component({
    selector: 'component-playground',
    templateUrl: './component-playground.component.html',
    styleUrls: ['./component-playground.component.css'],
})
export class ComponentPlaygroundComponent {
    tasks: ITask[] = sortTasklist(tasklist)

    fullnameControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(35)])

    formOptions: FormBuilderOptions = {
        username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(35)]],
        email: {
            type: 'email',
            control: ['', [Validators.required, betterEmailValidator]],
        },
        age: {
            name: 'Age (years old)',
            type: 'number',
            control: ['', [Validators.required, Validators.min(18)]],
            errorMessages: {
                min: 'You must be at least $value years old.',
            },
        },
        password: {
            name: 'New Password',
            type: 'password',
            control: ['', [Validators.required, Validators.minLength(8)]],
        },
        confirmPassword: {
            name: 'Confirm password',
            type: 'password',
            control: ['', matchSibling('password')],
            errorMessages: {
                notMatching: 'Passwords must match',
            },
        },
    }

    onSubmit(value: Record<string, string>) {
        console.log(value)
        this.isLoading = true
        setTimeout(() => {
            this.isLoading = false
        }, 4000)
    }
    isLoading = false
}
