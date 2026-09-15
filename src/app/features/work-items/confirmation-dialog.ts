import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

export interface ConfirmationData {
  message: string;
  stackDepth?: number;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="confirmation-shell">
      <!-- Body -->
      <div class="confirmation-body">
        <div class="confirmation-message">
          {{ data.message }}
        </div>
      </div>

      <!-- Footer -->
      <div class="confirmation-footer">
        <button class="confirmation-btn ok-btn" (click)="onOk()">OK</button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-shell {
      display: flex;
      flex-direction: column;
      width: 400px;
      background: #ffffff;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      border-radius: 8px;
    }

    /* Body */
    .confirmation-body {
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
    }

    .confirmation-message {
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
      text-align: center;
    }

    /* Footer */
    .confirmation-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 12px 24px 24px;
      background-color: #ffffff;
    }

    .confirmation-btn {
      height: 32px;
      padding: 0 24px;
      border-radius: 6px;
      border: none;
      background: #ff9800;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-weight: 500;
      color: #ffffff;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .ok-btn:hover {
      background: #f57c00 !important;
      color: #ffffff !important;
    }
  `]
})
export class ConfirmationDialog {
  stackDepth: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationData
  ) {
    // Initialize stack depth from data, default to 0
    this.stackDepth = data.stackDepth ?? 0;
  }

  onOk(): void {
    this.dialogRef.close(true);
  }
}
