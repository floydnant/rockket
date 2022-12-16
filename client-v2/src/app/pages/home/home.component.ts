import { ArrayDataSource } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { Actions } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import { map, tap } from 'rxjs'
import {
    EntityType,
    PageEntityIconKey,
} from 'src/app/components/atoms/icons/page-entity-icon/page-entity-icon.component'
import { MenuItem, MenuItemVariant } from 'src/app/components/molecules/drop-down/drop-down.component'
import { TaskStatus } from 'src/app/models/task.model'
import { AppState } from 'src/app/store'
import { listActions } from 'src/app/store/task/task.actions'
import { flattenListTree, TasklistFlattend } from 'src/app/store/task/utils'
import { moveToMacroQueue } from 'src/app/utils'
import { getLoadingUpdates } from 'src/app/utils/store.helpers'

export interface EntityTreeNode {
    id: string
    name: string
    path: string[] // <-- level: path.length
    expandable: boolean

    isExpanded?: boolean
    entityType?: EntityType
}

export const convertToEntityTreeNode = (list: TasklistFlattend): EntityTreeNode => {
    const { childrenCount, ...rest } = list
    const node: EntityTreeNode = {
        ...rest,
        expandable: childrenCount > 0,

        isExpanded: true,
        entityType: EntityType.TASKLIST,
    }
    return node
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
    constructor(private store: Store<AppState>, private actions$: Actions) {}

    getParentNode(node: EntityTreeNode) {
        const nodeIndex = this.listPreviewsTransformed.indexOf(node)

        for (let i = nodeIndex - 1; i >= 0; i--) {
            if (this.listPreviewsTransformed[i].path.length === node.path.length - 1) {
                return this.listPreviewsTransformed[i]
            }
        }

        return null
    }

    shouldRender(node: EntityTreeNode) {
        let parent = this.getParentNode(node)
        while (parent) {
            if (!parent.isExpanded) {
                return false
            }
            parent = this.getParentNode(parent)
        }
        return true
    }

    range(number: number) {
        return new Array(number)
    }

    log(str: string) {
        console.log(str)
    }

    listPreviewsTransformed: EntityTreeNode[] = []
    listPreviewsTransformed$ = this.store
        .select(state => state.task.listPreviews)
        .pipe(
            map(listTree => {
                if (!listTree) return []

                return flattenListTree(listTree).map(convertToEntityTreeNode)
            }),
            tap(transformed => (this.listPreviewsTransformed = transformed))
        )

    isTreeLoading$ = getLoadingUpdates(this.actions$, [
        listActions.loadListPreviews,
        listActions.loadListPreviewsSuccess,
        listActions.loadListPreviewsError,
    ])

    dataSource = new ArrayDataSource(this.listPreviewsTransformed$)
    treeControl = new FlatTreeControl<EntityTreeNode>(
        node => node.path.length,
        node => node.expandable
    )

    createNewList(parentListId?: string) {
        const name = prompt('New Tasklist name')?.trim()
        if (!name) return

        this.store.dispatch(listActions.createTaskList({ name, parentListId }))
    }
    renameList(id: string) {
        const prevName = ''
        const newName = prompt('Rename the list', prevName)?.trim()
        if (!newName) return

        this.store.dispatch(listActions.renameList({ id, newName }))
    }
    duplicateList(id: string) {
        this.store.dispatch(listActions.duplicateList({ id }))
    }
    deleteList(id: string) {
        this.store.dispatch(listActions.deleteList({ id }))
    }

    nodeMenuItems: MenuItem[] = [
        {
            title: 'Rename',
            action: (id: string) => this.renameList(id),
        },
        {
            title: 'Create new list inside',
            action: (id: string) => this.createNewList(id),
        },
        {
            title: 'Duplicate',
            action: (id: string) => this.duplicateList(id),
        },
        { isSeperator: true },
        {
            title: 'Delete',
            variant: MenuItemVariant.DANGER,
            action: (id: string) => this.deleteList(id),
        },
    ]

    /////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////

    TaskStatus = TaskStatus
    EntityType = EntityType

    closedTasks = 16
    allTasks = 37
    progress = Math.round((this.closedTasks / this.allTasks) * 100)
    isShownAsPercentage = true

    breadcrumbs: { text: string; icon?: PageEntityIconKey }[] = [
        { text: 'Rootlist', icon: EntityType.TASKLIST },
        { text: 'Listname', icon: EntityType.TASKLIST },
        { text: 'Task', icon: TaskStatus.OPEN },
        { text: 'Taskname, which you can edit', icon: TaskStatus.IN_PROGRESS },
        // { text: 'Taskname, which you can edit. what if we get bungos though?', icon: TaskStatus.IN_PROGRESS },
    ]

    isSecondaryProgressBarVisible = false
    @ViewChild('progressBar') progressBar!: ElementRef<HTMLDivElement>
    progressBarObserver = new IntersectionObserver(
        entries => {
            if (entries[0].isIntersecting) this.isSecondaryProgressBarVisible = false
            else this.isSecondaryProgressBarVisible = true
        },
        { threshold: [0.5] }
    )

    ngOnInit(): void {
        moveToMacroQueue(() => this.store.dispatch(listActions.loadListPreviews()))
    }
    ngAfterViewInit(): void {
        this.progressBarObserver.observe(this.progressBar.nativeElement)
    }
    ngOnDestroy(): void {
        this.progressBarObserver.disconnect()
    }
}
