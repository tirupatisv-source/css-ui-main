import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Network access check response model.
 */
export interface NetworkAccessResponse {
  hasAccess: boolean;
  networkPath: string;
  cuid: string;
  email: string;
  message: string;
}

/**
 * Service to check network path access.
 * Calls backend API to verify if logged-in user has access to CSS package network share.
 */
@Injectable({ providedIn: 'root' })
export class NetworkAccessService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/auth`;
  
  // Cache the access check result using Angular signals
  private networkAccessCache = signal<NetworkAccessResponse | null>(null);
  networkAccessCache$ = this.networkAccessCache.asReadonly();

  /**
   * Check if the logged-in user has access to the CSS package network path.
   * Result is cached after first call to avoid repeated network requests.
   */
  checkNetworkAccess(): Observable<NetworkAccessResponse> {
    const cached = this.networkAccessCache();
    
    if (cached) {
      console.log('[NetworkAccessService] Returning cached access check result');
      return of(cached);
    }

    console.log('[NetworkAccessService] Performing network access check...');
    return this.http.get<NetworkAccessResponse>(`${this.apiUrl}/check-network-access`)
      .pipe(
        tap(response => {
          console.log('[NetworkAccessService] Access check result:', response.hasAccess);
          this.networkAccessCache.set(response);
        }),
        catchError(error => {
          console.error('[NetworkAccessService] Network access check failed:', error);
          // Default to deny access on error
          const errorResponse: NetworkAccessResponse = {
            hasAccess: false,
            networkPath: '\\\\nabmp1f_cifs\\dept',
            cuid: '',
            email: '',
            message: 'Unable to verify network access. Please contact Audio for assistance.'
          };
          this.networkAccessCache.set(errorResponse);
          return of(errorResponse);
        })
      );
  }

  /**
   * Clear the cached access check result.
   * Useful for refreshing access permissions.
   */
  clearCache(): void {
    this.networkAccessCache.set(null);
  }

  /**
   * Get the cached access status without making a new request.
   */
  getCachedAccess(): NetworkAccessResponse | null {
    return this.networkAccessCache();
  }

  /**
   * List contents of the CSS package network path.
   * Returns files and directories accessible at the network location.
   */
  listNetworkPathContents(): Observable<any> {
    console.log('[NetworkAccessService] Fetching network path contents...');
    return this.http.get<any>(`${this.apiUrl}/list-network-path`)
      .pipe(
        tap(response => {
          console.log('[NetworkAccessService] Network path contents retrieved:', response);
          if (response.contents) {
            console.log('=== Network Path Contents ===');
            console.log('Path:', response.path);
            console.log('Total items:', response.itemCount);
            response.contents.forEach((item: any) => {
              console.log(`  ${item.isDirectory ? '[DIR]' : '[FILE]'} ${item.name} (${item.size} bytes)`);
            });
          }
        }),
        catchError(error => {
          console.error('[NetworkAccessService] Failed to fetch network path contents:', error);
          return of({
            error: error.message,
            contents: []
          });
        })
      );
  }

  /**
   * Create a project directory on the network share.
   * Creates a folder with the project number at:
   * \\nabmp1f_cifs\dept\facilities\CSS-package\project\{projectNum}
   */
  createProjectNetworkDirectory(projectNum: string): Observable<any> {
    console.log(`[NetworkAccessService] Creating project directory for ${projectNum}...`);
    return this.http.post<any>(`${this.apiUrl}/create-project-directory`, { projectNum })
      .pipe(
        tap(response => {
          console.log(`[NetworkAccessService] Project directory created successfully for ${projectNum}:`, response);
        }),
        catchError(error => {
          console.error(`[NetworkAccessService] Failed to create project directory for ${projectNum}:`, error);
          return of({
            success: false,
            error: error.message || 'Failed to create project directory',
            projectNum: projectNum
          });
        })
      );
  }

  /**
   * Find a project directory on the network share.
   * Searches for folder at: \\nabmp1f_cifs\dept\facilities\CSS-package\project\{projectNum}
   * Used when opening a project to verify the directory exists.
   */
  findProjectNetworkDirectory(projectNum: string): Observable<any> {
    console.log(`[NetworkAccessService] Searching for project directory ${projectNum}...`);
    return this.http.post<any>(`${this.apiUrl}/find-project-directory`, { projectNum })
      .pipe(
        tap(response => {
          if (response.found) {
            console.log(`✓ Project directory found for ${projectNum}: ${response.path}`);
          } else {
            console.log(`⚠️ Project directory not found for ${projectNum}`);
          }
        }),
        catchError(error => {
          console.error(`[NetworkAccessService] Error searching for project directory ${projectNum}:`, error);
          return of({
            found: false,
            error: error.message || 'Failed to search for project directory',
            projectNum: projectNum
          });
        })
      );
  }
}
