import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './auth.guard';

// Feature components
import { AdorationScheduleComponent } from './adoration-schedule/adoration-schedule.component';
import { DioceseMaintenanceComponent } from './diocese-maintenance/diocese-maintenance.component';
import { ParishMaintenanceComponent } from './parish-maintenance/parish-maintenance.component';
import { RosaryCrusadeComponent } from './rosary-crusade/rosary-crusade.component';
import { AdorationQueryComponent } from './adoration-query/adoration-query.component';
import { CrusadeQueryComponent } from './crusade-query/crusade-query.component';

export const appRoutes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'adoration-query', component: AdorationQueryComponent },
  { path: 'crusade-query', component: CrusadeQueryComponent }, 

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
