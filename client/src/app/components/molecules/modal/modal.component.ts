import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { ModalService } from './modal.service';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ModalComponent implements OnInit {
    @Input() id!: string;
    private element: HTMLElement;

    public testValue = 'testValue';

    constructor(private modalService: ModalService, private elemRef: ElementRef) {
        this.element = elemRef.nativeElement;
    }
    isOpen = false;
    setIsOpenTrue() {
        this.isOpen = true;
    }

    // open modal
    open(): void {
        setTimeout(() => this.setIsOpenTrue(), 200);
        // this.element.style.display = 'block';
        this.element.classList.add('open');
        document.body.classList.add('modal-open');
    }

    // close modal
    close(): void {
        this.isOpen = false;
        // this.element.style.display = 'none';
        this.element.classList.remove('open');
        document.body.classList.remove('modal-open');
    }

    @ViewChild('closeOnClick') closeOnClick: ElementRef<HTMLElement>;
    //let the parent Component handle the close event, so it can cleanup and do some other stuff
    @Output() onClose = new EventEmitter();
    closeAndCleanUp = () => this.onClose.emit();

    @HostListener('document:click', ['$event'])
    clickout(event: PointerEvent): void {
        // if (!this.closeOnClick.nativeElement.contains(event.target as Node) && this.isOpen) this.close();
        if (this.closeOnClick.nativeElement == event.target && this.isOpen) this.closeAndCleanUp();
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
            if (el.target.className === 'modal') {
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
