import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DialogService } from '../custom-dialog';
import { ModalService } from '../../molecules/modal/modal.service';
import { TaskMeta } from '../../../shared/task.model';
import { Compare, getCopyOf, repeatAfterDelay, validateAndFormatUrl } from '../../../shared/utility.model';
import { editmenuOptions, EditmenuTaskData, responseHandlerInterface, EditmenuTasklistData } from './edit-menu.model';
import { EditMenuService } from './edit-menu.service';

@Component({
    selector: 'edit-menu',
    templateUrl: './edit-menu.component.html',
    styleUrls: ['./edit-menu.component.css'],
})
export class EditMenuComponent implements OnInit {
    public data: any; //needs to be 'any' because typecasting in the html template is a bit funky
    originalData: EditmenuTaskData | EditmenuTasklistData;

    type: editmenuOptions['type'];
    noEdit = false;
    hightlight: editmenuOptions['hightlight'] = null;

    isOpen = false;

    @ViewChild('nameInputRef') nameInputRef: ElementRef<HTMLInputElement>;
    @ViewChild('linkList') linkList: ElementRef<HTMLDivElement>;
    @ViewChild('notesTextarea') notesTextarea: ElementRef<HTMLTextAreaElement>;

    constructor(
        private modalService: ModalService,
        private editMenuService: EditMenuService,
        private dialogService: DialogService
    ) {}

    open({ type, noEdit, data, hightlight }: editmenuOptions) {
        this.isOpen = true;
        this.modalService.open('edit-menu');

        this.type = type;
        this.noEdit = noEdit;
        this.hightlight = hightlight;

        this.originalData = getCopyOf(data);

        const { meta, ...rest } = data;
        this.data = {
            ...(this.type == 'Task' ? new EditmenuTaskData() : new EditmenuTasklistData()),
            ...rest,
            meta: getCopyOf(meta),
        };

        if (!hightlight) repeatAfterDelay(() => this.nameInputRef.nativeElement.focus(), [100, 300, 500]);
        else {
            if (this.hightlight == 'links') this.linkList?.nativeElement.scrollIntoView({ behavior: 'smooth' });
            if (this.hightlight == 'notes')
                repeatAfterDelay(() => this.notesTextarea?.nativeElement.focus(), [100, 300, 500]);
        }
    }

    async close(responseStatus: responseHandlerInterface['responseStatus']) {
        const dataHasChanged = !Compare.object(this.data, this.originalData);

        if (responseStatus == 'Cancelled' && dataHasChanged) {
            const confirmationResponse = await this.dialogService
                .confirm({
                    title: 'Abandone changes?',
                    text: 'You already made some changes, want to abandone them?',
                    buttons: ['Abandone', 'Cancel'],
                })
                .catch(err => err);
            if (confirmationResponse == 'Cancel') return;
        }

        this.isOpen = false;
        this.modalService.close('edit-menu');

        if (this.type == 'Task' && responseStatus == 'OK') this.addLink();
        this.editMenuService.responseHandler({ updatedData: getCopyOf(this.data), responseStatus });

        this.nameInputRef.nativeElement.blur();
        this.linkInput = '';
    }

    linkInput: string;
    addLink() {
        const { resUrl, isDomainValid } = validateAndFormatUrl(this.linkInput);
        const link = resUrl;

        if (link == '') return;

        if (!isDomainValid) {
            this.dialogService.confirm({
                title: 'invalid domain',
                text: "Your Link should at least look like this: 'example.com'",
            });
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
