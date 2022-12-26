import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Store } from '@ngrx/store'
import { AppState } from 'src/app/store'
import { listActions } from 'src/app/store/entities/entities.actions'

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
    constructor(private store: Store<AppState>) {}

    createNewTasklist() {
        this.store.dispatch(listActions.createTaskList({}))
    }
}
