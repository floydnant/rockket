import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from '../modal/modal.service';
import { generateId } from './../shared/utility.model';

@Component({
    selector: 'custom-dialog',
    templateUrl: './custom-dialog.component.html',
    styleUrls: ['./custom-dialog.component.css'],
})
export class CustomDialogComponent implements OnInit {
    constructor(public modalService: ModalService) {}

    @Input() title: string;
    @Input() text: string;
    @Input() buttons: string[] = ['OK'];
    @Input() type: 'confirm' | 'prompt' = 'confirm';
    id = generateId();

    closeDialog(btnIndex) {
        // do some stuff

        this.modalService.close('custom-dialog');
    }

    ngOnInit(): void {}
}
