import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ResizeHandleComponent } from './resize-handle.component'
import { ResizeDirective } from './resize.directive'

@NgModule({
    declarations: [ResizeDirective, ResizeHandleComponent],
    imports: [CommonModule],
    exports: [ResizeDirective, ResizeHandleComponent],
})
export class ResizeModule {}
