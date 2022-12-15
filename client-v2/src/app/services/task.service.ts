import { Injectable } from '@angular/core'
import { HttpService } from '../http/http.service'
import { CreateTasklistDto, TaskList, TasklistPreview } from '../models/task.model'

@Injectable({
    providedIn: 'root',
})
export class TaskService {
    constructor(private http: HttpService) {}

    getListPreviews() {
        return this.http.get<TasklistPreview[]>('/all-lists')
    }

    createTaskList(dto: CreateTasklistDto) {
        return this.http.post<TaskList>('/list', dto)
    }
}
