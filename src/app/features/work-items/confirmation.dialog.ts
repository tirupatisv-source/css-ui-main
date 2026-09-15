import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirmation-dialog">
      <div class="dialog-header">
        <mat-icon class="header-icon">check_circle_outline</mat-icon>
        <h2>{{ data.title }}</h2>
      </div>
      
      <div class="dialog-body">
        <p>{{ data.message }}</p>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-raised-button (click)="onConfirm()" class="confirm-btn">
          <mat-icon>check</mat-icon>
          {{ data.confirmText || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-dialog {
      padding: 0;
      min-width: 350px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #f1ece5;
    }

    .header-icon {
      color: #ff9800;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #222;
    }

    .dialog-body {
      padding: 24px;
      min-height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog-body p {
      margin: 0;
      font-size: 14px;
      color: #555;
      line-height: 1.5;
      text-align: center;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px 24px;
      border-top: 1px solid #e0e0e0;
      background: #fafafa;
    }

    .cancel-btn {
      color: #666;
      border: 1px solid #ddd;
      border-radius: 6px;
      background: white;
      transition: all 0.2s ease;
    }

    .cancel-btn:hover {
      background: #f5f5f5;
      border-color: #999;
      color: #333;
    }

    .confirm-btn {
      background: #ff9800 !important;
      color: white !important;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .confirm-btn:hover {
      background: #f57c00 !important;
      box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
    }

    .confirm-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class ConfirmationDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
