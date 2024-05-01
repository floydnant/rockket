import { Task } from '../task'
import { UpdateTaskDto } from '../task/task.dto'
import {
    createEntityEventsBuilder,
    newEntityEvent,
    tryParseParentListChangedEvent,
    tryParseTitleChangedEvent,
} from './entity-event.constructors'
import { TaskEventType } from './task-event.schemas'

export const buildTaskEventsFromDto = createEntityEventsBuilder<
    TaskEventType,
    [task: Task, dto: UpdateTaskDto, userId: string]
>({
    [TaskEventType.TitleChanged]: tryParseTitleChangedEvent,
    [TaskEventType.TaskParentListChanged]: tryParseParentListChangedEvent,

    // Parent Task
    [TaskEventType.TaskParentTaskChanged]: (task, dto, userId) => {
        if (dto.parentTaskId === undefined) return null
        if (dto.parentTaskId == task.parentTaskId) return null

        return newEntityEvent(
            TaskEventType.TaskParentTaskChanged,
            {
                prevValue: task.parentTaskId,
                newValue: dto.parentTaskId,
            },
            userId,
        )
    },

    // Task Deadline
    [TaskEventType.TaskDeadlineChanged]: (task, dto, userId) => {
        if (dto.deadline === undefined) return null
        if (dto.deadline?.getTime() == task.deadline?.getTime()) return null

        return newEntityEvent(
            TaskEventType.TaskDeadlineChanged,
            {
                prevValue: task.deadline,
                newValue: dto.deadline,
            },
            userId,
        )
    },
    // Task Priority
    [TaskEventType.TaskPriorityChanged]: (task, dto, userId) => {
        if (dto.priority === undefined) return null
        if (dto.priority == task.priority) return null

        return newEntityEvent(
            TaskEventType.TaskPriorityChanged,
            {
                prevValue: task.priority,
                newValue: dto.priority,
            },
            userId,
        )
    },
    // Task Status
    [TaskEventType.TaskStatusChanged]: (task, dto, userId) => {
        if (dto.status === undefined) return null
        if (dto.status == task.status) return null

        return newEntityEvent(
            TaskEventType.TaskStatusChanged,
            {
                prevValue: task.status,
                newValue: dto.status,
            },
            userId,
        )
    },
})
