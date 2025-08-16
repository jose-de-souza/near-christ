import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const snackBar = inject(MatSnackBar);

    // Attach token if present by calling the correct public method
    const token = authService.getToken();
    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    // Send request and handle errors
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // If the server returns a 403 (forbidden)
            if (error.status === 403) {
                const serverMessage = error.error?.message || 'Forbidden: You do not have permission to perform this action.';

                // Show a Material snackbar
                snackBar.open(serverMessage, 'Close', {
                    duration: 5000, // Increased duration for better readability
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    panelClass: ['snackbar-error']
                });
            }

            // Re-throw the error so calling code can handle it if needed
            return throwError(() => error);
        })
    );
};
