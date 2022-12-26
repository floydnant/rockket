import { Injectable } from '@angular/core'
import { HttpService } from '../http/http.service'
import { TasklistPreview } from '../models/task.model'

@Injectable({
    providedIn: 'root',
})
export class EntitiesService {
    constructor(private http: HttpService) {}

    getEntityPreviews() {
        return this.http.get<TasklistPreview[]>('/all-lists')
    }
}
