import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

export type TabOptions<TTabName extends string = string> = {
    label: string
    exactMatch?: boolean
} & (
    | {
          path: string
      }
    | {
          onClick: (event: MouseEvent) => void
          tabId: TTabName
      }
)

@Component({
    selector: 'app-tab-bar',
    templateUrl: './tab-bar.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabBarComponent<TTabName extends string> {
    @Input({ required: true }) tabs!: TabOptions<TTabName>[]
    @Input() transparentBackground = true
    @Input() activeTabId?: TTabName

    asLink(tab: TabOptions) {
        if ('path' in tab) {
            return tab
        }

        return false as const
    }
    asButton(tab: TabOptions) {
        if ('onClick' in tab) {
            return tab
        }

        return false as const
    }
}
