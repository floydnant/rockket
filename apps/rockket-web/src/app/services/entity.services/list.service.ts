import { Injectable } from '@angular/core'
import { CreateTasklistDto, TaskList, UpdateTasklistDto } from '@rockket/commons'
import { HttpService } from '../../http/http.service'
import { HttpSuccessResponse } from '../../http/types'
import { EntityService } from '../entities.service'

@Injectable({
    providedIn: 'root',
})
export class ListService implements EntityService {
    constructor(private http: HttpService) {}

    create(dto: CreateTasklistDto) {
        return this.http.post<TaskList>('/list', dto)
    }

    update(id: string, dto: UpdateTasklistDto) {
        return this.http.patch<TaskList>('/list/' + id, dto)
    }

    delete(id: string) {
        return this.http.delete<HttpSuccessResponse>('/list/' + id)
    }

    loadDetail(id: string) {
        return this.http.get<TaskList>('/list/' + id)
    }
}
