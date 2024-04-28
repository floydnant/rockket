import { Injectable } from '@angular/core'
import { CreateTaskDto, Task, UpdateTaskDto, taskSchema } from '@rockket/commons'
import { Observable } from 'rxjs'
import { HttpService } from 'src/app/http/http.service'
import { validateWith } from 'src/app/http/http.utils'
import { HttpSuccessResponse } from 'src/app/http/types'
import { EntityService } from '../entities.service'
import { fnContext } from '../../../../../../packages/commons/src/utils/string.utils'

@Injectable({
    providedIn: 'root',
})
export class TaskService implements EntityService {
    constructor(private http: HttpService) {}

    create(dto: CreateTaskDto): Observable<Task> {
        return this.http
            .post('/task', dto)
            .pipe(validateWith(taskSchema, fnContext(TaskService, this.create)))
    }

    update(id: string, dto: UpdateTaskDto): Observable<Task> {
        return this.http
            .patch('/task/' + id, dto)
            .pipe(validateWith(taskSchema, fnContext(TaskService, this.update)))
    }

    delete(id: string) {
        return this.http.delete<HttpSuccessResponse>('/task/' + id)
    }

    loadDetail(id: string): Observable<Task> {
        return this.http
            .get('/task/' + id)
            .pipe(validateWith(taskSchema, fnContext(TaskService, this.loadDetail)))
    }

    loadRootLevelTasks(listId: string): Observable<Task[]> {
        return this.http
            .get(`/list/${listId}/tasks`)
            .pipe(validateWith(taskSchema.array(), fnContext(TaskService, this.loadRootLevelTasks)))
    }

    loadAllTaskPreviews(): Observable<Task[]> {
        return this.http
            .get(`/task/previews`)
            .pipe(validateWith(taskSchema.array(), fnContext(TaskService, this.loadAllTaskPreviews)))
    }
}
