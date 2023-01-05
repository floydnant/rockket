import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DoubleEllipsisIconComponent } from './double-ellipsis-icon/double-ellipsis-icon.component'
import { IconComponent } from './icon/icon.component'
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component'
import { PageEntityIconComponent } from './page-entity-icon/page-entity-icon.component'
import { PriorityIconComponent } from './priority-icon/priority-icon.component'

@NgModule({
    declarations: [
        DoubleEllipsisIconComponent,
        IconComponent,
        LoadingSpinnerComponent,
        PageEntityIconComponent,
        PriorityIconComponent,
    ],
    imports: [CommonModule],
    exports: [
        DoubleEllipsisIconComponent,
        IconComponent,
        LoadingSpinnerComponent,
        PageEntityIconComponent,
        PriorityIconComponent,
    ],
})
export class IconsModule {}
