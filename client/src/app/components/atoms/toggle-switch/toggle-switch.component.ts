import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'toggle-switch',
    templateUrl: './toggle-switch.component.html',
    styleUrls: ['./toggle-switch.component.css'],
})
export class ToggleSwitchComponent implements OnInit {
    @Input() isOn = false;
    @Output() onToggle = new EventEmitter<boolean>();
    toggle() {
        this.isOn = !this.isOn;
        this.onToggle.emit(this.isOn);
    }

    ngOnInit(): void {}
}
