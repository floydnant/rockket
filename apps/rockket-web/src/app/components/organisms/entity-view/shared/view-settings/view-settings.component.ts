import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { entriesOf } from '@rockket/commons'
import { Subject } from 'rxjs'
import { MenuItem } from 'src/app/dropdown/drop-down/drop-down.component'
import { separator } from 'src/app/rich-text-editor/editor.types'
import { ViewSettings } from 'src/app/services/ui-state.service'
import {
    DEFAULT_TASK_GROUPING_STRATEGY_KEY,
    TaskGroupingStrategyKey,
    groupingStrategies,
} from './task-grouping-strategies'
import {
    DEFAULT_TASK_SORTING_STRATEGY_KEY,
    TaskSortingStrategyKey,
    sortingStrategies,
} from './task-sorting-strategies'

@Component({
    selector: 'app-view-settings',
    templateUrl: './view-settings.component.html',
    styles: [
        `
            button.view-settings--isActive {
                /* @apply !bg-primary-700 hover:!bg-primary-600 text-primary-200 font-bold; */
                @apply text-primary-300;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewSettingsComponent {
    @Input({ required: true }) viewSettings$!: Subject<ViewSettings>

    getGroupingStrategy = (key: string) => groupingStrategies[key as TaskGroupingStrategyKey]
    defaultGroupingStrategyKey = DEFAULT_TASK_GROUPING_STRATEGY_KEY
    groupingOptionsMenuItems: MenuItem<ViewSettings>[] = [
        ...entriesOf(groupingStrategies).map(
            ([key, { label, icon }]): MenuItem<ViewSettings> => ({
                title: label,
                icon,
                action: viewSettings => this.viewSettings$.next({ ...viewSettings, grouping: key }),
                isActive: data => data.grouping == key,
            }),
        ),
        separator,
        {
            title: 'Group Subtasks too',
            action: viewSettings =>
                this.viewSettings$.next({ ...viewSettings, groupRecursive: !viewSettings.groupRecursive }),
            icon: viewSettings => (viewSettings.groupRecursive ? 'check' : 'empty'),
        },
    ]

    getSortingStrategy = (key: string) => sortingStrategies[key as TaskSortingStrategyKey]
    defaultSortingStrategyKey = DEFAULT_TASK_SORTING_STRATEGY_KEY
    sortOptionsMenuItems = entriesOf(sortingStrategies).map(
        ([key, { label, icon }]): MenuItem<ViewSettings> => ({
            title: label,
            icon,
            action: viewSettings => this.viewSettings$.next({ ...viewSettings, sorting: key }),
            isActive: data => data.sorting == key,
        }),
    )
}
