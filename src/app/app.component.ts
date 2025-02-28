import { Component } from '@angular/core';
import { AdorationScheduleComponent } from './adoration-schedule/adoration-schedule.component';
import { DioceseMaintenanceComponent } from "./diocese-maintenance/diocese-maintenance.component";
import { ParishMaintenanceComponent } from "./parish-maintenance/parish-maintenance.component";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,  // This is optional depending on your setup, but useful if using standalone components
  imports: [
    AdorationScheduleComponent, 
    DioceseMaintenanceComponent,
    ParishMaintenanceComponent
  ]
})

export class AppComponent {
  title = 'National Eucharistic Adoration and Rosary Crusade';
}
