import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { TooltipComponent } from './tooltip/tooltip.component'
import { TooltipDirective } from './tooltip.directive'

@NgModule({
    declarations: [TooltipDirective, TooltipComponent],
    imports: [CommonModule],
    exports: [TooltipDirective, TooltipComponent],
})
export class TooltipModule {}
