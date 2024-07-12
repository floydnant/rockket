import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CommandPaletteComponent } from './command-palette.component'
import { SearchPickerComponent } from './search-picker/search-picker.component'
import { IconsModule } from '../components/atoms/icons/icons.module'
import { RxModule } from '../rx/rx.module'
import { FocusableModule } from '../focusable/focusable.module'

@NgModule({
    declarations: [CommandPaletteComponent, SearchPickerComponent],
    imports: [CommonModule, IconsModule, RxModule, FocusableModule],
    exports: [CommandPaletteComponent, SearchPickerComponent],
})
export class CommandPaletteModule {}
