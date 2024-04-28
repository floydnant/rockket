import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    Optional,
    TemplateRef,
    ViewEncapsulation,
} from '@angular/core'
import { InjectionToken } from '@angular/core'

export type TooltipData = TemplateRef<void> | string
export const TOOLTIP_DATA = new InjectionToken<TooltipData>('tooltip.data')

@Component({
    selector: 'app-tooltip',
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.component.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    // eslint-disable-next-line @angular-eslint/no-host-metadata-property
    host: {
        'data-test-name': 'tooltip',
    },
})
export class TooltipComponent {
    constructor(@Optional() @Inject(TOOLTIP_DATA) public tooltipData?: TooltipData) {}

    get asString(): string | false {
        return typeof this.tooltipData === 'string' ? this.tooltipData : false
    }

    get asTemplate(): TemplateRef<void> | false {
        return this.tooltipData instanceof TemplateRef ? this.tooltipData : false
    }
}
