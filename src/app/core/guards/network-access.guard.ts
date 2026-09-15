import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NetworkAccessService } from '../services/network-access.service';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AccessDeniedComponent } from '../../features/auth/access-denied.component';

/**
 * Route guard – checks if user has access to CSS package network path.
 * If access is denied, opens a dialog asking to contact Audio.
 * If access is granted, allows navigation to the route.
 */
export const networkAccessGuard: CanActivateFn = async () => {
  const networkAccessService = inject(NetworkAccessService);
  const router = inject(Router);
  const dialog = inject(MatDialog);

  try {
    console.log('[NetworkAccessGuard] Starting network access check...');
    
    // Check network access on the backend
    const response = await firstValueFrom(networkAccessService.checkNetworkAccess());
    
    console.log('[NetworkAccessGuard] Access check result:', response.hasAccess);
    console.log('[NetworkAccessGuard] Full response:', response);
    
    if (response.hasAccess) {
      console.log('[NetworkAccessGuard] Access granted - allowing navigation');
      return true;
    } else {
      console.log('[NetworkAccessGuard] Access denied - showing dialog');
      // Open access denied dialog with blur effect on background
      const dialogRef = dialog.open(AccessDeniedComponent, {
        width: '600px',
        maxWidth: '95vw',
        panelClass: ['themed-dialog'],
        backdropClass: 'blur-backdrop',
        disableClose: false
      });

      // Wait for dialog to close and handle user action
      dialogRef.afterClosed().subscribe((result) => {
        console.log('[NetworkAccessGuard] Dialog closed with result:', result);
        if (result === 'home') {
          console.log('[NetworkAccessGuard] User clicked Go to Home');
          router.navigate(['/']);
        } else if (result === 'retry') {
          console.log('[NetworkAccessGuard] User clicked Retry - need to navigate again');
          // User will need to re-attempt navigation manually
        }
      });

      return false;
    }
  } catch (error) {
    console.error('[NetworkAccessGuard] Error checking network access:', error);
    // Default to deny access on error
    const dialogRef = dialog.open(AccessDeniedComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: ['themed-dialog'],
      backdropClass: 'blur-backdrop',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('[NetworkAccessGuard] Error dialog closed with result:', result);
      if (result === 'home') {
        router.navigate(['/']);
      }
    });
    return false;
  }
};
