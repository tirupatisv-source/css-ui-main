import { Component, Inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { WorkItemWizardDialog } from './operation-category-selection-dialog';

export interface WorkItemIntroData {
  projectNum: string;
  stackDepth?: number;
  dialogPosition?: any;
}

@Component({
  selector: 'app-work-item-intro',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatCheckboxModule, MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title style="color: #8a4d00; font-weight: 600;">Work Item Wizard ({{ data.projectNum }})</h2>

    

    <!-- Body -->
    <mat-dialog-content class="intro-body">
      <p class="intro-message">
        This wizard will walk you through the steps necessary to add a new Work Item to the project. It allows for entry of LineUps and assigning equipment to bays. Upon completion, the wizard will add all the standardized quantities of associated parts for the work item which you can edit later.
      </p>

      <div class="checkbox-container">
        <input type="checkbox" id="doNotShow" [(ngModel)]="doNotShowAgain" />
        <label for="doNotShow">Do not show this screen in the future</label>
      </div>
    </mat-dialog-content>

    

    <!-- Footer -->
    <mat-dialog-actions class="intro-footer">
      <div class="footer-right">
        <button class="intro-btn cancel-btn" (click)="onCancel()">Cancel</button>
        <button class="intro-btn back-btn" [disabled]="true">Back</button>
        <button class="intro-btn next-btn" (click)="onNext()">Next</button>
        <!-- <button class="intro-btn finish-btn" [disabled]="true">Finish</button> -->
      </div>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    h2 {
      width: 700px;
      margin: 0 0 0.3rem 0;
      color: theme.$color-dialog-title;
      padding: 0 0 0 24px;
      font-weight: 500;
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
      min-height: 260px;
      max-height: 500px;
      display: flex;
      flex-direction: column;
    }

    mat-dialog-actions {
      width: 700px;
    }

    /* Body */
    .intro-body {
      flex: 1;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 24px;
    }

    .intro-message {
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
      margin: 0;
    }

    /* Checkbox */
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #374151;
      padding-top: 12px;
    }

    .checkbox-container input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #ff9800;
      flex-shrink: 0;
    }

    .checkbox-container label {
      cursor: pointer;
      margin: 0;
      font-weight: 500;
    }

    /* Footer */
    .intro-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 12px 24px;
      background-color: white;
      border-top: 1px solid #e5e7eb;
      gap: 8px;
    }

    .footer-right {
      display: flex;
      gap: 8px;
    }

    .intro-btn {
      height: 36px;
      padding: 0 20px;
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

    .intro-btn:hover:not([disabled]) {
      border-color: #ff9800;
      color: #ff9800;
      background: #fff3e0;
    }

    .intro-btn[disabled] {
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

    .next-btn {
      border-color: #ff9800;
      color: #ffffff;
      background: #ff9800;
    }

    .next-btn:hover {
      background: #f57c00 !important;
      color: #ffffff !important;
    }

    .finish-btn {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .finish-btn:hover, .finish-btn:hover:not([disabled]) {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .back-btn {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .back-btn:hover, .back-btn:hover:not([disabled]) {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `]
})
export class WorkItemIntroDialog {
  doNotShowAgain = false;
  dialogPosition: any;

  constructor(
    public dialogRef: MatDialogRef<WorkItemIntroDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WorkItemIntroData,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) {
    this.captureDialogPosition();
  }

  /** Capture current dialog position to use for all subsequent dialogs */
  private captureDialogPosition(): void {
    setTimeout(() => {
      const pane = this.elementRef.nativeElement.closest('.cdk-overlay-pane');
      if (pane) {
        const rect = pane.getBoundingClientRect();
        this.dialogPosition = { left: `${rect.left}px`, top: `${rect.top}px` };
      }
    }, 0);
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onNext(): void {
    // Save the "Do not show again" preference if checked
    if (this.doNotShowAgain) {
      localStorage.setItem('skipWorkItemIntroDialog', 'true');
    }

    // Hide current dialog before opening next one
    this.hideCurrentDialog();

    // Open the next dialog (operation/category selection)
    const ref = this.dialog.open(WorkItemWizardDialog, {
      data: { projectNum: this.data.projectNum, dialogPosition: this.dialogPosition },
      disableClose: true,
      autoFocus: false,
      position: this.dialogPosition,
      hasBackdrop: false
    });

    ref.afterClosed().subscribe(result => {
      // Handle result from the operation/category dialog
      if (result?.action === 'finish' || result?.action === 'complete') {
        // Wizard complete — close intro dialog too and propagate result
        this.dialogRef.close(result);
      } else if (result?.action === 'cancel') {
        // Propagate cancel action
        this.dialogRef.close({ action: 'cancel' });
      } else if (result?.action === 'back') {
        // Show current dialog again when going back
        this.showCurrentDialog();
      }
    });
  }

  /** Hide current dialog container for smooth transitions */
  private hideCurrentDialog(): void {
    const pane = this.elementRef.nativeElement.closest('.cdk-overlay-pane');
    if (pane) {
      pane.style.display = 'none';
    }
  }

  /** Show current dialog container when returning from next dialog */
  private showCurrentDialog(): void {
    const pane = this.elementRef.nativeElement.closest('.cdk-overlay-pane');
    if (pane) {
      pane.style.display = '';
    }
  }
}
