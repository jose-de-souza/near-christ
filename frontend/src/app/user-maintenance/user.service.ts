import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Define the shape of a User as returned by your API
export interface User {
    userId: number;
    userName: string;
    userEmail: string;
    userRole: 'ADMIN' | 'SUPERVISOR' | 'STANDARD';
    userPassword?: string; // Only needed for creation/updates
}

// Define the shape of the entire server response:
// { success, status, message, data: ... }
export interface GetUsersResponse {
    success: boolean;
    status: number;
    message: string;
    data: User[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
    // Typically you’d pull this from environment.ts. For now, local dev:
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // GET /users
    getAllUsers(): Observable<GetUsersResponse> {
        return this.http.get<GetUsersResponse>(`${this.baseUrl}/users`);
    }

    // POST /users
    createUser(user: Partial<User>): Observable<GetUsersResponse> {
        // Create a shallow copy of user
        const payload = { ...user };
        // Remove userId if it exists, so it's not sent on creation.
        delete payload.userId;
        return this.http.post<GetUsersResponse>(`${this.baseUrl}/users`, payload);
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
