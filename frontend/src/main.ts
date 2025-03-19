import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { authInterceptor } from './app/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    // Provide Angular animations (required for Angular Material)
    importProvidersFrom(BrowserAnimationsModule),

    // Provide the Material SnackBar module
    importProvidersFrom(MatSnackBarModule),

    // Provide the router
    provideRouter(appRoutes),

    // Provide HttpClient with your custom interceptor
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ],
}).catch((err) => console.error(err));
