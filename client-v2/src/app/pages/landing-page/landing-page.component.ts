import { ComponentType } from '@angular/cdk/portal'
import { Component, ViewEncapsulation } from '@angular/core'
import { HotToastService } from '@ngneat/hot-toast'
import { TaskNestingDemoComponent } from './demos/task-nesting-demo.component'
import { TaskPriorityDemoComponent } from './demos/task-priority-demo.component'
import { TaskStatusDemoComponent } from './demos/task-status-demo.component'
import { TaskDescriptionDemoComponent } from './demos/task-description-demo.component'

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.css'],
    host: {
        class: 'relative block select-text',
    },
    encapsulation: ViewEncapsulation.None,
})
export class LandingPageComponent {
    constructor(private toast: HotToastService) {
        this.toast.close('confirm-login')
    }

    isMobileMenuOpen = false

    mainNavLinks: { title: string; route: string }[] = [
        { title: 'Features', route: '#features' },
        { title: 'Roadmap', route: '#roadmap' },
        { title: 'Method', route: '#method' },
    ]

    progress = 77

    // @TODO: Fix demo interactivity (too deeply coupled to the store)
    showcaseItems: { title: string; text: string[]; image?: string; component?: ComponentType<unknown> }[] = [
        {
            title: 'Status',
            component: TaskStatusDemoComponent,
            text: `
                Track the progress of your tasks to stay on top of your workload.
                You can easily see which tasks are still outstanding, which are in progress, and which have been closed.

                Assign a status of "Backlog" to declare that the task is not yet ready to be worked on or can sit there for a while.
            `.split('\n\n'),
        },
        {
            title: 'Priority',
            component: TaskPriorityDemoComponent,
            text: `
                Rockket's priority feature allows you to assign a level of importance to each task, so you can focus on what's most critical.

                With priority levels ranging from optional to urgent, you can easily identify which tasks need your immediate attention and which can wait.
            `.split('\n\n'),
        },
        {
            title: 'Description',
            component: TaskDescriptionDemoComponent,
            text: `
                Add detailed information and notes to further outline the task, document research, draft ideas, and much more.

                With this feature, you can provide additional context and instructions for each task,
                making it easier to understand what needs to be done and how to do it.
            `.split('\n\n'),
        },
        {
            title: 'Labels',
            text: `
                Assign labels to your tasks to help you organize and filter your tasks by category.
                It's especially useful if you have a lot of tasks and want to group them together by topic or project.
            `.split('\n\n'),
        },
        {
            title: 'Task nesting',
            component: TaskNestingDemoComponent,
            text: `
                Nesting is a powerful feature in Rockket that allows you to break down complex tasks into smaller, more manageable chunks of work.
                With nesting, you can create a hierarchy of tasks that helps you stay focused on whats next.

                By breaking down your tasks in this way, you can stay focused on the specific steps you need to take to complete your project,
                and feel a sense of accomplishment as you check off each subtask.

                This can help you avoid feeling overwhelmed by a large to-do list, and instead focus on making steady progress.
                `.split('\n\n'),
        },
        {
            title: 'History',
            text: `
                See what happend when, and who did it. View the life cycle of your tasks, from creation to completion.
            `.split('\n\n'),
        },
        {
            title: 'Dependencies',
            text: `
                Create dependencies between tasks to indicate that one task is a prerequisite for another.

                This is useful for tasks that require input from other tasks, but aren't exactly expressible as subtasks of one another.
            `.split('\n\n'),
        },
    ]

    testimonials: { name: string; avatar: string; comment: string; role: string }[] = [
        {
            name: 'John Doe',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'CEO at Company Inc.',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'Jane Smith',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'Senior UX Designer',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'Adam Argyle',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'Product Manager',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'Rudolf van Buren',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'Senior Software Engineer',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'John Doe',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'CEO at Company Inc.',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'Jane Smith',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'Senior UX Designer',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'Adam Argyle',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'Product Manager',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'Rudolf van Buren',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'Senior Software Engineer',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'John Doe',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'CEO at Company Inc.',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'Jane Smith',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'Senior UX Designer',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'Adam Argyle',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'Product Manager',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
        {
            name: 'Rudolf van Buren',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?cs=srgb&dl=pexels-pixabay-220453.jpg&fm=jpg',
            role: 'Senior Software Engineer',
            comment:
                'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos, cumque mollitia reiciendis sequi ex molestiae!',
        },
    ]
}
