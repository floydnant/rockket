import { CdkContextMenuTrigger, CdkMenuTrigger } from '@angular/cdk/menu'
import { Component, Input } from '@angular/core'
import { BehaviorSubject, map } from 'rxjs'
import { moveToMacroQueue } from 'src/app/utils'
import { useParamsForRoute } from 'src/app/utils/menu-item.helpers'
import { IconKey } from '../../atoms/icons/icon/icons'

export interface MenuItem {
    title?: string
    /** Any valid `IconKey` or FontAwesome icon class */
    icon?: IconKey
    route?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action?: (data?: any) => void
    isActive?: boolean
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
    items$_ = new BehaviorSubject<MenuItem[]>([])
    @Input() set items(items: MenuItem[]) {
        this.items$_.next(items)
    }
    items$ = this.items$_.pipe(map(items => (!this.data ? items : items.map(useParamsForRoute(this.data)))))

    /** `data` is used for actions and route param interpolation */
    @Input() data?: Record<string, string | number>
    /** `rootTrigger` is used to close the whole menu tree, when nested items are clicked */
    @Input() rootTrigger?: CdkMenuTrigger | CdkContextMenuTrigger

    triggerAction(action: MenuItem['action']) {
        // this ensures that the keydown event doesn't get picked up by another component
        moveToMacroQueue(() => action?.(this.data))
    }

    MenuItemVariant = MenuItemVariant
}
