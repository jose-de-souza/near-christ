import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';

// Feature components
import { AdorationScheduleComponent } from './adoration-schedule/adoration-schedule.component';
import { DioceseMaintenanceComponent } from './diocese-maintenance/diocese-maintenance.component';
import { ParishMaintenanceComponent } from './parish-maintenance/parish-maintenance.component';
import { RosaryCrusadeComponent } from './rosary-crusade/rosary-crusade.component';

export const appRoutes: Routes = [
  // The main layout is in AppComponent, so no route for it
  { path: '', component: HomeComponent }, // Public home
  {
    path: 'adoration-schedule',
    component: AdorationScheduleComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'diocese-maintenance',
    component: DioceseMaintenanceComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'parish-maintenance',
    component: ParishMaintenanceComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'rosary-crusade',
    component: RosaryCrusadeComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];
