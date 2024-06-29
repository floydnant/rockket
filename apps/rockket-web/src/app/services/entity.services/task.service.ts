import { Injectable } from '@angular/core'
import {
    CreateTaskDto,
    CreateTaskResponse,
    EntityEvent,
    Task,
    TaskDetail,
    UpdateTaskDto,
    UpdateTaskResponse,
    createTaskResponseSchema,
    entityEventSchema,
    fnNames,
    taskSchema,
    updateTaskResponseSchema,
} from '@rockket/commons'
import { Observable, of } from 'rxjs'
import { HttpService } from 'src/app/http/http.service'
import { parseWith } from 'src/app/http/http.utils'
import { HttpSuccessResponse } from 'src/app/http/types'
import { EntityService } from '../entities.service'

@Injectable({
    providedIn: 'root',
})
export class TaskService implements EntityService {
    constructor(private http: HttpService) {}

    create(dto: CreateTaskDto): Observable<CreateTaskResponse> {
        return this.http
            .post('/task', dto)
            .pipe(parseWith(createTaskResponseSchema, fnNames(TaskService, this.create)))
    }

    update(id: string, dto: UpdateTaskDto): Observable<UpdateTaskResponse> {
        return this.http
            .patch('/task/' + id, dto)
            .pipe(parseWith(updateTaskResponseSchema, fnNames(TaskService, this.update)))
    }

    delete(id: string): Observable<HttpSuccessResponse> {
        return this.http.delete('/task/' + id)
    }

    // Noop for now
    loadDetail(_id: string): Observable<TaskDetail> {
        return of({})
    }
    loadEvents(id: string): Observable<EntityEvent[]> {
        return this.http
            .get('/task/' + id + '/events')
            .pipe(parseWith(entityEventSchema.array(), fnNames(TaskService, this.loadEvents)))
    }

    loadRootLevelTasks(listId: string): Observable<Task[]> {
        return this.http
            .get(`/list/${listId}/tasks`)
            .pipe(parseWith(taskSchema.array(), fnNames(TaskService, this.loadRootLevelTasks)))
    }

    loadAllTaskPreviews(): Observable<Task[]> {
        return this.http
            .get(`/task/previews`)
            .pipe(parseWith(taskSchema.array(), fnNames(TaskService, this.loadAllTaskPreviews)))
    }
}
