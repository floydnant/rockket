import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { parseBindingInput } from './combos'

@Component({
    selector: 'app-key-combo',
    template: `
        <span class="ml-2 -mr-1 inline-flex items-center gap-0.5">
            <ng-container #combo *ngFor="let combo of parsedCombos; let isLast = last">
                <kbd *ngFor="let comboKey of combo" class="font-[helvetica]">{{ comboKey.key }}</kbd>
                <span *ngIf="!isLast" class="px-1 text-tinted-400">then</span>
            </ng-container>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyComboComponent {
    @Input() combo!: string

    get parsedCombos() {
        return parseBindingInput(this.combo).combos
    }
}
