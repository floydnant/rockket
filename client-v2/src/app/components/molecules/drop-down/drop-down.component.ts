import { Component, Input, OnInit } from '@angular/core'
import { PageEntityIconKey } from '../../atoms/icons/page-entity-icon/page-entity-icon.component'

export interface MenuItem {
    title?: string
    icon?: PageEntityIconKey
    route?: string
    action?: () => void
    children?: MenuItem[]
    isSeperator?: boolean
}

@Component({
    selector: 'app-drop-down',
    templateUrl: './drop-down.component.html',
    styleUrls: ['./drop-down.component.css'],
})
export class DropDownComponent implements OnInit {
    constructor() {}
    ngOnInit(): void {}

    @Input() items!: MenuItem[]
}
