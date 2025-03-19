import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
    UserID: number;
    UserName: string;
    UserEmail: string;
    UserRole: 'ADMIN' | 'SUPERVISOR' | 'STANDARD';
    UserPassword?: string; // hashed or plaintext if new
}

export interface GetUsersResponse {
    success: boolean;
    status: number;
    message: string;
    data: User[];  // The actual array of users
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private baseUrl = 'http://localhost:8000'; // or from environment

    constructor(private http: HttpClient) { }

    // GET /users
    // Return the entire JSON object (with .data array)
    getAllUsers(): Observable<GetUsersResponse> {
        return this.http.get<GetUsersResponse>(`${this.baseUrl}/users`);
    }

    // POST /users
    createUser(user: Partial<User>): Observable<GetUsersResponse> {
        return this.http.post<GetUsersResponse>(`${this.baseUrl}/users`, user);
    }

    // PUT /users/{id}
    updateUser(id: number, user: Partial<User>): Observable<GetUsersResponse> {
        return this.http.put<GetUsersResponse>(`${this.baseUrl}/users/${id}`, user);
    }

    // DELETE /users/{id}
    deleteUser(id: number): Observable<GetUsersResponse> {
        return this.http.delete<GetUsersResponse>(`${this.baseUrl}/users/${id}`);
    }
}
