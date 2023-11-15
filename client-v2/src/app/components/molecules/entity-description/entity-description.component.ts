import { ChangeDetectionStrategy, Component, Input, Output, ViewChild } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import {
    Observable,
    Subject,
    delay,
    distinctUntilKeyChanged,
    filter,
    map,
    mergeMap,
    shareReplay,
    switchMap,
} from 'rxjs'
import {
    defaultDesktopEditorLayout,
    getDefaultEditorFeatures,
    getDefaultEditorLayout,
    provideEditorFeatures,
} from 'src/app/rich-text-editor/editor.features'
import { TipTapEditorComponent } from 'src/app/rich-text-editor/tip-tap-editor/tip-tap-editor.component'
import { DeviceService } from 'src/app/services/device.service'

export interface DescriptionContext {
    id: string
    description$: Observable<string>
}

@UntilDestroy()
@Component({
    selector: 'app-entity-description',
    templateUrl: './entity-description.component.html',
    styleUrls: ['./entity-description.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    viewProviders: [provideEditorFeatures(getDefaultEditorFeatures())],
})
export class EntityDescriptionComponent {
    constructor(private deviceService: DeviceService) {}

    @ViewChild(TipTapEditorComponent) ttEditor!: TipTapEditorComponent

    toolbarLayout = defaultDesktopEditorLayout
    toolbarLayout$ = this.deviceService.isTouchPrimary$.pipe(map(getDefaultEditorLayout))

    private context$ = new Subject<DescriptionContext>()
    @Input() set context(context: DescriptionContext | null) {
        if (context) this.context$.next(context)
    }

    private editorBound$ = this.context$.pipe(
        distinctUntilKeyChanged('id'),
        map(({ id, description$ }) => this.ttEditor.bindEditor(description$, id)),
        shareReplay({ bufferSize: 1, refCount: true })
    )

    @Output() isActive$ = this.editorBound$.pipe(switchMap(({ isActive$ }) => isActive$))
    @Output('update') update$ = this.editorBound$.pipe(
        mergeMap(({ updateOnBlur$ }) =>
            updateOnBlur$.pipe(map(({ html, context }) => ({ id: context, description: html })))
        )
    )
    @Output('blur') blur$ = this.editorBound$.pipe(
        mergeMap(({ blur$ }) =>
            blur$.pipe(
                delay(0),
                map(() => this.ttEditor.editor.view.hasFocus()),
                filter(hasFocus => !hasFocus),
                map(() => null)
            )
        )
    )
}
