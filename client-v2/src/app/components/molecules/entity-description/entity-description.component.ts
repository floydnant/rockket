import { ChangeDetectionStrategy, Component, Input, Output, ViewChild } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { Observable, ReplaySubject, Subject, delay, distinctUntilKeyChanged, filter, map } from 'rxjs'
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

    @ViewChild(TipTapEditorComponent) private ttEditor!: TipTapEditorComponent
    focus() {
        this.ttEditor.editor.commands.focus()
    }

    toolbarLayout = defaultDesktopEditorLayout
    toolbarLayout$ = this.deviceService.isTouchPrimary$.pipe(map(getDefaultEditorLayout))

    private context$ = new ReplaySubject<DescriptionContext>()
    @Input() set context(context: DescriptionContext | null) {
        if (context) this.context$.next(context)
    }

    bindConfig$ = this.context$.pipe(
        distinctUntilKeyChanged('id'),
        map(context => ({ input$: context.description$, context: context.id }))
    )

    @Output('isActive') isActive$ = new ReplaySubject<boolean>()

    updateInput$ = new Subject<{ html: string; context: string }>()
    @Output('update') update$ = this.updateInput$.pipe(map(({ html, context }) => ({ id: context, description: html })))

    blurInput$ = new Subject()
    @Output('blur') blur$ = this.blurInput$.pipe(
        delay(0),
        map(() => this.ttEditor.editor.view.hasFocus()),
        filter(hasFocus => !hasFocus),
        map(() => null)
    )
}
