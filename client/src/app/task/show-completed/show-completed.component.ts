import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'show-completed',
    templateUrl: './show-completed.component.html',
    styleUrls: ['./show-completed.component.css'],
})
export class ShowCompletedComponent implements OnInit {
    constructor() {}
    @Input() @Output() isOpen = false;
    @Input() tasks: number;

    @Output() onToggle = new EventEmitter<boolean>();

    ngOnInit(): void {}
}
