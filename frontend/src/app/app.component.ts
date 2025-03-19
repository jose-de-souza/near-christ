import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  // Only import what you actually need here (CommonModule, RouterModule, etc.)
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'NEAR CHRIST';
  isLoggedIn$ = false;

  constructor(public auth: AuthService, private router: Router) { }

  login() {
    // e.g., navigate to /login
    this.router.navigate(['/login']);
  }

  logout() {
    this.auth.logout();
  }
}
