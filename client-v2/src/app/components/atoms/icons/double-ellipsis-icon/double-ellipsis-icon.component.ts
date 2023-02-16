import { Component } from '@angular/core'

@Component({
    selector: 'double-ellipsis-icon',
    template: `<span class="inline-block w-max">
        <app-icon icon="fas fa-ellipsis-v"></app-icon><app-icon icon="fas fa-ellipsis-v"></app-icon>
    </span>`,
    styleUrls: [],
})
export class DoubleEllipsisIconComponent {}
