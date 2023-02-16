import { Component, Input } from '@angular/core'
import { iconClasses, IconKey, isIconKey } from './icons'

@Component({
    selector: 'app-icon',
    template: '<i [class]="iconClass"></i>',
    styleUrls: [],
})
export class IconComponent {
    @Input() icon!: IconKey | string
    get iconClass() {
        if (isIconKey(this.icon)) return iconClasses[this.icon]
        return this.icon
    }
}
