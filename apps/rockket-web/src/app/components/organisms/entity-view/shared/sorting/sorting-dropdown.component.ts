import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { entriesOf } from '@rockket/commons'
import { Subject } from 'rxjs'
import { MenuItem } from 'src/app/dropdown/drop-down/drop-down.component'
import {
    DEFAULT_TASK_SORTING_STRATEGY_KEY,
    TaskSortingStrategyKey,
    sortingStrategies,
} from './task-sorting-strategies'

@Component({
    selector: 'app-sorting-dropdown',
    templateUrl: './sorting-dropdown.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortingDropdownComponent {
    @Input({ required: true }) activeSorting$!: Subject<TaskSortingStrategyKey>

    getSortingStrategy = (key: string) => sortingStrategies[key as TaskSortingStrategyKey]
    defaultSortingStrategyKey = DEFAULT_TASK_SORTING_STRATEGY_KEY
    sortOptionsMenuItems = entriesOf(sortingStrategies).map(
        ([key, { label, icon }]): MenuItem<{ activeSorting: TaskSortingStrategyKey }> => ({
            title: label,
            icon,
            action: () => this.activeSorting$.next(key),
            isActive: data => data.activeSorting == key,
        }),
    )
}
