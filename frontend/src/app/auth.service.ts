import { Injectable, signal, computed, inject, effect, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = environment.apiUrl + '/auth/login';  // Backend JWT authentication API
  private _token = signal<string | null>(null);
  public _isAuthenticated = signal<boolean>(false); // 🔥 Converted to a reactive signal
  public isNavigating = false; // 🔥 Prevent multiple redirects

  private router = inject(Router); // Ensure Router is properly injected
  private ngZone = inject(NgZone);

  constructor(private http: HttpClient) {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken && this.isValidToken(storedToken)) {
      this._token.set(storedToken);
      this._isAuthenticated.set(true);
    } else {
      this._token.set(null);
      this._isAuthenticated.set(false);
      localStorage.removeItem('jwt_token');
    }

    // 🔥 Ensure _isAuthenticated updates whenever the token changes
    effect(() => {
      this._isAuthenticated.set(this.isValidToken(this._token()));
    });

    // 🔥 Listen for storage changes and ensure navigation happens in Angular Zone
    window.addEventListener('storage', () => {
      // console.warn('Storage change detected! Checking token validity...');
      const newToken = localStorage.getItem('jwt_token');

      if (!newToken || !this.isValidToken(newToken)) {
        // console.warn('Token removed or expired! Logging out...');
        this.logout();

        // 🔥 Ensure navigation happens inside Angular Zone
        this.ngZone.run(() => {
          // console.log('🔄 Redirecting to /login due to token removal');
          this.router.navigate(['/login']);
        });
      }
    });
  }

  getToken(): string | null {
    return this._token();
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated();
  }

  isValidToken(token: string | null): boolean {
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      const expiry = payload.exp;

      if (!expiry || Date.now() >= expiry * 1000) {
        // console.warn('JWT token expired or invalid. Removing...');
        this.logout(); // 🔥 Ensure logout happens on invalid tokens
        return false;
      }

      return true;
    } catch (error) {
      // console.error('Error parsing JWT:', error);
      this.logout(); // 🔥 Ensure logout happens on invalid tokens
      return false;
    }
  }

  // We expect { accessToken: string } once we've extracted it from "res.data.accessToken"
  login(email: string, password: string): Observable<{ accessToken: string }> {
    // 1) Request type says "res" has a "data" field with "accessToken"
    return this.http.post<{ data: { accessToken: string } }>(
      this.API_URL,
      { email, password }
    ).pipe(
      // 2) Transform the actual response => shape { accessToken: string }
      map((res) => {
        // If res.data or res.data.accessToken is missing, we can handle it here
        return { accessToken: res.data?.accessToken };
      }),

      tap((response) => {
        if (!response.accessToken || response.accessToken === 'undefined') {
          console.error('Login failed: No valid token received!');
          return;
        }

        // Token handling
        this._token.set(response.accessToken);
        this._isAuthenticated.set(true);
        localStorage.setItem('jwt_token', response.accessToken);

        // Optional small delay before navigation
        setTimeout(() => {
          this.router.navigate(['/adoration-schedule']);
        }, 200);
      })
    );
  }

  logout() {
    this.clearAuthState();

    if (this.isNavigating) {
      // console.log('🚫 Preventing duplicate navigation to /login');
      return;
    }

    this.isNavigating = true;

    this.ngZone.run(() => {
      // console.log('🔄 Redirecting to /login after logout');

      //  Reset Angular router state before navigating to /login
      this.router.navigateByUrl('/').then(() => {
        this.router.navigate(['/login']).finally(() => {
          this.isNavigating = false; //  Allow future navigation
        });
      });
    });
  }

  private clearAuthState() {
    this._token.set(null);
    this._isAuthenticated.set(false);
    localStorage.removeItem('jwt_token');
  }
}
