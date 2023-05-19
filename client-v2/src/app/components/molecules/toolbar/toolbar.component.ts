import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'
import { Subject, switchMap, timer, map, of, startWith } from 'rxjs'

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.hide]': 'hideToolbar',
    },
})
export class ToolbarComponent {
    @Input() set hide(hideToolbar: boolean) {
        this.hideToolbar = hideToolbar
        this.hideToolbar$.next(hideToolbar)
    }
    hideToolbar$ = new Subject<boolean>()

    hideToolbar = false
    showToolbar$ = this.hideToolbar$.pipe(
        startWith(false),
        switchMap(hidden => {
            if (hidden) return timer(150).pipe(map(() => false))
            return of(true)
        })
    )
}
