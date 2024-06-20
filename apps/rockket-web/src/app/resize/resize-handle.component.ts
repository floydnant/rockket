import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { ResizeStrategy } from './resize.directive'

@Component({
    selector: 'app-resize-handle',
    template: `
        <div
            class="handle-hitbox | group absolute z-[1000] h-full w-4 cursor-col-resize"
            [class.-left-2]="side == 'left'"
            [class.-right-2]="side == 'right'"
            [appResize]="resizeElement"
            [resizeStrategy]="side"
            [minSize]="minSize"
            [maxSize]="maxSize"
            #resize="appResize"
            (resizing)="resizing.emit($event)"
            (resizeEnd)="resizeEnd.emit($event)"
            data-test-name="resize-handle"
        >
            <div
                class="group-hover:bg-tinted-400 group-[.isResizing]:bg-tinted-400 relative left-[50%] h-full w-0.5 translate-x-[-50%] transition-colors delay-75"
            ></div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResizeHandleComponent {
    @Input({ required: true }) side!: ResizeStrategy
    @Input({ required: true }) resizeElement!: HTMLElement
    @Input() minSize?: number
    @Input() maxSize?: number

    @Output() resizing = new EventEmitter<number>()
    @Output() resizeEnd = new EventEmitter<number>()
}
