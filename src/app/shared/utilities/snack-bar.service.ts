import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type SnackBarType = 'success' | 'error' | 'warning' | 'info';

/**
 * SnackBarService
 * Centralized toast notification service
 * Ensures consistent messaging across the application
 */
@Injectable({
  providedIn: 'root'
})
export class SnackBarService {
  private readonly DEFAULT_DURATION = 3000; // 3 seconds
  private readonly LONG_DURATION = 5000;    // 5 seconds

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show success toast
   */
  success(message: string, action = 'Close', duration = this.DEFAULT_DURATION): void {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-success'],
    });
  }

  /**
   * Show error toast
   */
  error(message: string, action = 'Close', duration = this.LONG_DURATION): void {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-error'],
    });
  }

  /**
   * Show warning toast
   */
  warning(message: string, action = 'Close', duration = this.DEFAULT_DURATION): void {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-warning'],
    });
  }

  /**
   * Show info toast
   */
  info(message: string, action = 'Close', duration = this.DEFAULT_DURATION): void {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['snackbar-info'],
    });
  }

  /**
   * Show generic toast with custom configuration
   */
  show(
    message: string,
    type: SnackBarType = 'info',
    action = 'Close',
    duration = this.DEFAULT_DURATION
  ): void {
    switch (type) {
      case 'success':
        this.success(message, action, duration);
        break;
      case 'error':
        this.error(message, action, duration);
        break;
      case 'warning':
        this.warning(message, action, duration);
        break;
      case 'info':
      default:
        this.info(message, action, duration);
        break;
    }
  }

  /**
   * Dismiss all open snackbars
   */
  dismissAll(): void {
    this.snackBar.dismiss();
  }
}
