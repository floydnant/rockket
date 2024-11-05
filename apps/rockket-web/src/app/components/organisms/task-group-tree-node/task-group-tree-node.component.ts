import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { UiTreeNodeWithControlls } from '../generic-tree/generic-tree.component'
import { IconKey } from '../../atoms/icons/icon/icons'

export type TaskGroup = {
    label: string
    icon: IconKey
}

@Component({
    selector: 'app-task-group-tree-node',
    templateUrl: './task-group-tree-node.component.html',
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskGroupTreeNodeComponent {
    @Input({ required: true }) data!: TaskGroup & { id: string }
    @Input({ required: true }) node!: UiTreeNodeWithControlls<TaskGroup & { id: string }>
}
