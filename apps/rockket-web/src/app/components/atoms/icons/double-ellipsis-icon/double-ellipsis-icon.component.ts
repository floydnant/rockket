import { Component } from '@angular/core'

@Component({
    selector: 'double-ellipsis-icon',
    template: `<span class="inline-block w-max">
        <app-icon icon="ellipsisVertical"></app-icon><app-icon icon="ellipsisVertical"></app-icon>
    </span>`,
    styleUrls: [],
})
export class DoubleEllipsisIconComponent {}
