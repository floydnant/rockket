import { Injectable } from '@angular/core'
import { HttpService } from 'src/app/http/http.service'
import { HttpSuccessResponse } from 'src/app/http/types'
import { CreateTaskDto, Task, TaskPreview, UpdateTaskDto } from 'src/app/fullstack-shared-models/task.model'
import { EntityService } from '../entities.service'

@Injectable({
    providedIn: 'root',
})
export class TaskService implements EntityService {
    constructor(private http: HttpService) {}

    create(dto: CreateTaskDto) {
        return this.http.post<Task>('/task', dto)
    }

    update(id: string, dto: UpdateTaskDto) {
        return this.http.patch<Task>('/task/' + id, dto)
    }

    delete(id: string) {
        return this.http.delete<HttpSuccessResponse>('/task/' + id)
    }

    loadDetail(id: string) {
        return this.http.get<Task>('/task/' + id)
    }

    loadRootLevelTasks(listId: string) {
        return this.http.get<TaskPreview[]>(`/list/${listId}/tasks`)
    }
}
