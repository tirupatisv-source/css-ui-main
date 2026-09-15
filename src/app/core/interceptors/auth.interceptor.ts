import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { switchMap, take } from 'rxjs/operators';

/**
 * HTTP interceptor – attaches Azure AD Bearer token to all outgoing API requests.
 * Replaces VB6 session-based authentication with OAuth2 tokens.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // For MSAL-based auth, the token is acquired from Azure AD via MSAL service
  return auth.getToken().pipe(
    take(1),
    switchMap(token => {
      if (token) {
        const cloned = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next(cloned);
      }
      return next(req);
    })
  );
};

