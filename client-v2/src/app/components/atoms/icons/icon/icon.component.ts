import { Component, Input } from '@angular/core'
import { iconClasses, IconKey, isIconKey } from './icons'

@Component({
    selector: 'app-icon',
    template: '<i [class]="icon"></i>',
    styleUrls: [],
})
export class IconComponent {
    @Input() iconClass!: IconKey | string
    get icon() {
        if (isIconKey(this.iconClass)) return iconClasses[this.iconClass]
        return this.iconClass
    }
}
