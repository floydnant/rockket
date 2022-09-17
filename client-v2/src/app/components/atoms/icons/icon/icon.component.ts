import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-icon',
    template: '<i [class]="iconClass"></i>',
    styleUrls: [],
})
export class IconComponent {
    @Input() iconClass!: string
}
