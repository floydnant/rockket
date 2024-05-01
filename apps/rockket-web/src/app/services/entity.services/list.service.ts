import { Injectable } from '@angular/core'
import {
    CreateTasklistDto,
    CreateTasklistResponse,
    Tasklist,
    UpdateTasklistDto,
    UpdateTasklistResponse,
    createTasklistResponseSchema,
    fnNames,
    updateTasklistResponseSchema,
} from '@rockket/commons'
import { Observable } from 'rxjs'
import { parseWith } from 'src/app/http/http.utils'
import { HttpService } from '../../http/http.service'
import { HttpSuccessResponse } from '../../http/types'
import { EntityService } from '../entities.service'

@Injectable({
    providedIn: 'root',
})
export class ListService implements EntityService {
    constructor(private http: HttpService) {}

    create(dto: CreateTasklistDto): Observable<CreateTasklistResponse> {
        return this.http
            .post('/list', dto)
            .pipe(parseWith(createTasklistResponseSchema, fnNames(ListService, this.create)))
    }

    update(id: string, dto: UpdateTasklistDto): Observable<UpdateTasklistResponse> {
        return this.http
            .patch('/list/' + id, dto)
            .pipe(parseWith(updateTasklistResponseSchema, fnNames(ListService, this.update)))
    }

    delete(id: string) {
        return this.http.delete<HttpSuccessResponse>('/list/' + id)
    }

    loadDetail(id: string): Observable<Tasklist> {
        return this.http.get('/list/' + id) //.pipe(parseWith(tasklistSchema, fnNames(ListService, this.loadDetail)))
    }
}
