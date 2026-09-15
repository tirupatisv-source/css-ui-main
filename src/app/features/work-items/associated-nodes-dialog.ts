import { Component, Inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { WorkItemCompletionDialog } from './work-item-completion-dialog';

export interface AssociatedNodesData {
  projectNum: string;
  stackDepth?: number;
}

@Component({
  selector: 'app-associated-nodes-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatDividerModule],
  template: `
    <div class="dialog-shell">
      <!-- Header -->
      <div class="dialog-header">
        <div class="dialog-title">Associated Nodes Entry ({{ data.projectNum }})</div>
      </div>

      <mat-divider></mat-divider>

      <!-- Body -->
      <div class="dialog-body">
        <textarea class="nodes-textarea" [(ngModel)]="nodesText" placeholder="Enter associated nodes..."></textarea>
      </div>

      <mat-divider></mat-divider>

      <!-- Footer -->
      <div class="dialog-footer">
        <div class="footer-right">
          <button class="dialog-btn back-btn" (click)="onBack()">Back</button>
          <button class="dialog-btn next-btn" (click)="onNext()">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-shell {
      display: flex;
      flex-direction: column;
      width: 650px;
      min-height: 350px;
      background: #ffffff;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    }

    /* Header */
    .dialog-header {
      padding: 20px 24px 14px;
    }

    .dialog-title {
      font-size: 16px;
      font-weight: 600;
      color: #8a4d00;
      margin: 0;
    }

    /* Body */
    .dialog-body {
      flex: 1;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
    }

    .nodes-textarea {
      flex: 1;
      padding: 12px;
      border: 1.5px solid #d1d5db;
      border-radius: 6px;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      color: #374151;
      resize: none;
      transition: border-color 0.18s ease;
    }

    .nodes-textarea:focus {
      outline: none;
      border-color: #ff9800;
      box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.15);
    }

    /* Footer */
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 12px 24px;
      background: #f9fafb;
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

    .dialog-btn:hover:not([disabled]) {
      border-color: #ff9800;
      color: #ff9800;
      background: #fff3e0;
    }

    .back-btn, .next-btn {
      border-color: #ff9800;
      color: #ff9800;
      background: #fff3e0;
    }

    .back-btn:hover, .next-btn:hover {
      background: #ff9800 !important;
      color: #ffffff !important;
    }
  `]
})
export class AssociatedNodesDialog {
  nodesText = '';

  constructor(
    public dialogRef: MatDialogRef<AssociatedNodesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AssociatedNodesData,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) {}

  /** Read current dialog's screen position and return next dialog's position offset by 40px right / 20px down */
  private getNextDialogPosition(): { left?: string; top?: string } {
    const pane = this.elementRef.nativeElement.closest('.cdk-overlay-pane');
    if (pane) {
      const rect = pane.getBoundingClientRect();
      return { left: `${rect.left + 40}px`, top: `${rect.top + 20}px` };
    }
    return {};
  }

  onBack(): void {
    this.dialogRef.close({ action: 'back' });
  }

  onNext(): void {
    // Open Work Item Completion dialog
    const ref = this.dialog.open(WorkItemCompletionDialog, {
      data: { projectNum: this.data.projectNum },
      disableClose: false,
      autoFocus: false,
      position: this.getNextDialogPosition(),
      backdropClass: 'stacked-wizard-backdrop'
    });
    ref.afterClosed().subscribe(result => {
      if (result?.action === 'back') {
        // Return to associated nodes dialog - stay open
      } else if (result?.action === 'finish') {
        // Close this dialog and propagate finish up the chain
        this.dialogRef.close({ action: 'finish', nodesText: this.nodesText });
      }
    });
  }
}
