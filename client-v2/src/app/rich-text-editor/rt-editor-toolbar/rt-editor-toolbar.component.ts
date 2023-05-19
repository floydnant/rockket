import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { ChainedCommands, Editor } from '@tiptap/core'
import { formattingControlGroups } from '../formatting-controls'
import { BehaviorSubject, debounceTime, map } from 'rxjs'
import { EditorConfig, FormattingControl, FormattingControlGroup } from '../types'
import { IconKey } from 'src/app/components/atoms/icons/icon/icons'

@Component({
    selector: 'app-rt-editor-toolbar',
    templateUrl: './rt-editor-toolbar.component.html',
    styleUrls: ['./rt-editor-toolbar.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtEditorToolbarComponent implements OnInit, OnDestroy {
    ngOnInit(): void {
        this.editor?.on('selectionUpdate', this.selectionUpdateCallback)
        this.editor?.on('update', this.selectionUpdateCallback)
    }
    ngOnDestroy(): void {
        this.editor?.off('selectionUpdate', this.selectionUpdateCallback)
        this.editor?.off('update', this.selectionUpdateCallback)
    }

    @Input() editor!: Editor
    @Input() config: Record<keyof EditorConfig, true> = {
        basic: true,
        bold: true,
        italic: true,
        strike: true,
        link: true,
        blocks: true,
        headings: true,
        lists: true,
        taskLists: true,
        rule: true,
        code: true,
        codeBlock: true,
        undoRedo: true,
    }

    execEditorChain(callback: (chain: ChainedCommands, editor: Editor) => ChainedCommands, autoFocus = true) {
        if (!this.editor) return

        callback(this.getChain(autoFocus), this.editor).run()
    }
    getChain(autoFocus = true) {
        let chain = this.editor.chain()
        if (autoFocus) chain = chain.focus()
        return chain
    }

    groups = formattingControlGroups
        .filter(({ configKey }) =>
            typeof configKey == 'string' ? this.config[configKey] : configKey.some(key => this.config[key])
        )
        .map(group => ({
            ...group,
            controls: group.controls.filter(({ configKey }) =>
                typeof configKey == 'string' ? this.config[configKey] : configKey.some(key => this.config[key])
            ),
        }))

    selectionUpdateCallback = (() => this.updates$.next(null)).bind(this)
    updates$ = new BehaviorSubject<unknown>(null)
    formattingControls$ = this.updates$.pipe(
        debounceTime(120),
        // must be new objects to trigger change detection
        map(() => this.groups.map(group => ({ ...group })))
    )

    controlGroupTrackBy(index: number, item: FormattingControlGroup) {
        return index + item.configKey.toString()
    }
    controlTrackBy(index: number, item: FormattingControl) {
        if (!this.editor) return index
        return '' + index + this.getTitle(item) + this.getIcon(item) + item.isActive?.(this.editor)
    }
    getIcon(item: FormattingControl) {
        if (!this.editor) return '' as IconKey
        const icon = typeof item.icon == 'string' ? item.icon : item.icon(this.editor)
        return icon
    }
    getTitle(item: FormattingControl) {
        if (!this.editor) return '' as IconKey
        const title = typeof item.title == 'string' ? item.title : item.title(this.editor)
        return title
    }
}
