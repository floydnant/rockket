import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'menu-toggle-btn',
    templateUrl: './menu-toggle-btn.component.html',
    styleUrls: ['./menu-toggle-btn.component.css'],
})
export class MenuToggleBtnComponent {
    @Input() @Output() isOpen = false;
    @Input() size: 's' | 'l' = 's';
    @Input() type: 'hamburger' | 'chevron' = 'chevron';
    @Input() color: string = 'primary';

    @Output() onMenuToggle = new EventEmitter<boolean>();
    toggleMenu = () => {
        this.isOpen = !this.isOpen;
        this.onMenuToggle.emit(this.isOpen);
    };
}
