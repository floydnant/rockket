import { Component, Inject } from '@angular/core'
import { EntityEvent, EntityEventType } from '@rockket/commons'
import { taskStatusLabelMap } from 'src/app/components/atoms/icons/icon/icons'
import { TIMELINE_ENTRY_VIEW_DATA } from '../../../../../molecules/timeline/timeline.component'

@Component({
    selector: 'app-task-status-event',
    template: `
        <!-- INFO: this component assumes there is a '@container' outside -->

        <div class="text-tinted-300 @xs:flex-row flex w-fit flex-col flex-wrap gap-1">
            <div class="bg-tinted-850 border-tinted-800 w-max rounded-md border px-1.5">
                <app-icon [icon]="event.metaData.prevValue" class="mr-1"></app-icon>
                {{ taskStatusLabelMap[event.metaData.prevValue] }}
            </div>

            <span class="text-tinted-300 @xs:rotate-0 @xs:mx-1 mx-auto rotate-90">→</span>

            <div class="bg-tinted-850 border-tinted-800 w-max rounded-md border px-1.5">
                <app-icon [icon]="event.metaData.newValue" class="mr-1"></app-icon>
                {{ taskStatusLabelMap[event.metaData.newValue] }}
            </div>
        </div>
    `,
})
export class TaskStatusEventComponent {
    constructor(
        @Inject(TIMELINE_ENTRY_VIEW_DATA)
        public event: Extract<EntityEvent, { type: typeof EntityEventType.TaskStatusChanged }>,
    ) {}

    taskStatusLabelMap = taskStatusLabelMap
}
