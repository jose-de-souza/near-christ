import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserDto, UserUpsertDto } from './user.dto';

// Defines the generic API response structure from the backend
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // GET /users - Fetches all users and extracts the data array from the response
  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<ApiResponse<UserDto[]>>(`${this.baseUrl}/users`).pipe(
      map(response => response.data)
    );
  }

  // POST /users - Creates a new user
  createUser(user: UserUpsertDto): Observable<UserDto> {
    return this.http.post<ApiResponse<UserDto>>(`${this.baseUrl}/users`, user).pipe(
      map(response => response.data)
    );
  }

  // PUT /users/{id} - Updates an existing user
  updateUser(id: number, user: UserUpsertDto): Observable<UserDto> {
    return this.http.put<ApiResponse<UserDto>>(`${this.baseUrl}/users/${id}`, user).pipe(
      map(response => response.data)
    );
  }

  // DELETE /users/{id} - Deletes a user
  deleteUser(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/users/${id}`).pipe(
      map(response => response.data)
    );
  }
}
