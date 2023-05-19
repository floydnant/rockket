import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    ViewEncapsulation,
    inject,
} from '@angular/core'
import { ChainedCommands, Editor } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Blockquote from '@tiptap/extension-blockquote'
import Strike from '@tiptap/extension-strike'
import Link from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'
import { Indentation } from '../extension-indentation'
import { BehaviorSubject, shareReplay, Subject, timer } from 'rxjs'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { coalesceWith } from '@rx-angular/cdk/coalescing'
import { formattingControlGroups } from '../formatting-controls'
import { createEventEmitter } from 'src/app/utils/observable.helpers'
import { HotToastService } from '@ngneat/hot-toast'

@UntilDestroy()
@Component({
    selector: 'app-rt-editor',
    templateUrl: './rt-editor.component.html',
    styleUrls: ['./rt-editor.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'block',
    },
})
export class RtEditorComponent implements OnDestroy {
    ngOnDestroy(): void {
        this.editor.destroy()
    }

    @Input() set value(value: string) {
        this.value$.next(value)
    }
    value$ = new Subject<string>()
    valueSub = this.value$.pipe(untilDestroyed(this)).subscribe(value => {
        this.editor?.commands.setContent(value, false)
    })
    @Output() blur = new EventEmitter<FocusEvent>()
    @Output() focus = new EventEmitter<FocusEvent>()

    @Input() disabled = false
    @Input() placeholder = ''

    @Output() valueChanges = new EventEmitter<string>()
    @Output() contentChanges = new EventEmitter<{ html: string; text: string }>()

    private isFocused$_ = new BehaviorSubject(false)
    isFocused$ = this.isFocused$_.pipe(
        coalesceWith(timer(70)),
        shareReplay({ bufferSize: 1, refCount: true }),
        untilDestroyed(this)
    )
    @Output() isFocused = createEventEmitter(this.isFocused$)

    toast = inject(HotToastService)

    editor = new Editor({
        parseOptions: {},
        editable: !this.disabled,
        extensions: [
            StarterKit.configure({ strike: false }),
            Strike.extend({
                addKeyboardShortcuts(this) {
                    const toggleStrike = () => this.editor.chain().focus().toggleStrike().run()
                    return {
                        'Mod-shift-S': toggleStrike,
                        'Mod-shift-X': toggleStrike,
                    }
                },
            }),
            Link.extend({
                addKeyboardShortcuts: () => {
                    const control = formattingControlGroups
                        .map(g => g.controls)
                        .flat()
                        .find(c => c.configKey === 'link')
                    if (!control?.registerKeybinding) return {}

                    return {
                        [control.registerKeybinding]: () =>
                            control.action ? this.execEditorChain(control.action) : false,
                    }
                },
            }),
            Typography.configure({
                emDash: false,
                // ellipsis ??
                openDoubleQuote: false,
                closeDoubleQuote: false,
                openSingleQuote: false,
                closeSingleQuote: false,
                notEqual: false,
            }),
            Placeholder.configure({
                placeholder: ({ node, editor }) => {
                    if (editor.isEmpty) return this.placeholder
                    if (node.type.name == Heading.name) return 'Heading ' + node.attrs['level']
                    if (node.type.name == Blockquote.name) return 'Quote'

                    // const parentNode = editor.state.selection.$anchor.parent
                    // console.log(node.type.name)
                    // console.log(parentNode.type.name)
                    // if (parentNode.type.name == 'bulletList') return 'List'
                    // if (parentNode.type.name == 'taskList') return 'Task'
                    // if (parentNode.type.name == 'codeBlock') return "Write some code let's goo!"

                    // if (node.type.name == Paragraph.name) return 'Type "/" for commands'

                    return ''
                },
                showOnlyCurrent: false,
            }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Indentation,
        ],
        onFocus: ({ event }) => {
            this.focus.emit(event)
            this.isFocused$_.next(true)
        },
        onBlur: ({ event }) => {
            const clickedElem = event.relatedTarget as HTMLElement | undefined
            const wasControlClicked =
                clickedElem?.className?.includes('format-control-item') ||
                clickedElem?.className?.includes('format-controls-container') ||
                clickedElem?.className?.includes('keep-editor-focus') ||
                clickedElem?.parentElement?.className?.includes('format-controls-container') ||
                clickedElem?.parentElement?.className?.includes('keep-editor-focus') ||
                false

            if (!wasControlClicked) {
                this.blur.emit(event)
                this.isFocused$_.next(false)
                this.deselectEditor()
            }
        },
        onUpdate: ({ editor }) => {
            this.valueChanges.emit(editor.getHTML())
            this.contentChanges.emit({ html: editor.getHTML(), text: editor.getText() })
        },
        editorProps: {
            handleKeyDown: (view, event) => {
                // @TODO: watch out for `metaKey` on windows & linux
                if (event.key === 'Enter' && event.metaKey && !event.shiftKey) {
                    this.editor.commands.blur()
                    return true
                }
                return false
            },
        },
    })

    execEditorChain(callback: (chain: ChainedCommands, editor: Editor) => ChainedCommands): boolean {
        return callback(this.editor.chain().focus(), this.editor).run()
    }

    deselectEditor() {
        window.getSelection()?.removeAllRanges()
    }
}
