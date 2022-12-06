import { ArrayDataSource } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core'
import {
    EntityType,
    PageEntityIconKey,
} from 'src/app/components/atoms/icons/page-entity-icon/page-entity-icon.component'
import { TaskStatus } from 'src/app/models/task.model'

const TREE_DATA: ExampleFlatNode[] = [
    {
        name: 'Fruit',
        expandable: false,
        level: 0,
    },
    {
        name: 'Fruit',
        expandable: true,
        level: 0,
    },
    {
        name: 'Apple',
        expandable: false,
        level: 1,
    },
    {
        name: 'Banana',
        expandable: false,
        level: 1,
    },
    {
        name: 'Fruit loops',
        expandable: false,
        level: 1,
    },
    {
        name: 'Vegetables',
        expandable: true,
        isExpanded: true,
        level: 0,
    },
    {
        name: 'Yellow',
        expandable: false,
        entityType: EntityType.DOCUMENT,
        level: 1,
    },
    {
        name: 'Green',
        expandable: true,
        isExpanded: true,
        level: 1,
    },
    {
        name: 'Broccoli',
        expandable: false,
        entityType: EntityType.DOCUMENT,
        level: 2,
    },
    {
        name: 'Brussels sprouts',
        expandable: false,
        level: 2,
    },
    {
        name: 'Other',
        expandable: true,
        isExpanded: true,
        entityType: EntityType.VIEW,
        level: 2,
    },
    {
        name: 'Other',
        expandable: false,
        entityType: EntityType.VIEW,
        level: 3,
    },
    {
        name: 'Other',
        expandable: false,
        entityType: EntityType.VIEW,
        level: 3,
    },
    {
        name: 'Orange',
        expandable: true,
        isExpanded: true,
        level: 1,
    },
    {
        name: 'Pumpkins',
        expandable: false,
        level: 2,
    },
    {
        name: 'Carrots',
        expandable: false,
        level: 2,
    },
    {
        name: 'Vegetables',
        expandable: true,
        isExpanded: true,
        level: 0,
    },
    {
        name: 'Yellow',
        expandable: false,
        level: 1,
    },
    {
        name: 'Green',
        expandable: true,
        isExpanded: true,
        level: 1,
    },
    {
        name: 'Broccoli',
        entityType: EntityType.DOCUMENT,
        expandable: false,
        level: 2,
    },
    {
        name: 'Brussels sprouts',
        expandable: false,
        entityType: EntityType.DOCUMENT,
        level: 2,
    },
    {
        name: 'Other',
        expandable: true,
        isExpanded: true,
        level: 2,
    },
    {
        name: 'Other',
        expandable: false,
        level: 3,
    },
    {
        name: 'Other',
        expandable: false,
        level: 3,
    },
    {
        name: 'Orange',
        expandable: true,
        isExpanded: true,
        level: 1,
    },
    {
        name: 'Pumpkins',
        expandable: false,
        level: 2,
    },
    {
        name: 'Carrots',
        expandable: false,
        entityType: EntityType.DOCUMENT,
        level: 2,
    },
    {
        name: 'Vegetables',
        expandable: true,
        isExpanded: true,
        level: 0,
    },
    {
        name: 'Yellow',
        expandable: false,
        level: 1,
    },
    {
        name: 'Green',
        expandable: true,
        isExpanded: true,
        level: 1,
    },
    {
        name: 'Broccoli',
        expandable: false,
        level: 2,
    },
    {
        name: 'Brussels sprouts',
        expandable: false,
        level: 2,
    },
    {
        name: 'Other',
        expandable: true,
        isExpanded: true,
        level: 2,
    },
    {
        name: 'Other',
        expandable: false,
        level: 3,
    },
    {
        name: 'Other',
        expandable: false,
        level: 3,
        entityType: EntityType.DOCUMENT,
    },
    {
        name: 'Orange',
        expandable: true,
        isExpanded: true,
        level: 1,
    },
    {
        name: 'Pumpkins',
        expandable: false,
        level: 2,
    },
    {
        name: 'Carrots',
        expandable: false,
        level: 2,
    },
]

/** Flat node with expandable and level information */
interface ExampleFlatNode {
    expandable: boolean
    name: string
    level: number
    isExpanded?: boolean
    entityType?: EntityType
}

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
    treeControl = new FlatTreeControl<ExampleFlatNode>(
        node => node.level,
        node => node.expandable
    )

    dataSource = new ArrayDataSource(TREE_DATA)

    hasChild = (_: number, node: ExampleFlatNode) => node.expandable

    getParentNode(node: ExampleFlatNode) {
        const nodeIndex = TREE_DATA.indexOf(node)

        for (let i = nodeIndex - 1; i >= 0; i--) {
            if (TREE_DATA[i].level === node.level - 1) {
                return TREE_DATA[i]
            }
        }

        return null
    }

    shouldRender(node: ExampleFlatNode) {
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

    ngAfterViewInit(): void {
        this.progressBarObserver.observe(this.progressBar.nativeElement)
    }
    ngOnDestroy(): void {
        this.progressBarObserver.disconnect()
    }
}
