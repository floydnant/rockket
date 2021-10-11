import { Component, ElementRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalService } from './modal.service';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit {
    @Input() id!: string;
    private element: HTMLElement;

    public testValue = 'testValue';

    constructor(private modalService: ModalService, el: ElementRef) {
        this.element = el.nativeElement;
    }

    keyboardHandler = (event: KeyboardEvent) => {
        if (event.key == 'Escape') this.close();
    };

    // open modal
    open(): void {
        // this.element.style.display = 'block';
        this.element.classList.add('open');
        document.body.classList.add('jw-modal-open');

        document.addEventListener('keydown', this.keyboardHandler);
    }

    // close modal
    close(): void {
        // this.element.style.display = 'none';
        this.element.classList.remove('open');
        document.body.classList.remove('jw-modal-open');
        document.removeEventListener('keydown', this.keyboardHandler);
    }

    ngOnInit(): void {
        // ensure id attribute exists
        if (!this.id) {
            console.error('modal must have an id');
            return;
        }

        // move element to bottom of page (just before </body>) so it can be displayed above everything else
        document.body.appendChild(this.element);

        // close modal on background click
        this.element.addEventListener('click', (el: any) => {
            if (el.target.className === 'jw-modal') {
                this.close();
            }
        });

        // add self (this modal instance) to the modal service so it's accessible from controllers
        this.modalService.add(this);
    }

    // remove self from modal service when component is destroyed
    ngOnDestroy(): void {
        this.modalService.remove(this.id);
        this.element.remove();
    }
}
