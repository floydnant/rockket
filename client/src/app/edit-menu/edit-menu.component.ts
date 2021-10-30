import { Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DialogService } from '../custom-dialog';
import { ModalService } from '../modal/modal.service';
import { TaskList } from '../shared/taskList.model';
import { getCopyOf, validateAndFormatUrl } from '../shared/utility.model';
import { editmenuProps, editmenuPropsTask, editmenuPropsTasklist } from './edit-menu.model';
import { EditMenuService } from './edit-menu.service';
import { returnInterface } from './edit-menu.service';

interface meta {
    notes: string;
    links?: string[];
}
export class DataEdit_ {
    meta: meta;
    constructor(public name: string, meta: meta, public priority?: number) {
        this.meta = getCopyOf(meta);
    }
}

@Component({
    selector: 'edit-menu',
    templateUrl: './edit-menu.component.html',
    styleUrls: ['./edit-menu.component.css'],
})
export class EditMenuComponent implements OnInit {
    defaultData = () => new DataEdit_('', { notes: '', links: [] }, 0);
    dataEdit: DataEdit_ = this.defaultData();
    type: editmenuProps['type'];

    @ViewChild('nameInputRef') nameInputRef: ElementRef;

    constructor(
        private modalService: ModalService,
        private editMenuService: EditMenuService,
        private dialogService: DialogService
    ) {}

    open(props: editmenuProps) {
        this.type = props.type;

        switch (this.type) {
            case 'Task':
                this.dataEdit = new DataEdit_(
                    props.data.name,
                    props.data.meta,
                    (props.data as editmenuPropsTask).priority
                );
                break;
            case 'TaskList':
                this.dataEdit = new DataEdit_(props.data.name, props.data.meta);
                break;
        }
        this.modalService.open('edit-menu');
        setTimeout(() => this.nameInputRef.nativeElement.select(), 100);
        setTimeout(() => this.nameInputRef.nativeElement.select(), 300);
        this.isOpen = true;
    }

    close(btnRes: returnInterface['responseStatus']) {
        if (this.type == 'Task' && btnRes == 'OK') this.addLink();
        this.modalService.close('edit-menu');
        this.isOpen = false;
        this.editMenuService.return({ updatedProps: getCopyOf(this.dataEdit), responseStatus: btnRes });

        this.dataEdit = this.defaultData();
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

        this.dataEdit.meta.links.push(link);
        this.linkInput = '';
    }
    removeLink = (index: number) => this.dataEdit.meta.links.splice(index, 1);
    trimLinkInput = () => ('' + this.linkInput).replace(/undefined/, '').trim();

    isOpen = false;
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
