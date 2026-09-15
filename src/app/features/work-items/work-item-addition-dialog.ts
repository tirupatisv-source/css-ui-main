import { Component, Inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

export interface WorkItemAdditionData {
  message: string;
  dialogPosition?: any;
}

@Component({
  selector: 'app-work-item-addition-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDividerModule],
  template: `
    <h2 mat-dialog-title style="color: #8a4d00; font-weight: 600;">Work Item Addition</h2>

    

    <!-- Body -->
    <mat-dialog-content class="dialog-body">
        <div class="addition-message">
          {{ data.message }}
        </div>
      </mat-dialog-content>

      

      <!-- Footer -->
      <mat-dialog-actions class="dialog-footer">
        <div class="footer-right">
          
          <button class="dialog-btn ok-btn" (click)="onOK()">OK</button>
        </div>
      </mat-dialog-actions>
    `,
  styles: [`
    :host {
      display: block;
    }

    h2 {
      width: 700px;
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
      width: 700px;
      min-height: 275px;
      max-height: 515px;
    }

    mat-dialog-actions {
      width: 700px;
    }

    /* Body */
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
      text-align: center;
    }

    /* Footer */
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 12px 24px;
      background: white;
      border-top: 1px solid #e5e7eb;
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
  `]
})
export class WorkItemAdditionDialog {

  constructor(
    public dialogRef: MatDialogRef<WorkItemAdditionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WorkItemAdditionData,
    private elementRef: ElementRef
  ) {}

  onOK(): void {
    this.dialogRef.close({ action: 'ok' });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}
