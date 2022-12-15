import { Injectable } from '@angular/core'
import { HttpService } from '../http/http.service'
import { TasklistPreview } from '../models/task.model'

@Injectable({
    providedIn: 'root',
})
export class TaskService {
    constructor(private http: HttpService) {}

    getRootListPreviews() {
        return this.http.get<TasklistPreview[]>('/all-lists')
    }
}
