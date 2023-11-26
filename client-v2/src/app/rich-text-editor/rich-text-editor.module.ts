import { CdkMenuModule } from '@angular/cdk/menu'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { NgxTiptapModule } from 'ngx-tiptap'
import { IconsModule } from '../components/atoms/icons/icons.module'
import { DropdownModule } from '../dropdown/dropdown.module'
import { KeyboardModule } from '../keyboard/keyboard.module'
import { RxModule } from '../rx/rx.module'
import { TooltipModule } from '../tooltip/tooltip.module'
import { TipTapEditorToolbarComponent } from './tip-tap-editor-toolbar/tip-tap-editor-toolbar.component'
import { TipTapEditorComponent } from './tip-tap-editor/tip-tap-editor.component'

@NgModule({
    declarations: [TipTapEditorComponent, TipTapEditorToolbarComponent],
    imports: [
        CommonModule,
        RxModule,
        NgxTiptapModule,
        IconsModule,
        CdkMenuModule,
        KeyboardModule,
        DropdownModule,
        TooltipModule,
    ],
    exports: [TipTapEditorComponent, TipTapEditorToolbarComponent],
})
export class RichTextEditorModule {}
