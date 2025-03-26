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
  public _isAuthenticated = signal<boolean>(false);
  public isNavigating = false;

  // NEW: Store the user role from JWT (ADMIN, SUPERVISOR, STANDARD, etc.)
  private _userRole = signal<string | null>(null);

  private router = inject(Router);
  private ngZone = inject(NgZone);

  constructor(private http: HttpClient) {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken && this.isValidToken(storedToken)) {
      this._token.set(storedToken);
      this._isAuthenticated.set(true);
      // On init, parse the token to get role
      this._userRole.set(this.decodeUserRole(storedToken));
    } else {
      this._token.set(null);
      this._isAuthenticated.set(false);
      localStorage.removeItem('jwt_token');
    }

    // Whenever _token changes, re-check validity & decode role
    effect(() => {
      const token = this._token();
      const valid = this.isValidToken(token);
      this._isAuthenticated.set(valid);

      if (valid && token) {
        this._userRole.set(this.decodeUserRole(token));
      } else {
        this._userRole.set(null);
      }
    });

    // Listen for storage changes (token removed in another tab, etc.)
    window.addEventListener('storage', () => {
      const newToken = localStorage.getItem('jwt_token');

      if (!newToken || !this.isValidToken(newToken)) {
        this.logout();
        this.ngZone.run(() => {
          this.router.navigate(['/login']);
        });
      }
    });
  }

  // ---------- PUBLIC GETTERS ----------

  getToken(): string | null {
    return this._token();
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated();
  }

  // Let components do `auth.userRole === 'ADMIN'` or whatever
  get userRole(): string | null {
    return this._userRole();
  }

  // ---------- TOKEN VALIDATION & DECODING ----------

  private decodeUserRole(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ?? null;  // e.g. "ADMIN", "SUPERVISOR", etc.
    } catch {
      return null;
    }
  }

  isValidToken(token: string | null): boolean {
    if (!token) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // decode
      const expiry = payload.exp;
      if (!expiry || Date.now() >= expiry * 1000) {
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // ---------- LOGIN / LOGOUT ----------

  login(email: string, password: string): Observable<{ accessToken: string }> {
    return this.http.post<{ data: { accessToken: string } }>(this.API_URL, { email, password })
      .pipe(
        map((res) => {
          return { accessToken: res.data?.accessToken };
        }),
        tap((response) => {
          if (!response.accessToken || response.accessToken === 'undefined') {
            console.error('Login failed: No valid token received!');
            return;
          }
          // Store token
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
      return;
    }
    this.isNavigating = true;

    this.ngZone.run(() => {
      this.router.navigateByUrl('/').then(() => {
        this.router.navigate(['/adoration-query']).finally(() => {
          this.isNavigating = false;
        });
      });
    });
  }

  private clearAuthState() {
    this._token.set(null);
    this._isAuthenticated.set(false);
    this._userRole.set(null);
    localStorage.removeItem('jwt_token');
  }
}
