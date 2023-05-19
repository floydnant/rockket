import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { KeyComboComponent } from './key-combo/key-combo.component'

@NgModule({
    declarations: [KeyComboComponent],
    imports: [CommonModule],
    exports: [KeyComboComponent],
})
export class KeyboardModule {}
