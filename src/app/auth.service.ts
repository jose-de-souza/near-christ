import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = false;

  login() {
    // Actual logic for auth would go here
    this.isLoggedIn = true;
  }

  logout() {
    this.isLoggedIn = false;
  }
}
