import { Injectable } from '@angular/core'
import { HttpService } from '../http/http.service'
import { SignupCredentialsDto, LoginCredentialsDto } from '../fullstack-shared-models/auth.model'
import { AuthSuccessResponse } from '../shared/models'
import { StorageItem } from '../utils/storage.helpers'

@Injectable({
    providedIn: 'root',
})
export class AuthService {
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

    private token = new StorageItem<string>('rockket-auth-token', { oldKey: 'todo-authToken' })
    getToken() {
        return this.token.value
    }
    saveToken(authToken: string) {
        this.token.value = authToken
    }
    deleteToken() {
        this.token.remove()
    }
}
