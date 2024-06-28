import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { diffHtmlContent } from './diff.utils'
import { joinConsecutiveTags, removeTags } from './diff.utils'

@Component({
    selector: 'app-diff',
    templateUrl: './diff.component.html',
    styleUrls: ['./diff.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class DiffComponent {
    @Input({ required: true }) leftContent!: string
    @Input({ required: true }) rightContent!: string

    // @TODO: Make these user configurable
    @Input() layout: 'inline' | 'side-by-side' | 'stacked' = 'side-by-side'
    @Input() showPanelsWithoutChanges = false
    @Input() showUnchangedPanelPlaceholder = true

    get isSeparated() {
        return this.layout === 'stacked' || this.layout === 'side-by-side'
    }
    get diff() {
        const html = diffHtmlContent(this.leftContent, this.rightContent)

        return {
            html,
            get deletionsOnly() {
                return (
                    `<span class="sr-only">Before:</span>` +
                    joinConsecutiveTags(removeTags(html, 'ins'), 'del')
                )
            },
            get insertionsOnly() {
                return (
                    `<span class="sr-only">After:</span>` +
                    joinConsecutiveTags(removeTags(html, 'del'), 'ins')
                )
            },
            hasDeletions: html.includes('<del'),
            hasInsertions: html.includes('<ins'),
        }
    }
}
