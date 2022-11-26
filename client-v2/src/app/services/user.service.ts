import { Injectable } from '@angular/core'
import { HttpService } from '../http/http.service'
import { HttpSuccessResponse } from '../http/types'
import { SignupCredentialsDto, AuthSuccessResponse, LoginCredentialsDto } from '../models/auth.model'

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(private http: HttpService) {}

    ////////////// Auth ////////////////
    signup(credentials: SignupCredentialsDto) {
        return this.http.post<AuthSuccessResponse>('/auth/signup', credentials)
    }
    login(credentials: LoginCredentialsDto) {
        return this.http.post<AuthSuccessResponse>('/auth/login', credentials)
    }
    confirmLogin() {
        return this.http.get<AuthSuccessResponse>('/auth/me')
    }

    getToken() {
        return localStorage.getItem('todo-authToken')
    }
    saveToken(authToken: string) {
        localStorage.setItem('todo-authToken', authToken)
    }
    deleteToken() {
        localStorage.removeItem('todo-authToken')
    }

    ////////////// Account ////////////////
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
