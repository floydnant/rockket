import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BtnColorClasses } from 'src/app/shared/css-classes.model';

@Component({
    selector: 'collapse-toggle',
    templateUrl: './collapse-toggle.component.html',
    styleUrls: ['./collapse-toggle.component.css'],
})
export class CollapseToggleComponent implements OnInit {
    constructor() {}
    @Input() @Output() isOpen = false;
    @Input('hideToggleText') toggleText: true | 'dimm' | '' = true;
    @Input() dimm: 'none' | 'dimm-1' | 'dimm-2' = 'dimm-1';
    @Input() colorClass: BtnColorClasses | 'neutral' = 'neutral';
    @Input('noSpacing') spacing: true | '' = true;

    @Output() onToggle = new EventEmitter<boolean>();

    ngOnInit(): void {}
}
