import { ChangeDetectionStrategy, Component, Input, Output, ViewChild } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { BehaviorSubject, filter, first, map, merge, Subject, switchMap, tap } from 'rxjs'
import { RtEditorComponent } from 'src/app/rich-text-editor/rt-editor/rt-editor.component'
import { createEventEmitter } from 'src/app/utils/observable.helpers'

@UntilDestroy()
@Component({
    selector: 'app-entity-description',
    templateUrl: './entity-description.component.html',
    styleUrls: ['./entity-description.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDescriptionComponent {
    description$ = new BehaviorSubject<string | null>(null)
    @Input() set description(description: string | null) {
        this.description$.next(description)
    }

    @ViewChild(RtEditorComponent) editor!: RtEditorComponent // needed for outside access

    descriptionChanges$ = new BehaviorSubject<string | null>(null)
    blurEvents$ = new Subject<FocusEvent>()
    @Output() blur = createEventEmitter(this.blurEvents$.pipe(untilDestroyed(this)))

    descriptionDomState$ = merge(
        this.descriptionChanges$,
        this.description$.pipe(
            tap(() => {
                if (this.descriptionChanges$.value !== null) this.descriptionChanges$.next(null)
            })
        )
    )

    @Output() descriptionChange = createEventEmitter(
        this.blurEvents$.pipe(
            switchMap(() => this.descriptionChanges$.pipe(first())),
            switchMap(description => {
                return this.description$.pipe(
                    first(),
                    map(oldDescription => (oldDescription === description ? null : description))
                )
            }),
            filter(description => description !== null),
            map(description => description as string),
            untilDestroyed(this)
        )
    )
}
