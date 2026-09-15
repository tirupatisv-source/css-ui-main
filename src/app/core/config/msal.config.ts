import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { MsalModule, MsalInterceptor, MsalGuard } from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';
import { environment } from '../../../environments/environment';

/**
 * MSAL Configuration Provider
 * Replaces VB6 LDAP authentication with Azure AD SSO.
 * Provides MSAL interceptor, guard, and PublicClientApplication to Angular app.
 */
export function msalConfigFactory(): PublicClientApplication {
  return new PublicClientApplication(environment.msalConfig);
}

export const msal = importProvidersFrom(
  MsalModule.forRoot(
    new PublicClientApplication(environment.msalConfig),
    [
      {
        interactionType: 'redirect',
        authRequest: {
          scopes: environment.apiScopes
        }
      },
      {
        interactionType: 'redirect',
        authRequest: {
          scopes: ['mail.read']
        }
      }
    ],
    {
      interactionType: 'redirect',
      authRequest: {
        scopes: environment.apiScopes
      }
    }
  )
);
