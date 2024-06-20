import { CdkMenuBar } from '@angular/cdk/menu'
import { AfterViewInit, ChangeDetectionStrategy, Component, Inject, Input, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { HotToastService } from '@ngneat/hot-toast'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import {
    BehaviorSubject,
    distinctUntilChanged,
    map,
    merge,
    skip,
    startWith,
    switchMap,
    throttleTime,
} from 'rxjs'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'
import { MenuItem } from 'src/app/dropdown/drop-down/drop-down.component'
import { DeviceService } from 'src/app/services/device.service'
import '../editor-features/custom-events.feature'
import { EDITOR_FEATURES_TOKEN } from '../editor.features'
import {
    EditorControl,
    EditorControlArgs,
    EditorFeature,
    EditorFeatureId,
    EditorLayoutItem,
    ResolvedEditorControl,
    ResolvedEditorControlItem,
    isSeparator,
} from '../editor.types'
import { TipTapEditorComponent } from '../tip-tap-editor/tip-tap-editor.component'
import { isTruthy } from '@rockket/commons'

const resolveControlsLayout = (
    controls: EditorControl[],
    layout: EditorLayoutItem[],
    resolvers: {
        resolveTitle: (control: EditorControl) => string
        resolveIcon: (control: EditorControl) => IconKey
    },
) => {
    const resolvedControls = layout
        .map<ResolvedEditorControlItem | null>(featureLayout => {
            if (isSeparator(featureLayout)) return featureLayout

            const controlId = typeof featureLayout == 'string' ? featureLayout : featureLayout.controlId
            const control = controls.find(control => control.controlId == controlId)
            if (!control) {
                // @TODO: Logs in Production should be shown on an `opt in` basis
                console.warn(`Control '${control}' not found`)
                return null
            }

            if (typeof featureLayout != 'string' && 'dropdown' in featureLayout) {
                const resolvedControl = control as ResolvedEditorControl

                resolvedControl.dropdownItems = featureLayout.dropdown
                    .map<MenuItem<EditorControlArgs> | null>(controlIdOrSeparator => {
                        if (isSeparator(controlIdOrSeparator)) return controlIdOrSeparator

                        const control = controls.find(control => control.controlId == controlIdOrSeparator)
                        if (!control) {
                            // @TODO: Logs in Production should be shown on an `opt in` basis
                            console.warn(`Control '${controlIdOrSeparator}' not found`)
                            return null
                        }

                        // @TODO: the dropdown should be responsible for resolving this
                        control.title = resolvers.resolveTitle(control)
                        control.icon = resolvers.resolveIcon(control)

                        return control as MenuItem<EditorControlArgs>
                    })
                    .filter(isTruthy)
            }

            return control
        })
        .filter(isTruthy)

    return resolvedControls
}

@UntilDestroy()
@Component({
    selector: 'app-tt-editor-toolbar',
    templateUrl: './tip-tap-editor-toolbar.component.html',
    styleUrls: ['./tip-tap-editor-toolbar.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipTapEditorToolbarComponent implements AfterViewInit {
    constructor(
        @Inject(EDITOR_FEATURES_TOKEN) private features: EditorFeature[],
        public deviceService: DeviceService,
        private toast: HotToastService,
        private router: Router,
    ) {}

    ngAfterViewInit(): void {
        // Focus controls when editor tells us to (e.g. when the shortcut is triggered)
        const customEvents = this.ttEditor.editor.storage[EditorFeatureId.CustomEvents]
        customEvents?.shouldFocusToolbar$.pipe(untilDestroyed(this)).subscribe(() => this.focusControls())

        // Update editor focus state to false when the toolbar looses focus and the editor isn't focused
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.controlsMenuBar!.menuStack.hasFocus.pipe(
            startWith(false),
            distinctUntilChanged(),
            skip(1),
            untilDestroyed(this),
        ).subscribe(toolbarHasFocus => {
            if (!toolbarHasFocus && !this.ttEditor.editor.view.hasFocus()) {
                this.ttEditor.updateFocusState(false)
                this.controlsMenuBar?.menuStack.closeAll()
            }
        })
    }

    isSeparator = isSeparator

    @ViewChild('controlsMenuBar') controlsMenuBar?: CdkMenuBar
    focusControls() {
        this.controlsMenuBar?.focusFirstItem()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Input() ttEditor!: TipTapEditorComponent<any>

    @Input() openAsPageRoute?: string

    private layoutInput$ = new BehaviorSubject<EditorLayoutItem[] | null>(null)
    @Input('layout') set layoutSetter(layout: EditorLayoutItem[]) {
        this.layoutInput$.next(layout)
    }

    @Input() leadingControls?: EditorControl[]
    @Input() trailingControls?: EditorControl[]

    controls$ = this.layoutInput$.pipe(
        map(layoutInput => {
            const controls = this.features.flatMap(feature => feature.controls).filter(isTruthy)
            const layout =
                layoutInput ||
                this.features
                    .flatMap(feature => feature.layout || feature.controls?.map(control => control.controlId))
                    .filter(isTruthy)

            const resolvedControls = resolveControlsLayout(controls, layout, {
                resolveTitle: this.resolveTitle.bind(this),
                resolveIcon: this.resolveIcon.bind(this),
            })

            if (this.leadingControls) resolvedControls.unshift(...this.leadingControls)
            if (this.trailingControls) resolvedControls.push(...this.trailingControls)

            return resolvedControls
        }),
        switchMap(controls =>
            merge(this.ttEditor.editor.selectionUpdate$, this.ttEditor.update$).pipe(
                throttleTime(120, undefined, { leading: true, trailing: true }),
                startWith(null),
                map(() => controls),
            ),
        ),
    )

    controlItemTrackBy = ((index: number, item: ResolvedEditorControlItem) => {
        if (!this.ttEditor?.editor) return index
        if ('isSeparator' in item) return index

        return index + this.resolveIcon(item) + item.isActive?.(this.controlArgs)
    }).bind(this)

    execControlAction(callback: (args: EditorControlArgs) => boolean, isDropdownItem = false) {
        if (!this.ttEditor.editor) return

        callback({
            chain: autoFocus => this.getChain(isDropdownItem ? false : autoFocus),
            editor: this.ttEditor.editor,
            toast: this.toast,
        })
    }
    getChain = ((autoFocus = true) => {
        const chain = this.ttEditor.editor.chain()
        return autoFocus ? chain.focus() : chain
    }).bind(this)

    private controlArgs_?: EditorControlArgs
    get controlArgs(): EditorControlArgs {
        if (this.controlArgs_) return this.controlArgs_

        this.controlArgs_ = {
            chain: this.getChain,
            editor: this.ttEditor.editor,
            toast: this.toast,
        }
        return this.controlArgs_
    }
    get controlArgsAsRecord() {
        return this.controlArgs as unknown as Record<string, unknown>
    }

    resolveIcon(item: EditorControl) {
        if (!this.ttEditor.editor) return '' as IconKey
        return typeof item.icon == 'string' ? item.icon : item.icon(this.controlArgs)
    }
    resolveTitle(item: EditorControl) {
        if (!this.ttEditor.editor) return ''
        return typeof item.title == 'string' ? item.title : item.title(this.controlArgs)
    }

    navigate(url: string) {
        this.router.navigateByUrl(url)
    }
}
