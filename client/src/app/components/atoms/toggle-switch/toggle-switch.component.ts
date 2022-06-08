import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { colorClasses } from 'src/app/shared/css-classes.model';

@Component({
    selector: 'toggle-switch',
    templateUrl: './toggle-switch.component.html',
    styleUrls: ['./toggle-switch.component.scss'],
})
export class ToggleSwitchComponent implements OnInit {
    @Input() isOn = false;
    @Input() colorClass: colorClasses = "clr-tinted-neutral";

    @Output() onToggle = new EventEmitter<boolean>();
    toggle() {
        this.isOn = !this.isOn;
        this.onToggle.emit(this.isOn);
    }

    ngOnInit(): void {}
}
