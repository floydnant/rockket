import { Injectable } from '@angular/core'
import { LoginDto, SignupDto } from '@rockket/commons'
import { HttpService } from '../http/http.service'
import { AuthSuccessResponse } from '../shared/models'
import { StorageItem } from '../utils/storage.helpers'

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private http: HttpService) {}

    signup(credentials: SignupDto) {
        return this.http.post<AuthSuccessResponse>('/auth/signup', credentials)
    }
    login(credentials: LoginDto) {
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
        this.token.flush()
    }
    deleteToken() {
        this.token.remove()
    }
}
