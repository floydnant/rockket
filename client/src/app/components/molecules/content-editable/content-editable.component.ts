import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { moveToMacroQueue } from 'src/app/shared/utils';

@Component({
    selector: 'content-editable',
    templateUrl: './content-editable.component.html',
    styleUrls: ['./content-editable.component.scss'],
})
export class ContentEditableComponent implements OnInit, OnDestroy {
    constructor() {}

    ngOnInit(): void {
        this.resetEventsSubscription = this.resetEventsSubject?.subscribe(() => this.resetBlock());
        this.focusEventSubscription = this.focusEventSubject?.subscribe(nowFocused => this.forceFocusState(nowFocused));

        // this.contentChanges.emit(this.props.content);
        this.updatedContent = this.props.content;
    }
    ngOnDestroy() {
        this.resetEventsSubscription?.unsubscribe();
        this.focusEventSubscription?.unsubscribe();
    }

    @Input() variant: 'pop out' | 'full border' | 'input style' = 'pop out';

    @Input('contentEditableOptions') props: {
        content: string;
        allowEdit?: boolean;
        plainOnly?: boolean;
        spellCheck?: boolean;
        forceFocusedOnBlur?: boolean;
        noKeybindings?: boolean;
        placeholder?: string;
    } = {
        content: '<empty>',
        allowEdit: true,
        spellCheck: true,
    };

    updatedContent: string;
    @Output() contentChanges = new EventEmitter<string>();

    @ViewChild('contentBlock') contentBlock: ElementRef<HTMLDivElement>;

    isBlockFocused = false;
    @Output() focusEvents = new EventEmitter<boolean>();
    focusEventshandler(nowFocused: boolean) {
        if (!nowFocused && this.props.forceFocusedOnBlur) return;

        this.isBlockFocused = nowFocused;
        this.focusEvents.emit(nowFocused);
    }

    @Output() keydownEvents = new EventEmitter<KeyboardEvent>();
    keydownHandler(e: KeyboardEvent) {
        if (!this.props.noKeybindings) {
            if (e.key == 'Enter' && (e.ctrlKey || e.metaKey)) this.leaveBlock();
            if (e.key == 'Escape') {
                this.resetBlock();
                this.leaveBlock();
            }
        }
        this.keydownEvents.emit(e);
    }
    leaveBlock() {
        this.isBlockFocused = false;
        this.contentBlock.nativeElement.blur();
    }
    @Input() focusEventSubject: Observable<boolean>;
    focusEventSubscription: Subscription;
    forceFocusState(nowFocused: boolean) {
        if (nowFocused) this.contentBlock.nativeElement.focus();
        else this.contentBlock.nativeElement.blur();
    }
    @Input() resetEventsSubject: Observable<any>;
    resetEventsSubscription: Subscription;
    resetBlock() {
        const originalContent = this.props.content;
        this.updatedContent = this.props.content;

        // change the value to something different so change detection kicks in
        this.props.content = originalContent + ' ';
        this.contentChanges.emit(originalContent);
        // and change it back, after change detection
        moveToMacroQueue(() => (this.props.content = originalContent));
    }
}
