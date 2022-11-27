import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DoubleEllipsisIconComponent } from './double-ellipsis-icon/double-ellipsis-icon.component'
import { IconComponent } from './icon/icon.component'
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component'
import { PageEntityIconComponent } from './page-entity-icon/page-entity-icon.component'
import { PriorityIconComponent } from './priority-icon/priority-icon.component'
import { StatusIconComponent } from './status-icon/status-icon.component'

@NgModule({
    declarations: [
        DoubleEllipsisIconComponent,
        IconComponent,
        LoadingSpinnerComponent,
        PageEntityIconComponent,
        PriorityIconComponent,
        StatusIconComponent,
    ],
    imports: [CommonModule],
    exports: [
        DoubleEllipsisIconComponent,
        IconComponent,
        LoadingSpinnerComponent,
        PageEntityIconComponent,
        PriorityIconComponent,
        StatusIconComponent,
    ],
})
export class IconsModule {}
