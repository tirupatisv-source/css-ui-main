import { Component, Inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

export interface WorkItemCompletionData {
  projectNum: string;
  stackDepth?: number;
  dialogPosition?: any;
}

@Component({
  selector: 'app-work-item-completion-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatDividerModule],
  template: `
    <h2 mat-dialog-title style="color: #8a4d00; font-weight: 600;">Work Item Wizard Completion ({{ data.projectNum }})</h2>

    

    <!-- Body -->
    <mat-dialog-content class="dialog-body">
        <div class="completion-message">
          Press finish to add the work item and associated parts of the project.
        </div>
      </mat-dialog-content>

      

      <!-- Footer -->
      <mat-dialog-actions class="dialog-footer">
        <div class="footer-right">
          <button class="dialog-btn cancel-btn" (click)="onCancel()">Cancel</button>
          <button class="dialog-btn back-btn" (click)="onBack()">Back</button>
          
          <button class="dialog-btn finish-btn" (click)="onFinish()">Finish</button>
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

    /* Remove all shadows and elevation from dialog */
    ::ng-deep .mat-mdc-dialog-container {
      box-shadow: none !important;
    }

    ::ng-deep .mat-mdc-dialog-surface,
    ::ng-deep .mdc-dialog__surface {
      box-shadow: none !important;
      border: 1px solid #e5e7eb !important;
    }

    ::ng-deep .cdk-overlay-pane {
      box-shadow: none !important;
    }

    /* Remove Material elevation classes */
    ::ng-deep .mdc-elevation--z1,
    ::ng-deep .mdc-elevation--z2,
    ::ng-deep .mdc-elevation--z8,
    ::ng-deep .mdc-elevation--z16 {
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

    .completion-message {
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
      background-color: white;
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

    .cancel-btn {
      border-color: transparent;
      color: #ff9800;
      background: transparent;
    }

    .cancel-btn:hover, .cancel-btn:hover:not([disabled]) {
      background: rgba(25, 118, 210, 0.08) !important;
      color: #ff9800 !important;
      border-color: transparent !important;
    }

    .back-btn {
      border-color: transparent;
      color: #ff9800;
      background: transparent;
    }

    .back-btn:hover, .back-btn:hover:not([disabled]) {
      background: rgba(25, 118, 210, 0.08) !important;
      color: #ff9800 !important;
      border-color: transparent !important;
    }

    .next-btn {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .next-btn:hover, .next-btn:hover:not([disabled]) {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .finish-btn {
      border-color: #ff9800;
      color: #ffffff;
      background: #ff9800;
    }

    .finish-btn:hover {
      background: #f57c00 !important;
      color: #ffffff !important;
    }
  `]
})
export class WorkItemCompletionDialog {

  constructor(
    public dialogRef: MatDialogRef<WorkItemCompletionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WorkItemCompletionData,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) {
  }

  onBack(): void {
    this.dialogRef.close({ action: 'back' });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onFinish(): void {
    // Close this dialog and return finish action to parent
    // The parent (AssociatedNodesDialog or WorkItemWizardDialog) will handle the rest
    this.dialogRef.close({ action: 'finish' });
  }
}
