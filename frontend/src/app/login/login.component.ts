import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  private router = inject(Router); // Ensure Router is properly injected

  constructor(private auth: AuthService) { }

  onLogin() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/adoration-schedule']);
      },
      error: () => {
        this.errorMessage = 'Invalid credentials. Please try again.';
      },
    });
  }
}