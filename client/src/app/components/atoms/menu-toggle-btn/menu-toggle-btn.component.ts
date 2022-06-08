import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
} from '@angular/core';
import { colorClasses } from 'src/app/shared/css-classes.model';
import { isTouchDevice } from '../../../shared/utils';

@Component({
    selector: 'menu-toggle-btn',
    templateUrl: './menu-toggle-btn.component.html',
    styleUrls: ['./menu-toggle-btn.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class MenuToggleBtnComponent implements OnInit {
    @Input() @Output() isOpen = false;
    @Input() size: 's' | 'm' = 'm';
    @Input() type: 'hamburger' | 'chevron' = 'chevron';
    @Input('fa-icon') icon: string;
    @Input() colorClass: colorClasses = 'clr-primary';
    @Input() dropdownOffset: string = '0px';
    @Input() noDropdownPadding = false;

    isTouchDevice = isTouchDevice();

    // @ViewChild('checkForNgContent') checkForNgContent: ElementRef;
    @Input('drop-down-orientation') orientation: 'row' | 'column' = 'column';
    @Input() noDropDown: true | false | '' = false;
    @Input() position: 'left' | 'right' = 'left';

    @Output() onMenuToggle = new EventEmitter<boolean>();
    setIsOpen = (nowOpen: boolean) => {
        if (this.isOpen == nowOpen) return;

        this.isOpen = nowOpen;
        this.onMenuToggle.emit(this.isOpen);
    };
    toggleMenu = () => {
        this.setIsOpen(!this.isOpen);
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
