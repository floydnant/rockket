import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { DoubleEllipsisIconComponent } from './double-ellipsis-icon/double-ellipsis-icon.component'
import { IconComponent } from './icon/icon.component'
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component'

@NgModule({
    declarations: [DoubleEllipsisIconComponent, IconComponent, LoadingSpinnerComponent],
    imports: [CommonModule],
    exports: [DoubleEllipsisIconComponent, IconComponent, LoadingSpinnerComponent],
})
export class IconsModule {}
