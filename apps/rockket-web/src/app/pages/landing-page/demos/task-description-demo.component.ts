import { ChangeDetectionStrategy, Component } from '@angular/core'
import { TaskRecursive, TaskPriority, TaskStatus } from '@rockket/commons'

const listId = 'description-demo'
const demoTasks: TaskRecursive[] = [
    {
        id: listId + 'task-one',
        title: 'Develop a social media campaign',
        description: `
            <h4>End goal</h4>
            <ul>
                <li>Raise awareness of the new product</li>
                <li>Generate interest and engagement</li>
            </ul>
            <h4>Outline</h4>
            <ol>
                <li>Conduct research to identify the target audience</li>
                <li>Determine the most effective social media channels</li>
                <li>Develop a content strategy and create engaging social media posts, graphics<s>, and videos</s></li>
            </ol>
            <h4>Resources</h4>
            <ul>
                <li><a>That one blog post</a></li>
                <li><a>Link to related documentation</a></li>
            </ul>
        `,
        listId,
        status: TaskStatus.Open,
        priority: TaskPriority.NONE,
        parentTaskId: '',
        children: [],
        statusUpdatedAt: new Date(),
        createdAt: new Date(),
        ownerId: '5',
        deadline: null,
    },
]

@Component({
    selector: 'app-task-description-demo',
    template: `<app-task-tree [tasks]="tasks" [readonly]="true" [expandAll]="true"></app-task-tree>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDescriptionDemoComponent {
    tasks = demoTasks
}
