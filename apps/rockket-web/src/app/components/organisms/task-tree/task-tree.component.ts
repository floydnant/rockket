import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { keysOf, TaskFlattend, TaskRecursive } from '@rockket/commons'
import { combineLatestWith, map, ReplaySubject, shareReplay, switchMap } from 'rxjs'
import { KvStoreProxy, ViewSettings } from 'src/app/services/ui-state.service'
import { uiDefaults } from 'src/app/shared/defaults'
import { flattenTree, groupItemsRecursive } from 'src/app/utils/tree.helpers'
import {
    groupingStrategies,
    NOOP_GROUP_KEY,
    TaskGroupKey,
} from '../entity-view/shared/view-settings/task-grouping-strategies'
import { sortingStrategies } from '../entity-view/shared/view-settings/task-sorting-strategies'
import { mapGroupsToUiTreeNodes, UiTreeNode } from '../generic-tree/generic-tree.component'
import { TaskGroup, TaskGroupTreeNodeComponent } from '../task-group-tree-node/task-group-tree-node.component'
import { TaskTreeNodeAdapterComponent } from '../task-tree-node-adapter/task-tree-node-adapter.component'

export interface TaskTreeNode {
    taskPreview: TaskFlattend
    hasChildren: boolean
    isExpanded: boolean
    isDescriptionExpanded: boolean
    path: string[]
}

export const convertToTaskTreeNode = (task: TaskFlattend, expand?: boolean): TaskTreeNode => {
    return {
        taskPreview: task,
        hasChildren: (task.children?.length || 0) > 0,
        isExpanded: expand ?? uiDefaults.mainView.IS_TASK_EXPANDED,
        isDescriptionExpanded: expand ?? uiDefaults.mainView.IS_TASK_DESCRIPTION_EXPANDED,
        path: task.path,
    }
}

@UntilDestroy()
@Component({
    selector: 'app-task-tree',
    templateUrl: './task-tree.component.html',
    styleUrls: ['./task-tree.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskTreeComponent {
    tasks$ = new ReplaySubject<TaskRecursive[] | null>(1)
    @Input({ required: true }) set tasks(tasks: TaskRecursive[]) {
        this.tasks$.next(tasks)
    }

    viewSettingsStore$ = new ReplaySubject<KvStoreProxy<void, ViewSettings>>(1)
    @Input({ required: true }) set viewSettingsStore(viewSettingsStore: KvStoreProxy<void, ViewSettings>) {
        this.viewSettingsStore$.next(viewSettingsStore)
    }

    @Input({ required: true }) parentId!: string
    @Input() highlightQuery = ''
    @Input() readonly = false
    @Input({ required: true }) expandedStore!: KvStoreProxy<string, boolean>

    nodes$ = this.tasks$.pipe(
        combineLatestWith(this.viewSettingsStore$.pipe(switchMap(store => store.listen()))),
        map(([tasks, viewSettings]) => {
            if (!tasks) return []

            // @TODO: do we need to spread here?                                 v
            const sortedTasks = sortingStrategies[viewSettings.sorting].sorter([...tasks])
            const selectedGroupingStrategy = groupingStrategies[viewSettings.grouping]
            const groupedTasks = groupItemsRecursive(sortedTasks, (task, level) => {
                if (!viewSettings.groupRecursive && level > 0) return NOOP_GROUP_KEY

                return selectedGroupingStrategy.groupBy(task)
            })
            const groupKeys = keysOf(selectedGroupingStrategy.groups || {}) as TaskGroupKey[]

            const flattenedNodes = flattenTree(
                mapGroupsToUiTreeNodes(
                    groupedTasks,
                    TaskTreeNodeAdapterComponent,
                    TaskGroupTreeNodeComponent,
                    (key, parentId) => {
                        const groups = selectedGroupingStrategy.groups as Record<string, TaskGroup> | null
                        if (!groups) return null
                        if (key == NOOP_GROUP_KEY) return null

                        return {
                            id: parentId + '.group-' + key,
                            label: groups[key]?.label,
                            icon: groups[key]?.icon,
                        }
                    },
                    this.parentId + '-root',
                    0,
                    (a, b) => groupKeys.indexOf(a) - groupKeys.indexOf(b),
                ),
            ) satisfies UiTreeNode<Record<string, unknown>>[]

            for (const node of flattenedNodes) {
                node.indentationOffset = node.path.filter(id => id.includes('group')).length * -1
            }

            return flattenedNodes
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
}
