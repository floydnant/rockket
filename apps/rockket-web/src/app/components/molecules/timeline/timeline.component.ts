import {
    ChangeDetectionStrategy,
    Component,
    InjectionToken,
    Injector,
    Input,
    TrackByFunction,
    Type,
} from '@angular/core'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'

export const TIMELINE_ENTRY_VIEW_DATA = new InjectionToken('TimelineEntryViewData')

export type TimelineEntry = {
    icon: IconKey
    title: string
    timestamp: Date
    description?: string
    component?: Type<object>
    viewData?: unknown
}

@Component({
    selector: 'app-timeline',
    templateUrl: './timeline.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
    constructor(private injector: Injector) {}

    @Input() events: TimelineEntry[] = []

    createInjector(data: unknown) {
        return Injector.create({
            providers: [{ provide: TIMELINE_ENTRY_VIEW_DATA, useValue: data }],
            parent: this.injector,
        })
    }

    trackEntry: TrackByFunction<TimelineEntry> = (_index, item) => item.title + item.timestamp.toString()
}
