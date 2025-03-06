import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    // console.log('Checking authentication in AuthGuard...');

    if (this.authService._isAuthenticated()) {
    //   console.log('✅ Access granted! Token is valid.');
      return true;
    } else {
    //   console.log('❌ Token expired or removed! Redirecting to /login');

      if (!this.authService.isNavigating) { // ✅ Avoid duplicate redirects
        this.authService.logout();
      }

      return false;
    }
  }
}
