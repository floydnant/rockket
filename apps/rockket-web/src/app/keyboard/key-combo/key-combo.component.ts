import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { parseBindingInput } from './combos'
import { DeviceService } from 'src/app/services/device.service'

@Component({
    selector: 'app-key-combo',
    template: `
        <span class="inline-flex items-center gap-0.5" *ngIf="!(isTouch$ | push)">
            <ng-container #combo *ngFor="let combo of parsedCombos; let isLast = last">
                <kbd *ngFor="let comboKey of combo" class="font-[helvetica]">{{ comboKey.key }}</kbd>
                <span *ngIf="!isLast" class="px-1 text-tinted-400">then</span>
            </ng-container>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyComboComponent {
    isTouch$ = inject(DeviceService).isTouchPrimary$

    @Input() combo!: string

    get parsedCombos() {
        return parseBindingInput(this.combo).combos
    }
}
