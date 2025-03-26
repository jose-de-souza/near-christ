import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

import { DioceseMaintenanceComponent } from './diocese-maintenance/diocese-maintenance.component';
import { ParishMaintenanceComponent } from './parish-maintenance/parish-maintenance.component';
import { RosaryCrusadeComponent } from './rosary-crusade/rosary-crusade.component';
import { AdorationQueryComponent } from './adoration-query/adoration-query.component';
import { CrusadeQueryComponent } from './crusade-query/crusade-query.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'adoration-query', pathMatch: 'full' },
  { path: 'adoration-query', component: AdorationQueryComponent },
  { path: 'crusade-query', component: CrusadeQueryComponent },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'adoration-schedule',
    loadComponent: () =>
      import('./adoration-schedule/adoration-schedule.component').then(
        m => m.AdorationScheduleComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'diocese-maintenance',
    component: DioceseMaintenanceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'parish-maintenance',
    component: ParishMaintenanceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'rosary-crusade',
    component: RosaryCrusadeComponent,
    canActivate: [AuthGuard],
  },

  // NEW => lazy-load the UserMaintenanceComponent
  {
    path: 'user-maintenance',
    loadComponent: () =>
      import('./user-maintenance/user-maintenance.component').then(
        m => m.UserMaintenanceComponent
      ),
    canActivate: [AuthGuard], // must be logged in
  },

  { path: '**', redirectTo: 'login' },
];
