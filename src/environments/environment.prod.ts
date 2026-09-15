// Production Environment Configuration
// Used for: npm run build --configuration=production
export const environment = {
  production: true,
  apiUrl: 'https://css-api-prod.rke-odc-prod.corp.intranet',
  environmentName: 'Production',
  msalConfig: {
    auth: {
      clientId: '3bdc5cbc-3ed8-4e41-9a4e-67516b4d83be',
      authority: 'https://login.microsoftonline.com/72b17115-9915-42c0-9f1b-4f98e5a4bcd2/v2.0',
      redirectUri: 'https://css-ui-prod.rke-odc-prod.corp.intranet/azure-callback',
      postLogoutRedirectUri: 'https://css-ui-prod.rke-odc-prod.corp.intranet/logout'
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    },
    system: {
      loggerOptions: {
        loggerCallback: (logLevel: any, message: string) => {
          console.log(`MSAL [${logLevel}]: ${message}`);
        },
        piiLoggingEnabled: false
      }
    }
  },
  apiScopes: ['3bdc5cbc-3ed8-4e41-9a4e-67516b4d83be/.default']
};

