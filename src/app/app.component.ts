import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'NEAR CHRIST';

  constructor(public auth: AuthService, private router: Router) {}

  login() {
    this.auth.login();
    // Redirect to Adoration Schedule after logging in
    this.router.navigate(['/adoration-schedule']);
  }

  logout() {
    this.auth.logout();
    // Redirect to home page on logout
    this.router.navigate(['/']);
  }
}
