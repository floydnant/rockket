import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DialogService } from '../custom-dialog';
import { ModalService } from '../modal/modal.service';
import { TaskMeta } from '../shared/task.model';
import { getCopyOf, validateAndFormatUrl } from '../shared/utility.model';
import { editmenuOptions, EditmenuTaskData, responseHandlerInterface, EditmenuTasklistData } from './edit-menu.model';
import { EditMenuService } from './edit-menu.service';

@Component({
    selector: 'edit-menu',
    templateUrl: './edit-menu.component.html',
    styleUrls: ['./edit-menu.component.css'],
})
export class EditMenuComponent implements OnInit {
    public data: any; //needs to be 'any' because typecasting in the html template is a bit funky

    type: editmenuOptions['type'];
    noEdit = false;
    viewLinks = false;

    isOpen = false;

    @ViewChild('nameInputRef') nameInputRef: ElementRef<HTMLInputElement>;
    @ViewChild('linkList') linkList: ElementRef<HTMLDivElement>;

    constructor(
        private modalService: ModalService,
        private editMenuService: EditMenuService,
        private dialogService: DialogService
    ) {}

    open({ type, noEdit, data, viewLinks }: editmenuOptions) {
        this.isOpen = true;
        this.modalService.open('edit-menu');

        this.type = type;
        this.noEdit = noEdit;
        this.viewLinks = viewLinks;

        const { meta, ...rest } = data;
        this.data = {
            ...(this.type == 'Task' ? new EditmenuTaskData() : new EditmenuTasklistData()),
            ...rest,
            meta: getCopyOf(meta),
        };

        if (!viewLinks)
            [100, 300, 500].forEach(delay => setTimeout(() => this.nameInputRef.nativeElement.focus(), delay));
        this.linkList?.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }

    close(responseStatus: responseHandlerInterface['responseStatus']) {
        this.isOpen = false;
        this.modalService.close('edit-menu');

        if (this.type == 'Task' && responseStatus == 'OK') this.addLink();
        this.editMenuService.responseHandler({ updatedData: getCopyOf(this.data), responseStatus });

        this.nameInputRef.nativeElement.blur();
        this.linkInput = '';
    }

    linkInput: string;
    addLink() {
        const validation = validateAndFormatUrl(this.linkInput);
        const link = validation.resUrl;

        if (link == '') return;

        if (!validation.isDomainValid && link != '') {
            this.dialogService.confirm({ title: 'invalid link' });
            return;
        }

        (this.data.meta as TaskMeta).links.push(link);
        this.linkInput = '';
    }
    removeLink = (index: number) => (this.data.meta as TaskMeta).links.splice(index, 1);
    trimLinkInput = () => ('' + this.linkInput).replace(/undefined/, '').trim();

    @HostListener('document:keydown', ['$event'])
    keyboardHandler(e: KeyboardEvent) {
        if (!this.isOpen) return;
        if (e.key == 'Enter' && !e.shiftKey) this.close('OK');
        if (e.key == 'Escape') this.close('Cancelled');
    }

    ngOnInit(): void {
        this.editMenuService.editMenu = this;
    }
}
