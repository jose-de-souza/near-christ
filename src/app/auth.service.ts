import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://greatapps4you.us/nearchrist/api/auth/login.php';  // Backend JWT authentication API
  private tokenKey = 'accessToken';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  /** Checks if token exists in localStorage */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /** Observable for login status */
  get isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  /** Logs in user and stores JWT */
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, password }).pipe(
      tap(response => {
        if (response.accessToken) {
          localStorage.setItem(this.tokenKey, response.accessToken);
          this.isLoggedInSubject.next(true);
          this.router.navigate(['/adoration-schedule']);  // Redirect after login
        }
      })
    );
  }

  /** Logs out user */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/']);  // Redirect to home
  }

  /** Retrieves token */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Checks if user is authenticated */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /** Adds JWT token to request headers */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }
}
