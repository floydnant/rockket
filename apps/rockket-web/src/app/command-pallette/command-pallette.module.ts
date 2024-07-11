import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CommandPalletteComponent } from './command-pallette.component'
import { SearchPickerComponent } from './search-picker/search-picker.component'
import { IconsModule } from '../components/atoms/icons/icons.module'
import { RxModule } from '../rx/rx.module'
import { FocusableModule } from '../focusable/focusable.module'

@NgModule({
    declarations: [CommandPalletteComponent, SearchPickerComponent],
    imports: [CommonModule, IconsModule, RxModule, FocusableModule],
    exports: [CommandPalletteComponent, SearchPickerComponent],
})
export class CommandPalletteModule {}
