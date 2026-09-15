import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface WorkItemDeletedData {
  workItemNum: number;
}

@Component({
  selector: 'app-work-item-deleted-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="deleted-header">Work Item Deletion</h2>
    <mat-dialog-content class="dialog-body">
      <div class="deleted-message-row">
        <span>Work Item #{{ data.workItemNum }} has been deleted</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions class="dialog-footer">
      <div class="footer-right">
        <button class="dialog-btn ok-btn" (click)="onOK()">OK</button>
      </div>
    </mat-dialog-actions>
  `,
  styles: [`
    .deleted-header {
      width: 400px;
      text-align: left;
      padding-left: 28px;
      color: #8a4d00;
      font-weight: 600;
      margin: 0;
    }
    mat-dialog-content {
      width: 400px;
      min-height: 120px;
      max-height: 400px;
      padding: 12px 8px 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dialog-body {
      flex: 1;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .deleted-message-row {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #374151;
      width: 100%;
      text-align: center;
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
    .ok-btn {
      border-color: #ff9800;
      color: #ffffff;
      background: #ff9800;
    }
    .ok-btn:hover {
      background: #f57c00 !important;
      color: #ffffff !important;
    }
  `]
})
export class WorkItemDeletedDialog {
  constructor(
    public dialogRef: MatDialogRef<WorkItemDeletedDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WorkItemDeletedData
  ) {}

  onOK(): void {
    this.dialogRef.close();
  }
}
