import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MsalService } from '@azure/msal-angular';

/**
 * Route guard – allows only users with DATA_ADMIN or USER_ADMIN roles from Azure AD.
 * Converted from VB6: frmAdmMenu enabled checks.
 * Uses roles returned from Azure AD token / backend role mapping.
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const msalService = inject(MsalService);
  const router = inject(Router);

  // Check if user is authenticated via MSAL
  if (msalService.instance.getAllAccounts().length === 0) {
    return router.createUrlTree(['/login']);
  }

  // Check if user has admin roles
  if (auth.hasRole('dataAdmin') || auth.hasRole('userAdmin')) {
    return true;
  }

  // If not authorized, redirect to projects
  return router.createUrlTree(['/home']);
};

