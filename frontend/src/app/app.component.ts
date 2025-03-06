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
  isLoggedIn$ = false;

  constructor(public auth: AuthService, private router: Router) { }

  login() {
    // Redirect to Adoration Schedule after logging in
    this.router.navigate(['/login']);
  }


  // ngOnInit() {
  //   // ✅ Subscribe to login status
  //   this.auth.isLoggedIn$.subscribe((status) => {
  //     this.isLoggedIn$ = status;
  //   });
  // }

  logout() {
    this.auth.logout();
  }
}

