import { Component, Input } from '@angular/core'

@Component({
    selector: 'app-centered-layout',
    templateUrl: './centered-layout.component.html',
    styleUrls: [],
})
export class CenteredLayoutComponent {
    @Input() width: 'sm' | 'md' | 'lg' = 'sm'
    widthClasses = {
        sm: 'max-w-prose',
        md: 'max-w-[80ch]',
        lg: 'max-w-[90ch]',
    }

    @Input() fullHeight = true
    @Input() containerClasses = ''
    @Input() enableBackground = true
}
