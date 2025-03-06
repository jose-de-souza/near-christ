import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) { }

  private API_URL = 'https://greatapps4you.us/nearchrist/api/auth/login.php';  // Backend JWT authentication API
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken()); // Create a BehaviorSubject to track login status
  isLoggedIn$ = this.isLoggedInSubject.asObservable(); // Expose login status as an observable

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ accessToken: string; user: any }>(this.API_URL, { email, password }).pipe(
      tap(response => {
        if (response.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.isLoggedInSubject.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.status === 401) {
      errorMessage = 'Invalid email or password';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server error ${error.status}: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  logout() {
    localStorage.removeItem('accessToken'); // Remove token
    this.isLoggedInSubject.next(false); // Update login status
    this.router.navigate(['/']); // Redirect to home
  }
}
