import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export // Token Interceptor Function
  const tokenInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);
    const token = isPlatformBrowser(platformId) ? localStorage.getItem('token') : null;
    const router = inject(Router);


    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next(req).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401 || error.status === 403) {

          // 🔐 Clear auth
          if (isPlatformBrowser(platformId)) {
            localStorage.clear();
          }

          // 🚪 Redirect to login
          router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  };
