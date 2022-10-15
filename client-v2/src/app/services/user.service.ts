import { Injectable } from '@angular/core'
import { HttpService } from '../http/http.service'
import { AuthSuccessResponse, LoginCredentialsDto, SignupCredentialsDto } from '../store/user/user.model'

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(private http: HttpService) {}

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
}
