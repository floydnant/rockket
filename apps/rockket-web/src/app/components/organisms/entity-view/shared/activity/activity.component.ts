import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Store } from '@ngrx/store'
import { BehaviorSubject, ReplaySubject, combineLatest, distinctUntilKeyChanged, map } from 'rxjs'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'
import { TabOptions } from 'src/app/components/molecules/tab-bar/tab-bar.component'
import { TimelineEntry } from 'src/app/components/molecules/timeline/timeline.component'
import { AppState } from 'src/app/store'
import { entityEventToTimelineEntryMapperMap } from './entity-event.mappers'

export enum ActivityTabId {
    All = 'all',
    Comments = 'comments',
    History = 'history',
}

@Component({
    selector: 'app-activity',
    templateUrl: './activity.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityComponent {
    constructor(private store: Store<AppState>) {}

    @Input({ alias: 'entity', required: true }) set entitySetter(entity: { id: string; createdAt: Date }) {
        this.entity$.next(entity)
    }
    entity$ = new ReplaySubject<{ id: string; createdAt: Date }>()

    events$ = combineLatest([
        this.entity$.pipe(distinctUntilKeyChanged('id')),
        this.store.select(state => state.entities.events),
    ]).pipe(
        map(([entity, eventsMap]) => [entity, eventsMap[entity.id]] as const),
        distinctUntilKeyChanged(1),
        map(([entity, events]) => {
            if (!events) return null

            return [
                {
                    title: `Created`,
                    icon: 'birth' satisfies IconKey,
                    timestamp: entity.createdAt,
                },
                ...events.map(event => entityEventToTimelineEntryMapperMap[event.type](event)),
            ] satisfies TimelineEntry[]
        }),
    )

    ActivityTabId = ActivityTabId
    // @TODO: Implement setting for the default tab
    activeActivityTab$ = new BehaviorSubject<ActivityTabId>(ActivityTabId.Comments)
    activityTabs: TabOptions<ActivityTabId>[] = [
        {
            label: 'All',
            tabId: ActivityTabId.All,
            onClick: () => this.activeActivityTab$.next(ActivityTabId.All),
        },
        {
            label: 'Comments',
            tabId: ActivityTabId.Comments,
            onClick: () => this.activeActivityTab$.next(ActivityTabId.Comments),
        },
        {
            label: 'History',
            tabId: ActivityTabId.History,
            onClick: () => this.activeActivityTab$.next(ActivityTabId.History),
        },
    ]
}
