import { Tasklist, UpdateTasklistDto } from '../list'
import {
    createEntityEventsBuilder,
    tryParseParentListChangedEvent,
    tryParseTitleChangedEvent,
} from './entity-event.constructors'
import { TasklistEventType } from './tasklist-event.schemas'

export const buildTasklistEventsFromDto = createEntityEventsBuilder<
    TasklistEventType,
    [task: Omit<Tasklist, 'taskIds'>, dto: UpdateTasklistDto, userId: string]
>({
    [TasklistEventType.TitleChanged]: tryParseTitleChangedEvent,
    [TasklistEventType.ListParentListChanged]: tryParseParentListChangedEvent,
})
