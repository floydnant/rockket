import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RtEditorComponent } from './rt-editor/rt-editor.component'
import { RtEditorToolbarComponent } from './rt-editor-toolbar/rt-editor-toolbar.component'
import { NgxTiptapModule } from 'ngx-tiptap'
import { IconsModule } from '../components/atoms/icons/icons.module'
import { CdkMenuModule } from '@angular/cdk/menu'
import { KeyboardModule } from '../keyboard/keyboard.module'
import { DropdownModule } from '../dropdown/dropdown.module'
import { TooltipModule } from '../tooltip/tooltip.module'

@NgModule({
    declarations: [RtEditorComponent, RtEditorToolbarComponent],
    imports: [CommonModule, NgxTiptapModule, IconsModule, CdkMenuModule, KeyboardModule, DropdownModule, TooltipModule],
    exports: [RtEditorComponent, RtEditorToolbarComponent],
})
export class RichTextEditorModule {}
