import { ChangeDetectionStrategy, Component, Inject } from '@angular/core'
import { EntityEvent, EntityEventType } from '@rockket/commons'
import { TIMELINE_ENTRY_VIEW_DATA } from '../../../../../molecules/timeline/timeline.component'

@Component({
    selector: 'app-title-changed-event',
    template: `
        <app-diff
            [leftContent]="event.metaData.prevValue"
            [rightContent]="event.metaData.newValue"
        ></app-diff>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleChangedEventComponent {
    constructor(
        @Inject(TIMELINE_ENTRY_VIEW_DATA)
        public event: Extract<EntityEvent, { type: typeof EntityEventType.TitleChanged }>,
    ) {}
}
