import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MsalService } from '@azure/msal-angular';

/**
 * Route guard – redirects unauthenticated users to Azure AD login.
 * Converted from VB6: frmLogin gating logic.
 * Replaces VB6 LDAP with Azure AD SSO.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const msalService = inject(MsalService);
  const router = inject(Router);

  // Check if user is logged in via MSAL
  const accounts = msalService.instance.getAllAccounts();
  const isLoggedIn = auth.isLoggedIn();
  
  console.log('[AuthGuard] Checking auth - accounts:', accounts.length, 'isLoggedIn:', isLoggedIn);
  
  if (accounts.length > 0 && isLoggedIn) {
    console.log('[AuthGuard] Access granted');
    return true;
  }

  console.log('[AuthGuard] Access denied, redirecting to login');
  // If not authenticated, redirect to login
  return router.createUrlTree(['/login']);
};

