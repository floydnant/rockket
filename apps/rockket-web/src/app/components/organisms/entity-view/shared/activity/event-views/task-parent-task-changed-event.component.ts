import { ChangeDetectionStrategy, Component, Inject } from '@angular/core'
import { Store } from '@ngrx/store'
import { EntityEvent, EntityEventType, valuesOf } from '@rockket/commons'
import { map } from 'rxjs'
import { TIMELINE_ENTRY_VIEW_DATA } from 'src/app/components/molecules/timeline/timeline.component'
import { AppState } from 'src/app/store'
import { getTaskById } from 'src/app/store/entities/utils'

@Component({
    selector: 'app-task-parent-task-changed-event',
    template: `
        <div
            class="text-tinted-300 @xs:flex-row @xs:items-center flex w-fit flex-col flex-wrap gap-1 truncate"
            *ngIf="data$ | async; let data; else: loading"
        >
            <a
                *ngIf="data.previousParentTask; let previousParentTask; else: noParent"
                [routerLink]="previousParentTask.route"
                class="button-m text-tinted-300 flex max-w-[15ch] truncate bg-transparent text-left duration-[20ms]"
            >
                <app-entity-page-label
                    [pageIcon]="previousParentTask.icon"
                    [pageTitle]="previousParentTask.title"
                ></app-entity-page-label>
            </a>

            <span class="text-tinted-300 @xs:rotate-0 @xs:mx-1 mx-auto rotate-90">→</span>

            <a
                *ngIf="data.newParentTask; let newParentTask; else: noParent"
                [routerLink]="newParentTask.route"
                class="button-m text-tinted-300 flex max-w-[15ch] truncate bg-transparent text-left duration-[20ms]"
            >
                <app-entity-page-label
                    [pageIcon]="newParentTask.icon"
                    [pageTitle]="newParentTask.title"
                ></app-entity-page-label>
            </a>
        </div>

        <ng-template #noParent><div class="text-tinted-400 px-2">None</div></ng-template>
        <ng-template #loading><div class="text-tinted-400 h-7 w-full">&nbsp;</div></ng-template>
    `,
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskParentTaskChangedEventComponent {
    constructor(
        @Inject(TIMELINE_ENTRY_VIEW_DATA)
        public event: Extract<EntityEvent, { type: typeof EntityEventType.TaskParentTaskChanged }>,
        private store: Store<AppState>,
    ) {}

    data$ = this.store
        .select(state => state.entities.taskTreeMap)
        .pipe(
            map(taskTreeMap => {
                const taskTree = valuesOf(taskTreeMap || {}).flat()
                const previousParentTask = this.event.metaData.prevValue
                    ? getTaskById(taskTree, this.event.metaData.prevValue) || undefined
                    : null
                const newParentTask = this.event.metaData.newValue
                    ? getTaskById(taskTree, this.event.metaData.newValue) || undefined
                    : null

                return {
                    previousParentTask:
                        previousParentTask === null
                            ? null
                            : {
                                  title: previousParentTask?.title || 'Unknown',
                                  icon: previousParentTask?.status || 'unknown',
                                  route: '/home/' + previousParentTask?.id,
                              },
                    newParentTask:
                        newParentTask === null
                            ? null
                            : {
                                  title: newParentTask?.title || 'Unknown',
                                  icon: newParentTask?.status || 'unknown',
                                  route: '/home/' + newParentTask?.id,
                              },
                }
            }),
        )
}
