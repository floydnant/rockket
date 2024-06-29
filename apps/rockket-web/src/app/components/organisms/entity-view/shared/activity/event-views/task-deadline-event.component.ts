import { Component, Inject } from '@angular/core'
import { EntityEvent, EntityEventType } from '@rockket/commons'
import { TIMELINE_ENTRY_VIEW_DATA } from '../../../../../molecules/timeline/timeline.component'

@Component({
    selector: 'app-task-deadline-event',
    template: `
        <div class="text-tinted-300 mt-2 flex flex-wrap gap-1">
            <ng-template #noDeadline> None </ng-template>

            <div
                *ngIf="event.metaData.prevValue; else noDeadline"
                class="bg-tinted-850 border-tinted-800 w-max rounded-md border px-1.5"
            >
                <span>{{ event.metaData.prevValue | date : 'medium' }}</span>
            </div>

            <span class="text-tinted-300 mx-1">→</span>

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
