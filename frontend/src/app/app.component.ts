import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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

  // Using functional injection for the Router, with a small hack to avoid TS error
  private router = inject<Router>(Router as never);

  constructor(public auth: AuthService) { }

  login() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.auth.logout();
  }
}
