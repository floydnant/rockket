import { Injectable } from '@angular/core'
import { HttpService } from '../http/http.service'
import { HttpSuccessResponse } from '../http/types'

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    constructor(private http: HttpService) {}

    updateUsername(dto: { username: string }) {
        return this.http.patch<HttpSuccessResponse>('/user', dto)
    }
    updateEmail(dto: { password: string; email: string }) {
        return this.http.patch<HttpSuccessResponse>('/user/email', dto)
    }
    updatePassword(dto: { password: string; newPassword: string }) {
        return this.http.patch<HttpSuccessResponse>('/user/password', dto)
    }

    deleteAccount(dto: { password: string }) {
        return this.http.delete<HttpSuccessResponse>('/user', { body: dto })
    }

    loadEmail() {
        return this.http.get<{ email: string }>('/user/email')
    }
}
