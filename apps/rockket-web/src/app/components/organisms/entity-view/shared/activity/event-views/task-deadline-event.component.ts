import { Component, Inject } from '@angular/core'
import { EntityEvent, EntityEventType } from '@rockket/commons'
import { TIMELINE_ENTRY_VIEW_DATA } from '../../../../../molecules/timeline/timeline.component'

@Component({
    selector: 'app-task-deadline-event',
    template: `
        <div class="text-tinted-300 @xs:flex-row flex w-fit flex-col flex-wrap gap-1">
            <ng-template #noDeadline> <span class="text-tinted-400">None</span> </ng-template>

            <div
                *ngIf="event.metaData.prevValue; else noDeadline"
                class="bg-tinted-850 border-tinted-800 w-max rounded-md border px-1.5"
            >
                <span>{{ event.metaData.prevValue | date : 'medium' }}</span>
            </div>

            <span class="text-tinted-300 @xs:rotate-0 @xs:mx-1 mx-auto rotate-90">→</span>

            <div
                *ngIf="event.metaData.newValue; else noDeadline"
                class="bg-tinted-850 border-tinted-800 w-max rounded-md border px-1.5"
            >
                <span>{{ event.metaData.newValue | date : 'medium' }}</span>
            </div>
        </div>
    `,
})
export class TaskDeadlineEventComponent {
    constructor(
        @Inject(TIMELINE_ENTRY_VIEW_DATA)
        public event: Extract<EntityEvent, { type: typeof EntityEventType.TaskDeadlineChanged }>,
    ) {}
}
