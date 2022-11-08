import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core'
import { PageEntityIconKey } from 'src/app/components/atoms/icons/page-entity-icon/page-entity-icon.component'
import { TaskStatus } from 'src/app/models/task.model'

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
    TaskStatus = TaskStatus

    closedTasks = 16
    allTasks = 37
    progress = Math.round((this.closedTasks / this.allTasks) * 100)
    isShownAsPercentage = true

    breadcrumbs: { text: string; icon?: PageEntityIconKey }[] = [
        { text: 'Rootlist', icon: 'tasklist' },
        { text: 'Listname', icon: 'tasklist' },
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
