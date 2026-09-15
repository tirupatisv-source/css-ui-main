import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Navigation Service
 * Centralized router navigation with type safety
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(private router: Router) {}

  /**
   * Navigate to home (landing page)
   */
  toHome(): Promise<boolean> {
    return this.router.navigate(['/home']);
  }

  /**
   * Navigate to login
   */
  toLogin(): Promise<boolean> {
    return this.router.navigate(['/login']);
  }

  /**
   * Navigate to logout
   */
  toLogout(): Promise<boolean> {
    return this.router.navigate(['/logout']);
  }

  /**
   * Navigate to work items view
   */
  toWorkItems(projectNum: string): Promise<boolean> {
    return this.router.navigate(['/projects', projectNum, 'work-items']);
  }

  /**
   * Navigate to run list view
   */
  toRunList(projectNum: string): Promise<boolean> {
    return this.router.navigate(['/projects', projectNum, 'run-list']);
  }

  /**
   * Navigate to reports view
   */
  toReports(projectNum: string): Promise<boolean> {
    return this.router.navigate(['/projects', projectNum, 'reports']);
  }

  /**
   * Navigate to notes view
   */
  toNotes(projectNum: string): Promise<boolean> {
    return this.router.navigate(['/projects', projectNum, 'notes']);
  }

  /**
   * Navigate to edit view
   */
  toEdit(projectNum: string): Promise<boolean> {
    return this.router.navigate(['/projects', projectNum, 'edit']);
  }

  /**
   * Navigate to admin parts
   */
  toAdminParts(): Promise<boolean> {
    return this.router.navigate(['/admin/parts']);
  }

  /**
   * Navigate to admin companies
   */
  toAdminCompanies(): Promise<boolean> {
    return this.router.navigate(['/admin/companies']);
  }

  /**
   * Navigate to admin users
   */
  toAdminUsers(): Promise<boolean> {
    return this.router.navigate(['/admin/users']);
  }

  /**
   * Navigate to any path with params
   */
  navigate(path: string, params: any[] = []): Promise<boolean> {
    return this.router.navigate([path, ...params]);
  }

  /**
   * Navigate with query params
   */
  navigateWithQuery(path: string, queryParams: Record<string, any>): Promise<boolean> {
    return this.router.navigate([path], { queryParams });
  }

  /**
   * Navigate with fragment (anchor)
   */
  navigateWithFragment(path: string, fragment: string): Promise<boolean> {
    return this.router.navigate([path], { fragment });
  }

  /**
   * Replace current route (without adding to history)
   */
  replace(path: string, params: any[] = []): Promise<boolean> {
    return this.router.navigate([path, ...params], { replaceUrl: true });
  }

  /**
   * Go back to previous page
   */
  goBack(): void {
    window.history.back();
  }

  /**
   * Check if current route contains path
   */
  isCurrentRoute(path: string): boolean {
    return this.router.url.includes(path);
  }

  /**
   * Get current route URL
   */
  getCurrentUrl(): string {
    return this.router.url;
  }
}
