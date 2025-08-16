import { Injectable, signal, computed, inject, NgZone, WritableSignal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

// Define the shape of the user info returned on login
interface UserLoginInfo {
  id: number;
  userName: string;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = environment.apiUrl + '/auth/login';
  private _token: WritableSignal<string | null> = signal(null);
  private _userRoles: WritableSignal<string[]> = signal([]);

  public isAuthenticatedSignal: Signal<boolean> = computed(() => !!this._token());
  
  // --- FIX: Added this public property back for the AuthGuard ---
  public isNavigating = false;

  private router = inject(Router);
  private ngZone = inject(NgZone);

  constructor(private http: HttpClient) {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken && this.isValidToken(storedToken)) {
      this._token.set(storedToken);
      this._userRoles.set(this.decodeUserRoles(storedToken));
    } else {
      this.clearAuthState();
    }

    window.addEventListener('storage', (event) => {
      if (event.key === 'jwt_token') {
        const newToken = localStorage.getItem('jwt_token');
        if (!newToken || !this.isValidToken(newToken)) {
          this.logout();
        }
      }
    });
  }

  public getToken(): string | null {
    return this._token();
  }
  
  public isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  public get userRoles(): string[] {
    return this._userRoles();
  }

  public hasRole(role: string): boolean {
    return this._userRoles().includes(role);
  }

  private decodeUserRoles(token: string): string[] {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles ?? []; 
    } catch {
      return [];
    }
  }

  private isValidToken(token: string | null): boolean {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
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

  login(email: string, password: string): Observable<{ accessToken: string, user: UserLoginInfo }> {
    return this.http.post<{ data: { accessToken: string, user: UserLoginInfo } }>(this.API_URL, { email, password })
      .pipe(
        map(res => res.data),
        tap(response => {
          if (!response?.accessToken) {
            console.error('Login failed: No valid token received!');
            return;
          }
          this._token.set(response.accessToken);
          this._userRoles.set(response.user.roles); 
          localStorage.setItem('jwt_token', response.accessToken);

          setTimeout(() => this.router.navigate(['/adoration-schedule']), 200);
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
        this.router.navigate(['/login']).finally(() => {
            this.isNavigating = false;
        });
    });
  }

  private clearAuthState() {
    this._token.set(null);
    this._userRoles.set([]);
    localStorage.removeItem('jwt_token');
  }
}
