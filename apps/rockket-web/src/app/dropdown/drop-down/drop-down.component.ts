import { CdkContextMenuTrigger, CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu'
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { BehaviorSubject, map } from 'rxjs'
import { moveToMacroQueue } from 'src/app/utils'
import { useParamsForRoute } from 'src/app/utils/menu-item.helpers'
import { IconKey } from '../../components/atoms/icons/icon/icons'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MenuItem<TArg = any> {
    title?: string
    /** Any valid `IconKey` or FontAwesome icon class */
    icon?: IconKey
    route?: string
    action?: (data: TArg) => void
    isActive?: boolean | ((data: TArg) => boolean)
    /** Only for display (doesn't hook up any listeners) for now */
    keybinding?: string
    children?: MenuItem[]
    isSeparator?: boolean
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
    items$ = this.items$_.pipe(
        // @TODO: we should check wether the data is appropriate for route params
        map(items => (!this.data ? items : items.map(useParamsForRoute(this.data as Record<string, string | number>))))
    )

    /** `data` is used for actions and route param interpolation */
    @Input() data?: Record<string, unknown>
    /** `rootTrigger` is used to close the whole menu tree, when nested items are clicked */
    @Input() rootTrigger?: CdkMenuTrigger | CdkContextMenuTrigger

    triggerAction(action: MenuItem['action']) {
        // This ensures that the keydown event doesn't get picked up by another component
        moveToMacroQueue(() => action?.(this.data))
    }

    MenuItemVariant = MenuItemVariant

    getIsActive(isActive: MenuItem['isActive']) {
        return typeof isActive == 'function' ? isActive(this.data) : isActive
    }

    @ViewChild(CdkMenu) menu!: CdkMenu
    get hasFocus$() {
        return this.menu.menuStack.hasFocus
    }

    @Output() closed = new EventEmitter<void>()
}
