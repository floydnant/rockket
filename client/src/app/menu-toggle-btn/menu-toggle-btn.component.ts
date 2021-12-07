import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'menu-toggle-btn',
    templateUrl: './menu-toggle-btn.component.html',
    styleUrls: ['./menu-toggle-btn.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class MenuToggleBtnComponent {
    @Input() @Output() isOpen = false;
    @Input() size: 's' | 'l' = 's';
    @Input() type: 'hamburger' | 'chevron' = 'chevron';
    @Input() color: string = 'primary';

    @Input('drop-down-orientation') orientation: 'row' | 'column' = 'column';

    @Output() onMenuToggle = new EventEmitter<boolean>();
    toggleMenu = () => {
        this.isOpen = !this.isOpen;
        this.onMenuToggle.emit(this.isOpen);
    };
}
