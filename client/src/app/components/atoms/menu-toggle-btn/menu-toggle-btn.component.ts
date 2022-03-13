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
import { isTouchDevice } from '../../../shared/utility.model';

@Component({
    selector: 'menu-toggle-btn',
    templateUrl: './menu-toggle-btn.component.html',
    styleUrls: ['./menu-toggle-btn.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class MenuToggleBtnComponent implements OnInit {
    @Input() @Output() isOpen = false;
    @Input() size: 's' | 'l' = 's';
    @Input() type: 'hamburger' | 'chevron' = 'chevron';
    @Input("fa-icon") icon: string;
    @Input() color: string = 'primary';
    @Input() dropdownOffset: string = "0px";

    isTouchDevice = isTouchDevice();

    // @ViewChild('checkForNgContent') checkForNgContent: ElementRef;
    @Input('drop-down-orientation') orientation: 'row' | 'column' = 'column';
    @Input() noDropDown: true | false | '' = false;
    @Input() position: 'left' | 'right' = 'left';

    @Output() onMenuToggle = new EventEmitter<boolean>();
    setIsOpen = (v: boolean) => (this.isOpen = v);
    toggleMenu = () => {
        this.setIsOpen(!this.isOpen);
        this.onMenuToggle.emit(this.isOpen);
    };

    constructor(private eRef: ElementRef) {}

    @HostListener('document:click', ['$event'])
    clickout(event) {
        if (!this.eRef.nativeElement.contains(event.target) && !(this.noDropDown || this.noDropDown === ''))
            this.setIsOpen(false);
    }

    ngOnInit(): void {}
    // ngAfterViewInit(): void {
    //     console.log(this.checkForNgContent.nativeElement);
    // }
}
