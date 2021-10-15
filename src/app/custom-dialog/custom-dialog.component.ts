import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { customDialogProps, defaultCustomDialogProps } from './custom-dialog.model';
import { DialogService } from './custom-dialog.service';

@Component({
    selector: 'custom-dialog',
    templateUrl: './custom-dialog.component.html',
    styleUrls: ['./custom-dialog.component.css'],
})
export class CustomDialogComponent implements OnInit {
    constructor(private modalService: ModalService, private dialogService: DialogService) {}

    promptInput: string;
    props: customDialogProps = new defaultCustomDialogProps();
    @ViewChild('localInputRef') inputRef: ElementRef;

    open(props: customDialogProps) {
        this.props = props;
        if (props.defaultValue) this.promptInput = props.defaultValue;

        if (props.type == 'prompt') this.inputRef.nativeElement.select();
        this.modalService.open('custom-dialog');
    }

    closeDialog(resBtnIndex: number) {
        this.modalService.close('custom-dialog');

        this.dialogService.return({
            buttons: this.props.buttons,
            resBtnIndex,
            promptInput: this.promptInput,
        });

        this.promptInput = '';
    }

    @HostListener('document:keydown', ['$event'])
    keyboardHandler(e: KeyboardEvent) {
        if (e.key == 'Enter') this.closeDialog(this.props.buttons.length - 1);
        if (e.key == 'Escape') this.closeDialog(this.props.buttons.length - 2);
    }

    ngOnInit(): void {
        this.dialogService.dialog = this;
    }
}
