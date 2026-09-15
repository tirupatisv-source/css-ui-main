import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NetworkAccessService, NetworkAccessResponse } from '../../core/services/network-access.service';
import { AuthService } from '../../core/services/auth.service';
import { LoginResponse } from '../../core/models/models';

/**
 * Component displayed when user does not have access to CSS package network path.
 * Shows message asking to contact Audio for access request.
 * Displays CUID and email for debugging purposes.
 */
@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="error-icon">block</mat-icon>
      Access Denied
    </h2>

    <mat-dialog-content>
      <div class="error-message">
        <p class="message-title">
          You don't have access to the CSS Package network location.
        </p>
        <p class="message-details">
          The path <code>{{ networkPath }}</code> 
          is not accessible to your account.
        </p>
      </div>

      <!-- Debug Information -->
      <div class="debug-info" *ngIf="currentUser">
        <details>
          <summary>Debug Information (for IT support)</summary>
          <div class="debug-details">
            <p><strong>CUID:</strong> {{ cuid || 'N/A' }}</p>
            <p><strong>Email:</strong> {{ email || 'N/A' }}</p>
            <p><strong>Network Path:</strong> {{ accessResponse?.networkPath || networkPath }}</p>
            <p><strong>Message:</strong> {{ accessResponse?.message || 'Access denied' }}</p>
          </div>
        </details>
      </div>

      <div class="action-section">
        <h3>What to do next:</h3>
        <ol>
          <li>
            <strong>Contact Audio</strong> to request access to the CSS package network share
          </li>
          <li>
            Provide your CUID: <code>{{ cuid || 'N/A' }}</code>
          </li>
          <li>
            Provide your email: <code>{{ email || 'N/A' }}</code>
          </li>
          <li>
            Once access is granted, return to this page and try again
          </li>
        </ol>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="goHome()">
        <mat-icon>home</mat-icon>
        Go to Home
      </button>
      <button mat-raised-button color="primary" (click)="retryAccess()">
        <mat-icon>refresh</mat-icon>
        Retry Access Check
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      margin: 0;
      color: #8a4d00;
      padding: 0;
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 20px;
    }

    .error-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    mat-dialog-content {
      padding: 24px;
      max-height: 500px;
      overflow-y: auto;
    }

    .error-message {
      margin-bottom: 24px;
    }

    .message-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 12px;
    }

    .message-details {
      color: #666;
      margin: 12px 0;
      font-size: 14px;
    }

    code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      color: #d32f2f;
      word-break: break-all;
    }

    .action-section {
      margin-bottom: 24px;
      background-color: #fff3cd;
      padding: 16px;
      border-radius: 4px;
      border-left: 4px solid #ffc107;
    }

    .action-section h3 {
      margin-top: 0;
      color: #856404;
      font-size: 14px;
    }

    .action-section ol {
      margin: 12px 0;
      padding-left: 24px;
    }

    .action-section li {
      margin-bottom: 8px;
      color: #666;
      font-size: 13px;
    }

    .debug-info {
      margin: 16px 0;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .debug-info summary {
      cursor: pointer;
      color: #666;
      font-size: 12px;
      font-weight: 500;
      user-select: none;
    }

    .debug-info summary:hover {
      color: #333;
    }

    .debug-details {
      margin-top: 8px;
      font-size: 12px;
      font-family: 'Courier New', monospace;
    }

    .debug-details p {
      margin: 4px 0;
      word-break: break-all;
    }

    .debug-details code {
      background-color: white;
      padding: 2px 4px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #ddd;
      gap: 8px;
      display: flex;
      justify-content: flex-end;
    }

    button[mat-raised-button] {
      gap: 8px;
    }

    button mat-icon {
      margin-right: 4px;
    }
  `]
})
export class AccessDeniedComponent implements OnInit {
  accessResponse: NetworkAccessResponse | null = null;
  currentUser: LoginResponse | null = null;
  cuid: string = '';
  email: string = '';
  networkPath: string = '\\\\nabmp1f_cifs\\dept\\facilities\\Infrastructure Engineering\\CSS';
  
  private networkAccessService = inject(NetworkAccessService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialogRef = inject(MatDialogRef<AccessDeniedComponent>);

  ngOnInit(): void {
    console.log('[AccessDeniedComponent] Access denied page loaded');
    // Get the cached access response to display debug info
    this.accessResponse = this.networkAccessService.getCachedAccess();
    
    // Get current user from AuthService to display CUID and email
    this.currentUser = this.authService.currentUser();
    if (this.currentUser) {
      this.cuid = this.currentUser.cuid || '';
      this.email = this.currentUser.userName || '';
      console.log('[AccessDeniedComponent] Current user CUID:', this.cuid, 'Email:', this.email);
    }
  }

  retryAccess(): void {
    console.log('[AccessDeniedComponent] Retrying network access check...');
    // Clear cache to force re-check
    this.networkAccessService.clearCache();
    // Close dialog to return to protected route (will re-trigger guard)
    this.dialogRef.close('retry');
  }

  goHome(): void {
    console.log('[AccessDeniedComponent] Navigating to home');
    this.dialogRef.close('home');
  }
}
