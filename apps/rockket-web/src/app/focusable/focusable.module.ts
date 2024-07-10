import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FocusableDirective } from './focusable.directive'

@NgModule({
    declarations: [FocusableDirective],
    imports: [CommonModule],
    exports: [FocusableDirective],
})
export class FocusableModule {}
