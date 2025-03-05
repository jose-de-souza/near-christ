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

  // Create a BehaviorSubject to track login status
  private isLoggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('accessToken'));

  // Expose login status as an observable
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  login(email: string, password: string): Observable<any> {
    return new Observable((observer) => {
      this.http.post<any>(this.apiUrl, { email, password }).subscribe({
        next: (response) => {
          localStorage.setItem('accessToken', response.accessToken);
          this.isLoggedInSubject.next(true); // Update login status
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  logout() {
    localStorage.removeItem('accessToken'); // Remove token
    this.isLoggedInSubject.next(false); // Update login status
    this.router.navigate(['/']); // Redirect to home
  }
}
