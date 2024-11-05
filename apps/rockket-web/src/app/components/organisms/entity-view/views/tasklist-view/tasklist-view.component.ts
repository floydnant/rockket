import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { Store } from '@ngrx/store'
import { EntityType, TaskRecursive, TasklistDetail, isTruthy, keysOf } from '@rockket/commons'
import { BehaviorSubject, Subject, combineLatest, merge } from 'rxjs'
import {
    combineLatestWith,
    distinctUntilChanged,
    distinctUntilKeyChanged,
    filter,
    first,
    map,
    mergeWith,
    shareReplay,
    skip,
    startWith,
    withLatestFrom,
} from 'rxjs/operators'
import { UiStateService, ViewSettings } from 'src/app/services/ui-state.service'
import { flattenTree, groupItemsRecursive } from 'src/app/utils/tree.helpers'
import { EntityDescriptionComponent } from '../../../../../components/molecules/entity-description/entity-description.component'
import { AppState } from '../../../../../store'
import { entitiesSelectors } from '../../../../../store/entities/entities.selectors'
import { listActions } from '../../../../../store/entities/list/list.actions'
import { taskActions } from '../../../../../store/entities/task/task.actions'
import { entitySortingCompareFns } from '../../../../../store/entities/utils'
import { isNotNullish, moveToMacroQueue } from '../../../../../utils'
import { UiTreeNode, mapGroupsToUiTreeNodes } from '../../../generic-tree/generic-tree.component'
import {
    TaskGroup,
    TaskGroupTreeNodeComponent,
} from '../../../task-group-tree-node/task-group-tree-node.component'
import { TaskTreeNodeAdapterComponent } from '../../../task-tree-node-adapter/task-tree-node-adapter.component'
import { ENTITY_VIEW_DATA, EntityViewData } from '../../entity-view.component'
import {
    NOOP_GROUP_KEY,
    TaskGroupKey,
    groupingStrategies,
} from '../../shared/view-settings/task-grouping-strategies'
import { sortingStrategies } from '../../shared/view-settings/task-sorting-strategies'

@UntilDestroy()
@Component({
    selector: 'app-tasklist-view',
    templateUrl: './tasklist-view.component.html',
    styleUrls: ['./tasklist-view.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasklistViewComponent {
    constructor(
        @Inject(ENTITY_VIEW_DATA) private viewData: EntityViewData<TasklistDetail>,
        private store: Store<AppState>,
        private uiState: UiStateService,
    ) {}

    EntityType = EntityType

    listEntity$ = this.viewData.entity$
    detail$ = this.viewData.detail$
    options$ = this.viewData.options$
    entityWithDetail$ = combineLatest([this.listEntity$, this.detail$]).pipe(
        map(([list, detail]) => {
            if (!list || !detail) return null
            return { id: list.id, createdAt: detail.createdAt }
        }),
        filter(isTruthy),
        distinctUntilKeyChanged('id'),
    )

    description$ = this.detail$.pipe(
        map(detail => {
            if (!detail) return null
            return detail.description || ''
        }),
        distinctUntilChanged(),
    )
    descriptionContext$ = this.listEntity$.pipe(
        filter(Boolean),
        distinctUntilKeyChanged('id'),
        map(entity => ({
            id: entity.id,
            description$: this.description$.pipe(filter(isNotNullish)),
        })),
    )

    private descriptionUpdateInput$ = new Subject<string>()
    updateDescription(data: { id: string; description: string }) {
        this.descriptionUpdateInput$.next(data.description)

        moveToMacroQueue(() => {
            this.store.dispatch(
                listActions.updateDescription({ id: data.id, newDescription: data.description }),
            )
        })
    }

    @ViewChild(EntityDescriptionComponent) entityDescription?: EntityDescriptionComponent
    focusDescription() {
        moveToMacroQueue(() => {
            this.entityDescription?.focus()
        })
    }

    descriptionBlurInput$ = new Subject<void>()

    private isDescriptionOpenInput$ = new Subject<boolean>()
    openDescription() {
        this.isDescriptionOpenInput$.next(true)
        moveToMacroQueue(() => this.focusDescription())
    }

    isDescriptionOpen$ = this.description$.pipe(
        map(description => Boolean(description)),
        mergeWith(this.isDescriptionOpenInput$),
        mergeWith(
            this.descriptionBlurInput$.pipe(
                withLatestFrom(merge(this.descriptionUpdateInput$.pipe(startWith(null)), this.description$)),
                map(([, description]) => Boolean(description)),
            ),
        ),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    children$ = this.listEntity$.pipe(
        map(entity => {
            return entity?.children
                ?.filter(child => child.entityType != EntityType.Task)
                .sort(entitySortingCompareFns.byCreatedAtDesc)
        }),
        startWith(undefined),
    )
    createSublist() {
        this.listEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(listActions.createTaskList({ parentListId: entity.id }))
        })
    }

    viewSettings$ = new BehaviorSubject<ViewSettings>(this.uiState.mainViewUiState.viewSettings)
    _onViewSettingsChanged = this.viewSettings$
        .pipe(skip(1), untilDestroyed(this))
        .subscribe(viewSettings => {
            this.uiState.setViewSettings(viewSettings)
        })

    // expandedMap = this.uiState.mainViewUiState.entityExpandedMap
    // updateExpandedMapStorage() {
    //     this.uiState.updateMainViewStorage()
    // }

    tasks$ = combineLatest([this.store.select(entitiesSelectors.taskTreeMap), this.listEntity$]).pipe(
        map(([taskTreeMap, entity]) => {
            if (!taskTreeMap || !entity) return null

            return { tasks: taskTreeMap[entity.id] || [], parentId: entity.id }
        }),
        // combineLatestWith(this.viewSettings$),
        // map(([tasks, { sorting: activeSortingKey, grouping: activeGroupingKey, groupRecursive }]) => {
        //     // if (!taskTreeMap || !entity) return null

        //     // const tasks = taskTreeMap[entity.id]
        //     if (!tasks) return { tasks: [], nodes: [] }

        //     const sortedTasks = sortingStrategies[activeSortingKey].sorter([...tasks])

        //     const seletedGroupingStrategy = groupingStrategies[activeGroupingKey]
        //     const groupedTasks = groupItemsRecursive(sortedTasks, (task, level) => {
        //         if (!groupRecursive && level > 0) return NOOP_GROUP_KEY

        //         return seletedGroupingStrategy.groupBy(task)
        //     })
        //     const groupKeys = keysOf(seletedGroupingStrategy.groups || {}) as TaskGroupKey[]

        //     const flattenedNodes = flattenTree(
        //         mapGroupsToUiTreeNodes(
        //             groupedTasks,
        //             TaskTreeNodeAdapterComponent,
        //             TaskGroupTreeNodeComponent,
        //             (key, parentId) => {
        //                 const groups = seletedGroupingStrategy.groups as Record<string, TaskGroup> | null
        //                 if (!groups) return null
        //                 if (key == NOOP_GROUP_KEY) return null

        //                 return {
        //                     id: parentId + '.group-' + key,
        //                     label: groups[key]?.label,
        //                     icon: groups[key]?.icon,
        //                 }
        //             },
        //             entity.id + '-root',
        //             0,
        //             (a, b) => groupKeys.indexOf(a) - groupKeys.indexOf(b),
        //         ),
        //     ) satisfies UiTreeNode<Record<string, unknown>>[]

        //     for (const node of flattenedNodes) {
        //         node.indentationOffset = node.path.filter(id => id.includes('group')).length * -1
        //     }

        //     return { tasks, nodes: flattenedNodes }
        // }),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
    createTask() {
        this.listEntity$.pipe(first()).subscribe(entity => {
            if (!entity) return
            this.store.dispatch(taskActions.create({ listId: entity.id }))
        })
    }
}
