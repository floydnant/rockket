import { Injectable } from '@angular/core'
import { HttpService } from '../http/http.service'
import { HttpSuccessResponse } from '../http/types'
import { CreateTasklistDto, TaskList, UpdateTasklistDto } from '../models/task.model'

@Injectable({
    providedIn: 'root',
})
export class ListService {
    constructor(private http: HttpService) {}

    createTaskList(dto: CreateTasklistDto) {
        return this.http.post<TaskList>('/list', dto)
    }

    updateTaskList(id: string, dto: UpdateTasklistDto) {
        return this.http.patch('/list/' + id, dto)
    }

    deleteTaskList(id: string) {
        return this.http.delete<HttpSuccessResponse>('/list/' + id)
    }
}
