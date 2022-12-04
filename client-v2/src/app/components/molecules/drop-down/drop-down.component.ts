import { CdkMenuTrigger } from '@angular/cdk/menu'
import { Component, Input } from '@angular/core'
import { moveToMacroQueue } from 'src/app/utils'
import { PageEntityIconKey } from '../../atoms/icons/page-entity-icon/page-entity-icon.component'

export interface MenuItem {
    title?: string
    icon?: PageEntityIconKey
    route?: string
    action?: () => void
    children?: MenuItem[]
    isSeperator?: boolean
    variant?: MenuItemVariant
}

export enum MenuItemVariant {
    DEFAULT = 'menu-item--default',
    DANGER = 'menu-item--danger',
    SUBMIT = 'menu-item--submit',
}

@Component({
    selector: 'app-drop-down',
    templateUrl: './drop-down.component.html',
    styleUrls: ['./drop-down.component.css'],
})
export class DropDownComponent {
    @Input() items!: MenuItem[]
    @Input() rootTrigger?: CdkMenuTrigger

    triggerAction(action: MenuItem['action']) {
        // this ensures that the keydown event doesn't get picked up by another component
        moveToMacroQueue(() => action?.())
    }

    MenuItemVariant = MenuItemVariant
}
