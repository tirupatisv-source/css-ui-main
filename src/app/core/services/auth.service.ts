import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, of } from 'rxjs';
import { tap, map, catchError, switchMap, finalize } from 'rxjs/operators';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AuthenticationResult, InteractionRequiredAuthError } from '@azure/msal-browser';
import { LoginResponse } from '../models/models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Authentication service using Azure AD SSO.
 * Converted from VB6: frmLogin authentication flow.
 * Replaces VB6 LDAP + JWT with Azure AD OAuth2/MSAL.
 * Replaces VB6 global variables: gUserName, gAccUser, gAccDataAd, gAccProjAd, gAccCostAd, gAccUserAd
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private _currentUser = signal<LoginResponse | null>(null);
  currentUser = this._currentUser.asReadonly();
  
  private _authCheckInProgress = signal(false);
  authCheckInProgress = this._authCheckInProgress.asReadonly();
  
  private _loginInProgress = false;

  private msalService = inject(MsalService);
  private msalBroadcast = inject(MsalBroadcastService);
  private router = inject(Router);
  private http = inject(HttpClient);

  constructor() {
    console.log('[Auth] Service initialized - checking auth state...');
    this._loginInProgress = false;  // Reset login flag on init
    
    // Check if user has MSAL accounts
    const accounts = this.msalService.instance.getAllAccounts();
    console.log(`[Auth] MSAL accounts found: ${accounts.length}`);
    
    if (accounts.length > 0) {
      // User has MSAL account - they're logged in
      console.log('[Auth] ✅ MSAL account found - user is logged in');
      
      // Try to restore from localStorage for quick display while fetching fresh data
      const userJson = localStorage.getItem('css_user');
      if (userJson) {
        console.log('[Auth] Restoring cached user from localStorage for quick display...');
        this._currentUser.set(JSON.parse(userJson));
      }
      
      // ALWAYS refresh user data from backend to ensure current CUID and roles
      // This prevents stale user data from showing after page refresh
      console.log('[Auth] 🔄 Refreshing user data from backend...');
      this.loadUserRoles(accounts[0].username).subscribe({
        next: () => console.log('[Auth] ✅ User data refreshed from backend'),
        error: (err) => console.error('[Auth] ❌ Failed to refresh user data:', err)
      });
    } else {
      // No MSAL account - user is logged out
      console.log('[Auth] No MSAL accounts found - user is logged out');
      localStorage.removeItem('css_user');
      localStorage.removeItem('activeProjectNum');
      sessionStorage.removeItem('cuid');
      this._currentUser.set(null);
    }
  }

  /**
   * Get CUID from currentUser or sessionStorage
   * Checks currentUser first (from backend response), then falls back to sessionStorage
   */
  getCuid(): string {
    // First check if CUID is in currentUser object (from backend response)
    const userCuid = this.currentUser()?.cuid;
    if (userCuid && userCuid.trim().length > 0) {
      return userCuid.toLowerCase();
    }
    
    // Fall back to sessionStorage (from Azure AD token)
    const sessionCuid = sessionStorage.getItem('cuid');
    return (sessionCuid || '').toLowerCase();
  }

  /**
   * Check if user is already authenticated via MSAL
   */
  private checkMsalLogin(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      console.log('[SSO] Found existing account on startup, loading roles...');
      this.loadUserRoles(accounts[0].username).subscribe();
    }
  }

  /**
   * Login via Azure AD SSO - redirects to Microsoft login
   * MSAL handles the OAuth2 flow, returns to redirectUri on completion
   */
  login(forceConsent = true): Observable<void> {
    // Guard: prevent concurrent login attempts
    if (this._loginInProgress) {
      console.warn('[SSO] Login already in progress, ignoring duplicate request');
      return of(void 0);
    }

    // CRITICAL: Clear interaction state flags from MSAL storage before attempting login
    // This prevents "interaction_in_progress" errors from stale state
    const interactionKeyPatterns = ['interaction', 'inProgress', 'nonce', 'state'];
    console.log('[SSO] Pre-clearing MSAL interaction flags...');
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && interactionKeyPatterns.some(pattern => key.includes(pattern))) {
          console.log(`[SSO] Cleared sessionStorage: ${key}`);
          sessionStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('[SSO] Error clearing session storage:', e);
    }

    // Check if there are already MSAL accounts (user might already be authenticated in MSAL)
    const existingAccounts = this.msalService.instance.getAllAccounts();
    if (existingAccounts.length > 0) {
      console.log('[SSO] MSAL accounts already exist, loading roles instead of showing login popup');
      return this.loadUserRoles(existingAccounts[0].username);
    }

    // Use only basic OpenID scopes for login popup - API scope requested separately in getToken()
    const loginRequest: any = { scopes: ['openid', 'profile', 'email'] };

    console.log('%c[SSO] 🔐 LOGIN INITIATED', 'color: blue; font-weight: bold;');
    
    this._loginInProgress = true;

    return this.msalService.loginPopup(loginRequest).pipe(
      tap(result => {
        if (result) {
          console.log('%c[SSO] ✅ LOGIN POPUP COMPLETED SUCCESSFULLY', 'color: green; font-weight: bold;');
          
          // Extract CUID from idTokenClaims
          if (result.idTokenClaims) {
            const cuid = (result.idTokenClaims as any)?.cuid;
            if (cuid) {
              console.log('%c  ✅ CUID FOUND: ' + cuid, 'color: green; font-weight: bold;');
              // Store CUID in sessionStorage (converted to lowercase)
              sessionStorage.setItem('cuid', cuid.toLowerCase());
            } else {
              console.log('%c  ⚠️  CUID NOT FOUND in idTokenClaims', 'color: orange;');
            }
            console.log('%c  Full idTokenClaims: ', 'color: blue;', result.idTokenClaims);
          } else {
            console.log('%c  ⚠️  NO idTokenClaims available', 'color: orange;');
          }
        }
      }),
      switchMap(result => {
        if (result) {
          return this.loadUserRoles(result.account?.username || '');
        }
        return of(void 0);
      }),
      tap(() => {
        console.log('%c[SSO] ✅ FULL AUTH FLOW COMPLETE', 'color: green; font-weight: bold;');
      }),
      catchError(error => {
        console.error('%c[SSO] ❌ LOGIN FAILED', 'color: red; font-weight: bold;', error);
        
        // Handle interaction_in_progress error specifically
        if (error?.message?.includes('interaction_in_progress')) {
          console.warn('[SSO] interaction_in_progress detected - MSAL state may be corrupted. Attempting aggressive recovery...');
          
          try {
            // Aggressively clear ALL interaction-related storage
            const morePatterns = ['interaction', 'inProgress', 'nonce', 'state', 'code', 'refresh', 'cache'];
            
            // Clear sessionStorage
            for (let i = sessionStorage.length - 1; i >= 0; i--) {
              const key = sessionStorage.key(i);
              if (key && (key.includes('msal') || morePatterns.some(p => key.includes(p)))) {
                console.log(`[SSO] Recovery cleared sessionStorage: ${key}`);
                sessionStorage.removeItem(key);
              }
            }
            
            // Clear localStorage MSAL keys
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const key = localStorage.key(i);
              if (key && (key.includes('msal') || key.includes('interaction'))) {
                console.log(`[SSO] Recovery cleared localStorage: ${key}`);
                localStorage.removeItem(key);
              }
            }
            
            console.log('[SSO] MSAL storage recovery completed');
          } catch (e) {
            console.warn('[SSO] Failed to perform recovery cleanup:', e);
          }
        }
        
        throw error;
      }),
      finalize(() => {
        // Always clear the login in progress flag when done (success or error)
        this._loginInProgress = false;
      })
    );
  }

  /**
   * Acquire token for API calls
   */
  getToken(): Observable<string | null> {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length === 0) {
      console.log('%c[SSO] ⚠️  NO ACCOUNTS FOUND - Cannot acquire token', 'color: orange;');
      return from(Promise.resolve(null));
    }

    console.log('%c[SSO] 🔑 ACQUIRING ACCESS TOKEN', 'color: blue; font-weight: bold;');

    const request = {
      scopes: environment.apiScopes,
      account: accounts[0]
    };

    // Try silent acquisition first; if interaction is required, fall back to popup
    return this.msalService.acquireTokenSilent(request).pipe(
      tap(result => {
        console.log('%c[SSO] ✅ SILENT TOKEN ACQUISITION SUCCEEDED', 'color: green;');
        console.log('%c  Token Expires: ' + new Date(result.expiresOn || 0).toISOString(), 'color: green;');
      }),
      map((result: AuthenticationResult) => result.accessToken),
      catchError(error => {
        console.warn('%c[SSO] ⚠️  SILENT TOKEN ACQUISITION FAILED', 'color: orange;', error);
        if (error instanceof InteractionRequiredAuthError) {
          console.log('%c[SSO] 🔐 INTERACTION REQUIRED - Falling back to popup', 'color: blue;');
          return this.msalService.acquireTokenPopup(request).pipe(
            tap(result => {
              console.log('%c[SSO] ✅ POPUP TOKEN ACQUISITION SUCCEEDED', 'color: green;');
              console.log('%c  Token Expires: ' + new Date(result.expiresOn || 0).toISOString(), 'color: green;');
            }),
            map((res: AuthenticationResult) => res.accessToken),
            catchError(inner => {
              console.error('%c[SSO] ❌ POPUP TOKEN ACQUISITION FAILED', 'color: red; font-weight: bold;', inner);
              return of(null);
            })
          );
        }

        return of(null);
      })
    );
  }

  /**
   * Load user roles from backend based on Azure AD identity
   * Backend validates token and returns roles for authorization
   */
  private loadUserRoles(userName: string): Observable<void> {
    return this.getToken().pipe(
      switchMap(token => {
        if (!token) {
          console.log('%c[SSO] ⚠️  NO TOKEN AVAILABLE - Cannot load user roles', 'color: orange;');
          this._authCheckInProgress.set(false);
          return of(void 0);
        }
       
        // Decode token payload to inspect claims for debugging
        let tokenClaims: any = {};
        try {
          const parts = token.split('.');
          if (parts.length >= 2) {
            tokenClaims = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            console.log('%c[SSO] ✅ TOKEN CLAIMS DECODED SUCCESSFULLY', 'color: green;');
          }
        } catch (e) {
          console.warn('%c[SSO] ⚠️  Failed to decode access token', 'color: orange;', e);
        }

        console.log('%c[SSO] 🌐 CALLING BACKEND /api/auth/me', 'color: blue; font-weight: bold;');
        console.log('%c  Backend URL: ' + environment.apiUrl + '/api/auth/me', 'color: blue;');
        console.log('%c  Token Preview: ' + token.substring(0, 50) + '...', 'color: blue;');

        // Set loading state to true
        this._authCheckInProgress.set(true);

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        // Call backend to get user roles based on Azure AD token (attach Bearer header)
        return this.http.get<LoginResponse>(`${environment.apiUrl}/api/auth/me`, { headers }).pipe(
          tap(response => {
            console.log('%c[SSO] ✅ BACKEND RESPONSE RECEIVED SUCCESSFULLY', 'color: green; font-weight: bold;');
            
            // If CUID is not in backend response, get it from sessionStorage
            const cuidFromSession = sessionStorage.getItem('cuid');
            if (!response.cuid && cuidFromSession) {
              response.cuid = cuidFromSession;
              console.log('%c  CUID: ' + response.cuid + ' (from sessionStorage)', 'color: green;');
            } else if (response.cuid) {
              // Convert backend CUID to lowercase to ensure consistency
              response.cuid = response.cuid.toLowerCase();
              console.log('%c  CUID: ' + response.cuid + ' (converted to lowercase)', 'color: green;');
            }
            
            this._currentUser.set(response);
            localStorage.setItem('css_user', JSON.stringify(response));
            this._authCheckInProgress.set(false);
          }),
          map(() => void 0),
          catchError(error => {
            console.error('%c[SSO] ❌ BACKEND REQUEST FAILED', 'color: red; font-weight: bold;', error);
            if (error.status) {
              console.error('%c  Status Code: ' + error.status, 'color: red;');
              console.error('%c  Status Text: ' + error.statusText, 'color: red;');
            }
            if (error.error) {
              console.error('%c  Response Body: ', 'color: red;', error.error);
            }
            console.warn('%c[SSO] ⚠️  Using fallback local roles so development can proceed', 'color: orange;');
            this._authCheckInProgress.set(false);

            // Mock frontend roles until the backend API Scopes are properly registered
            const cuidFromSession = sessionStorage.getItem('cuid') || '';
            const fallback: LoginResponse = {
              userName: userName,
              cuid: cuidFromSession.toLowerCase(),
              givenName: '',
              token: '',
              userAccess: true,
              dataAdmin: true,
              projAdmin: true,
              costAdmin: true,
              userAdmin: true
            };

            console.log('%c  CUID (from sessionStorage - lowercase): ' + cuidFromSession.toLowerCase(), 'color: green;');
            this._currentUser.set(fallback);
            localStorage.setItem('css_user', JSON.stringify(fallback));
            return of(void 0);
          })
        );
      })
    );
  }

  logout(): void {
    console.log('[Auth] Starting comprehensive logout...');
    
    // 1. Clear application user signal
    this._currentUser.set(null);
    
    // 2. Clear all application storage keys
    localStorage.removeItem('css_user');
    localStorage.removeItem('activeProjectNum');
    sessionStorage.removeItem('cuid');
    
    // 3. Clear MSAL-specific storage keys to prevent token reuse
    // MSAL stores cache keys in localStorage with 'msal.' prefix
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('msal') || key.includes('cache') || key.includes('token') || key.includes('interaction'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => {
      console.log(`[Auth] Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    });
    
    // 4. Clear MSAL sessionStorage keys (typically contains code flow state and interaction flags)
    const sessionKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('msal') || key.includes('cache') || key.includes('state') || key.includes('code') || key.includes('interaction'))) {
        sessionKeysToRemove.push(key);
      }
    }
    sessionKeysToRemove.forEach(key => {
      console.log(`[Auth] Removing sessionStorage key: ${key}`);
      sessionStorage.removeItem(key);
    });
    
    // 5. Clear MSAL-related IndexedDB stores (MSAL may use IndexedDB for cache)
    console.log('[Auth] Clearing IndexedDB MSAL stores...');
    const indexedDBStores = ['msal', 'msal.cache'];
    indexedDBStores.forEach(storeName => {
      try {
        const request = indexedDB.deleteDatabase(storeName);
        request.onsuccess = () => console.log(`[Auth] Deleted IndexedDB: ${storeName}`);
        request.onerror = () => console.warn(`[Auth] Failed to delete IndexedDB: ${storeName}`);
      } catch (e) {
        console.warn(`[Auth] Could not access IndexedDB:`, e);
      }
    });
    
    // 6. Reset login flag to allow fresh login attempts
    this._loginInProgress = false;

    // Navigate to logout page to show logout message with 5-second countdown
    console.log('[Auth] Navigating to logout page...');
    this.router.navigate(['/logout']);
  }

  isLoggedIn(): boolean {
    // User is logged in if we have user data in our application state
    // MSAL manages its own account list; we trust our _currentUser signal as the source of truth
    return this._currentUser() !== null;
  }

  /**
   * Check if current user has specific role.
   * Mirrors VB6 global boolean flags: gAccUser, gAccDataAd, etc.
   */
  hasRole(role: 'userAccess' | 'dataAdmin' | 'projAdmin' | 'costAdmin' | 'userAdmin'): boolean {
    const user = this._currentUser();
    return user ? !!user[role] : false;
  }

  /**
   * Get current authenticated user name from MSAL
   */
  getCurrentUserName(): string {
    const accounts = this.msalService.instance.getAllAccounts();
    return accounts.length > 0 ? accounts[0].username : '';
  }
}
