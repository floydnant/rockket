import { Component, OnDestroy, OnInit } from '@angular/core'
import { InsightsService } from '../services/insights.service'

@Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit, OnDestroy {
    constructor(private insights: InsightsService /* The insights just need to be initialized somewhere */) {}

    ngOnInit() {
        // @TODO: the user should decide wether the OS context menu should be disabled or not
        document.addEventListener('contextmenu', this.callback)
    }
    ngOnDestroy() {
        document.removeEventListener('contextmenu', this.callback)
    }
    callback = ((e: Event) => e.preventDefault()).bind(this)
}
