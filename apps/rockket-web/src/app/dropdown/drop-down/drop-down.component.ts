import { CdkContextMenuTrigger, CdkMenu, CdkMenuTrigger } from '@angular/cdk/menu'
import { Component, ElementRef, EventEmitter, Input, Output, Type, ViewChild, inject } from '@angular/core'
import { BehaviorSubject, ReplaySubject, Subject, map } from 'rxjs'
import { DialogService } from 'src/app/modal/dialog.service'
import { moveToMacroQueue } from 'src/app/utils'
import {
    childrenAsComponent,
    childrenAsItems,
    isChildrenComponent,
    isChildrenMenuItems,
    useParamsForRoute,
} from 'src/app/utils/menu-item.helpers'
import { IconKey } from '../../components/atoms/icons/icon/icons'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface MenuItem<TArg = any> {
    title?: string
    /** Any valid `IconKey` or FontAwesome icon class */
    icon?: IconKey
    route?: string
    action?: (data: TArg) => void
    isActive?: boolean | ((data: TArg) => boolean)
    hideWhenActive?: boolean
    /** Only for display (doesn't hook up any listeners) for now */
    keybinding?: string
    children?: MenuItem[] | Type<unknown>
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
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef)
    private overlayService = inject(DialogService)

    items$_ = new BehaviorSubject<MenuItem[]>([])
    @Input() set items(items: MenuItem['children']) {
        if (isChildrenMenuItems(items)) this.items$_.next(items)
        else {
            // @TODO
            if (isChildrenComponent(items)) this.component$.next(items)
        }
    }

    component$ = new ReplaySubject<Type<unknown>>()
    items$ = this.items$_.pipe(
        // @TODO: we should check whether the data is appropriate for route params
        map(items =>
            !this.data ? items : items.map(useParamsForRoute(this.data as Record<string, string | number>)),
        ),
    )

    childrenAsItems = childrenAsItems
    isChildrenComponent = isChildrenComponent
    childrenAsComponent = childrenAsComponent

    /** `data` is used for actions and route param interpolation */
    @Input() data?: Record<string, unknown>
    /** `rootTrigger` is used to close the whole menu tree, when nested items are clicked */
    @Input() rootTrigger?: CdkMenuTrigger | CdkContextMenuTrigger

    triggerAction(action: MenuItem['action']) {
        // This ensures that the keydown event doesn't get picked up by another component
        moveToMacroQueue(() => action?.(this.data))
    }
    openOverlay(component: Type<unknown>) {
        const rect = this.elementRef.nativeElement.getBoundingClientRect()

        const dialogRef = this.overlayService.showOverlay(
            component,
            { left: rect.left, top: rect.top },
            this.data,
        )

        this.opened.next()
        setTimeout(() => {
            this.opened.next()
        })

        dialogRef.closed.subscribe(() => {
            this.closed.next()
        })
    }

    close(shouldEmit = true) {
        this.rootTrigger?.close()
        if (shouldEmit) this.closed.next()
    }

    MenuItemVariant = MenuItemVariant

    getIsActive(isActive: MenuItem['isActive']) {
        return typeof isActive == 'function' ? isActive(this.data) : isActive
    }

    @ViewChild(CdkMenu) menu!: CdkMenu
    get hasFocus$() {
        return this.menu.menuStack.hasFocus
    }

    @Output('opened') @Input('onOpen') opened: Subject<void> = new EventEmitter<void>()
    @Output('closed') @Input('onClose') closed: Subject<void> = new EventEmitter<void>()
}
