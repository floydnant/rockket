import { ChangeDetectionStrategy, Component, Inject } from '@angular/core'
import { Store } from '@ngrx/store'
import { EntityEvent, EntityEventType, EntityType, isTruthy } from '@rockket/commons'
import { filter, map } from 'rxjs'
import { TIMELINE_ENTRY_VIEW_DATA } from 'src/app/components/molecules/timeline/timeline.component'
import { AppState } from 'src/app/store'
import { getEntityById } from 'src/app/store/entities/utils'

@Component({
    selector: 'app-parent-list-changed-event',
    template: `
        <div
            class="text-tinted-300 @xs:flex-row @xs:items-center flex w-fit flex-col flex-wrap gap-1 truncate"
            *ngIf="data$ | async; let data; else: loading"
        >
            <a
                *ngIf="data.previousParentList; let previousParentList; else: noParent"
                [routerLink]="previousParentList.route"
                class="menu-item no-default-a-styles | text-tinted-300 flex max-w-[15ch] truncate bg-transparent text-left duration-[20ms]"
            >
                <app-entity-page-label
                    [pageIcon]="previousParentList.icon"
                    [pageTitle]="previousParentList.title"
                ></app-entity-page-label>
            </a>

            <span class="text-tinted-300 @xs:rotate-0 @xs:mx-1 mx-auto rotate-90">→</span>

            <a
                *ngIf="data.newParentList; let newParentList; else: noParent"
                [routerLink]="newParentList.route"
                class="menu-item no-default-a-styles | text-tinted-300 flex max-w-[15ch] truncate bg-transparent text-left duration-[20ms]"
            >
                <app-entity-page-label
                    [pageIcon]="newParentList.icon"
                    [pageTitle]="newParentList.title"
                ></app-entity-page-label>
            </a>
        </div>

        <ng-template #noParent><div class="text-tinted-400 px-2">None</div></ng-template>
        <ng-template #loading><div class="text-tinted-400 h-7 w-full">&nbsp;</div></ng-template>
    `,
    styles: [],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentListChangedEventComponent {
    constructor(
        @Inject(TIMELINE_ENTRY_VIEW_DATA)
        public event: Extract<
            EntityEvent,
            {
                type:
                    | typeof EntityEventType.TaskParentListChanged
                    | typeof EntityEventType.ListParentListChanged
            }
        >,
        private store: Store<AppState>,
    ) {}

    data$ = this.store
        .select(state => state.entities.entityTree)
        .pipe(
            filter(isTruthy),
            map(entityTree => {
                const previousParentList = this.event.metaData.prevValue
                    ? getEntityById(entityTree, this.event.metaData.prevValue) || undefined
                    : null
                const newParentList = this.event.metaData.newValue
                    ? getEntityById(entityTree, this.event.metaData.newValue) || undefined
                    : null

                return {
                    previousParentList:
                        previousParentList === null
                            ? null
                            : {
                                  title: previousParentList?.title || 'Unknown',
                                  icon: previousParentList ? EntityType.Tasklist : 'unknown',
                                  route: '/home/' + previousParentList?.id,
                              },
                    newParentList:
                        newParentList === null
                            ? null
                            : {
                                  title: newParentList?.title || 'Unknown',
                                  icon: newParentList ? EntityType.Tasklist : 'unknown',
                                  route: '/home/' + newParentList?.id,
                              },
                }
            }),
        )
}
