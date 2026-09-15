import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

export interface WorkItemDeleteData {
  workItemNum: number;
  workItemId: number;
}

@Component({
  selector: 'app-work-item-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDividerModule, MatIconModule],
  template: `
    <h2 mat-dialog-title style="color: #8a4d00; font-weight: 600;">Delete Work Item</h2>

    <!-- Body -->
    <mat-dialog-content class="dialog-body">
      <div class="addition-message">
        <mat-icon class="warning-icon">warning</mat-icon>
        <div class="delete-message-row">
          <span>Are you sure you want to delete <strong>Work Item #{{ data.workItemNum }}</strong>?</span>
        </div>
        <div>
          <!-- <p class="warning-text">This action cannot be undone.</p> -->
        </div>
      </div>
    </mat-dialog-content>

    <!-- Footer -->
    <mat-dialog-actions class="dialog-footer">
      <div class="footer-right">
        <button class="dialog-btn cancel-btn" (click)="onCancel()">Cancel</button>
        <button class="dialog-btn ok-btn" (click)="onDelete()">Delete</button>
      </div>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    h2 {
      width: 400px;
    }

    ::ng-deep .mat-mdc-dialog-container {
      box-shadow: none !important;
    }
    ::ng-deep .cdk-overlay-backdrop {
      background-color: transparent !important;
      background: transparent !important;
      opacity: 1 !important;
      pointer-events: none !important;
    }

    mat-dialog-content {
      width: 400px;
      min-height: 120px;
      max-height: 400px;
      padding: 12px 8px 0 8px;
    }

    .dialog-body {
      flex: 1;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .addition-message {
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      min-height: 80px;
      width: 100%;
    }

    .delete-message-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25em;
      font-size: 14px;
      color: #374151;
      white-space: normal;
      width: 100%;
      text-align: center;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 28px;
      width: 28px;
      height: 28px;
      min-width: 28px;
      margin-top: 0;
    }

    .addition-message strong {
      color: #8a4d00;
      font-weight: 600;
    }

    .warning-text {
      color: #ff9800;
      font-weight: 500;
      font-size: 13px;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 12px 24px 12px 8px;
      background: white;
      border-top: 1px solid #e5e7eb;
      width: 100%;
      box-sizing: border-box;
    }

    .footer-right {
      display: flex;
      gap: 8px;
    }

    .dialog-btn {
      height: 32px;
      padding: 0 18px;
      border-radius: 6px;
      border: 1.5px solid #d1d5db;
      background: #ffffff;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .dialog-btn[disabled] {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .ok-btn {
      border-color: #ff9800;
      color: #ffffff;
      background: #ff9800;
    }

    .ok-btn:hover {
      background: #f57c00 !important;
      color: #ffffff !important;
    }

    .cancel-btn {
      border-color: transparent;
      color: #ff9800;
      background: transparent;
      transition: all 0.18s ease;
    }
    .cancel-btn:hover, .cancel-btn:hover:not([disabled]) {
      background: rgba(25, 118, 210, 0.08) !important;
      color: #ff9800 !important;
      border-color: transparent !important;
    }
  `]
})
export class WorkItemDeleteDialog {
  constructor(
    public dialogRef: MatDialogRef<WorkItemDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WorkItemDeleteData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.dialogRef.close(true);
  }
}
