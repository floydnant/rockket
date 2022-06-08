import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { repeatAfterDelay } from 'src/app/shared/utils';
import { ModalService } from '../../molecules/modal/modal.service';
import { DialogComponentProps } from './dialog.model';
import { DialogService } from '../../../services/dialog.service';

@Component({
    selector: 'custom-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss'],
})
export class CustomDialogComponent implements OnInit {
    constructor(private modalService: ModalService, private dialogService: DialogService) {}

    promptInput: string;
    props: DialogComponentProps;
    @ViewChild('localInputRef') inputRef: ElementRef;

    getColorClass(btnText: string, i: number, buttons: string[]) {
        if (btnText[0] == '!') return 'clr-danger'
        if (i == buttons.length - 1) return 'clr-submit'
        return 'clr-neutral'
        // [class.clr-danger]="btnText[0] == '!'"
        // [class.clr-submit]="i == buttons.length - 1 && btnText[0] != '!'"
        // [class.clr-neutral]="true"
    }

    isOpen = false;

    open(props: DialogComponentProps) {
        this.isOpen = true;
        this.modalService.open('custom-dialog');

        this.props = props;

        this.promptInput = props.defaultValue;
        if (props.type == 'prompt') repeatAfterDelay(() => this.inputRef.nativeElement.focus(), [100, 300, 500]);
    }

    closeDialog(resBtnIndex: number) {
        setTimeout(() => (this.isOpen = false), 220);
        this.modalService.close('custom-dialog');

        this.dialogService.responseHandler({
            clickedButton: this.props.buttons[resBtnIndex],
            responseValue: this.promptInput?.trim(),
            selectedItems: this.props.filterList,
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
