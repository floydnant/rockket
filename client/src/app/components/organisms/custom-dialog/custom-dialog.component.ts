import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { repeatAfterDelay } from 'src/app/shared/utility.model';
import { ModalService } from '../../molecules/modal/modal.service';
import { CustomDialogComponentProps } from './custom-dialog.model';
import { DialogService } from './custom-dialog.service';

@Component({
    selector: 'custom-dialog',
    templateUrl: './custom-dialog.component.html',
    styleUrls: ['./custom-dialog.component.css'],
})
export class CustomDialogComponent implements OnInit {
    constructor(private modalService: ModalService, private dialogService: DialogService) {}

    promptInput: string;
    props: CustomDialogComponentProps;
    @ViewChild('localInputRef') inputRef: ElementRef;

    isOpen = false;

    open(props: CustomDialogComponentProps) {
        this.isOpen = true;
        this.modalService.open('custom-dialog');

        this.props = props;

        this.promptInput = props.defaultValue;
        if (props.type == 'prompt') repeatAfterDelay(() => this.inputRef.nativeElement.focus(), [100, 300, 500]);
    }

    closeDialog(resBtnIndex: number) {
        this.isOpen = false;
        this.modalService.close('custom-dialog');

        this.dialogService.responseHandler({
            buttons: this.props.buttons,
            resBtnIndex,
            promptInput: this.promptInput,
            filterdArray: this.props.filterArray,
        });

        this.promptInput = '';
        this.inputRef?.nativeElement.blur();
    }

    @HostListener('document:keydown', ['$event'])
    keyboardHandler(e: KeyboardEvent) {
        if (!this.isOpen) return;
        if (e.key == 'Enter') this.closeDialog(this.props.buttons.length - 1);
        if (e.key == 'Escape') this.closeDialog(this.props.buttons.length - 2);
    }

    ngOnInit(): void {
        this.dialogService.dialog = this;
    }
}
