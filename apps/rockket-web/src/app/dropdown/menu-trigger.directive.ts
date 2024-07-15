import { CdkContextMenuTrigger, CdkMenuTrigger, CdkMenuTriggerBase } from '@angular/cdk/menu'
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    Output,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    inject,
} from '@angular/core'
import {
    BehaviorSubject,
    Observable,
    ReplaySubject,
    Subject,
    Subscription,
    map,
    merge,
    startWith,
} from 'rxjs'
import { MenuItem } from './drop-down/drop-down.component'

type DropDownTemplateWrapperData<TData> = {
    items$: Observable<MenuItem<TData>['children']>
    data$: Observable<TData | undefined>
    onClose$: Subject<void>
    onOpen$: Subject<void>
}

@Component({
    selector: 'app-dropdown-template-wrapper-component',
    template: `
        <ng-template #viewTemplate let-data>
            <app-drop-down
                [items]="data.items$ | push"
                [data]="data.data$ | push"
                [onClose]="data.onClose$"
                [onOpen]="data.onOpen$"
            ></app-drop-down>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropDownTemplateWrapperComponent {
    @ViewChild('viewTemplate') viewTemplateRef!: TemplateRef<DropDownTemplateWrapperData<unknown>>

    static templateRef: TemplateRef<DropDownTemplateWrapperData<unknown>>

    static getTemplate(viewContainerRef: ViewContainerRef) {
        if (DropDownTemplateWrapperComponent.templateRef) return DropDownTemplateWrapperComponent.templateRef

        const componentRef = viewContainerRef.createComponent(DropDownTemplateWrapperComponent)
        componentRef.changeDetectorRef.detectChanges()
        DropDownTemplateWrapperComponent.templateRef = componentRef.instance.viewTemplateRef

        return DropDownTemplateWrapperComponent.templateRef
    }
}

@Directive()
export abstract class AbstractMenuTriggerDirective<TMenuItemData> implements AfterViewInit, OnDestroy {
    private viewContainerRef = inject(ViewContainerRef)
    private elementRef: ElementRef<HTMLElement> = inject(ElementRef)

    // This is overridden in the concrete classes
    public cdkMenuTrigger!: CdkMenuTriggerBase

    private subscription = new Subscription()
    ngOnDestroy() {
        this.subscription.unsubscribe()
    }

    ngAfterViewInit() {
        this.cdkMenuTrigger.menuTemplateRef = DropDownTemplateWrapperComponent.getTemplate(
            this.viewContainerRef,
        )
        this.cdkMenuTrigger.menuData = {
            $implicit: {
                items$: this.items$,
                data$: this.data$,
                onClose$: this.onClose$,
                onOpen$: this.onOpen$,
            } satisfies DropDownTemplateWrapperData<TMenuItemData>,
        }

        for (const subscription of [
            this.cdkMenuTrigger.opened.subscribe(() => this.onOpen$.next()),
            this.cdkMenuTrigger.closed.subscribe(() => this.onClose$.next()),

            // The classlist changes must subscribe to the internal open/close events because the
            // cdkMenuTrigger.opened/closed observables are not triggered when we launch a custom overlay from the dropdown
            // (those are coming from the drop down menu dropdown-wrapper > template > dropdown-menu)
            this.onOpen$.subscribe(() => {
                this.elementRef.nativeElement.classList.add('menu-item-selected')
            }),
            this.onClose$.subscribe(() => {
                this.elementRef.nativeElement.classList.remove('menu-item-selected')
            }),
        ]) {
            this.subscription.add(subscription)
        }
    }

    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output('menuOpened') onOpen$ = new Subject<void>()
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output('menuClosed') onClose$ = new Subject<void>()
    @Output('isMenuOpen') isOpen$ = merge(
        this.onOpen$.pipe(map(() => true)),
        this.onClose$.pipe(map(() => false)),
    ).pipe(startWith(false))

    items$ = new ReplaySubject<MenuItem<TMenuItemData>['children']>(1)
    @Input({ required: true, alias: 'appMenu' }) set items(
        items: MenuItem<TMenuItemData>['children'] | undefined | null,
    ) {
        if (items) this.items$.next(items)
    }

    data$ = new BehaviorSubject<TMenuItemData | undefined>(undefined)
    @Input('appMenuData') set data(data: TMenuItemData) {
        this.data$.next(data)
    }
}

@Directive({
    selector: '[appMenu]',
    hostDirectives: [{ directive: CdkMenuTrigger }],
    exportAs: 'appMenu',
})
export class MenuTriggerDirective<TMenuItemData> extends AbstractMenuTriggerDirective<TMenuItemData> {
    public override cdkMenuTrigger = inject(CdkMenuTrigger)
}

@Directive({
    selector: '[appContextMenu]',
    hostDirectives: [{ directive: CdkContextMenuTrigger }],
    exportAs: 'appContextMenu',
})
export class ContextMenuTriggerDirective<TMenuItemData> extends AbstractMenuTriggerDirective<TMenuItemData> {
    public override cdkMenuTrigger = inject(CdkContextMenuTrigger)

    @Input({ required: true, alias: 'appContextMenu' })
    override set items(items: MenuItem<TMenuItemData>['children'] | undefined | null) {
        if (items) this.items$.next(items)
    }
}
