import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const snackBar = inject(MatSnackBar);

    // Attach token if present
    const token = authService.getToken();
    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    // Send request, handle errors
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // If the server returns a 403 (forbidden) with JSON body
            if (error.status === 403) {
                // The server’s JSON typically includes { message: "...some text..." }
                const serverMessage = error.error?.message || 'Forbidden';

                // Show a Material snackbar at the top-right
                snackBar.open(serverMessage, 'Close', {
                    duration: 3000,
                    horizontalPosition: 'end',
                    verticalPosition: 'top',
                    panelClass: ['snackbar-error'] // optional custom styling
                });
            }

            // re-throw so calling code can handle if needed
            return throwError(() => error);
        })
    );
};
