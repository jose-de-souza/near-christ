import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
    <div class="home-container">
      <h2>Welcome to the Home Page</h2>
      <p>Please log in to access the features.</p>
    </div>
  `
})
export class HomeComponent {}
