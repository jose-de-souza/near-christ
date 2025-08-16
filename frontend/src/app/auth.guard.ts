import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // FIX: Call the public isAuthenticated() method
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      // Redirect to login page if not authenticated
      if (!this.authService.isNavigating) { // Avoid duplicate navigation
        this.router.navigate(['/login']);
      }
      return false;
    }
  }
}
