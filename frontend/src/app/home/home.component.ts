import { Component } from '@angular/core';
import { AdorationQueryComponent } from '../adoration-query/adoration-query.component';

@Component({
  imports: [AdorationQueryComponent],
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent { }