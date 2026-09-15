import { Component, Inject, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { WorkItemCompletionDialog } from './work-item-wizard-completion-dialog';

export interface AssociatedNodesData {
  projectNum: string;
  stackDepth?: number;
  dialogPosition?: any;
  nodesText?: string;
}

@Component({
  selector: 'app-associated-nodes-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatDividerModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title style="color: #8a4d00; font-weight: 600;">Associated Notes ({{ data.projectNum }})</h2>

    

      <!-- Body -->
      <mat-dialog-content class="dialog-body">
        <mat-form-field appearance="outline" class="notes-field search-field">
          <mat-label>Associated Notes</mat-label>
          <textarea matInput class="nodes-textarea" [(ngModel)]="nodesText"></textarea>
        </mat-form-field>
      </mat-dialog-content>

      

      <!-- Footer -->
      <mat-dialog-actions class="dialog-footer">
        <div class="footer-right">
          <button class="dialog-btn cancel-btn" (click)="onCancel()">Cancel</button>
          <button class="dialog-btn back-btn" (click)="onBack()">Back</button>
          <button class="dialog-btn next-btn" (click)="onNext()">Next</button>
          <!-- <button class="dialog-btn finish-btn" [disabled]="true">Finish</button> -->
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
      min-height: 273px;
      max-height: 512px;
    }

    mat-dialog-actions {
      width: 700px;
    }

    /* Body */
    .dialog-body {
      flex: 1;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
    }

    .notes-field {
      width: 100%;
      margin-top: 12px;
    }

    .notes-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .notes-field ::ng-deep .mat-mdc-form-field-infix {
      min-height: 252px !important;
      padding-top: 14px !important;
      padding-bottom: 8px !important;
    }

    .search-field ::ng-deep .mdc-notched-outline__leading,
    .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__leading {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-left: 2px solid #ff9800 !important;
      background-clip: padding-box !important;
      box-shadow: none !important;
      min-width: 12px !important;
      width: 12px !important;
      border-radius: 4px 0 0 4px !important;
      height: 100%;
    }

    .search-field ::ng-deep .mdc-notched-outline__notch,
    .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-bottom: 2px solid #ff9800 !important;
      border-left: none !important;
      border-right: none !important;
    }

    .search-field ::ng-deep .mdc-notched-outline__trailing,
    .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__trailing {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-right: 2px solid #ff9800 !important;
      border-radius: 0 4px 4px 0 !important;
    }

    .search-field ::ng-deep textarea.mat-mdc-input-element,
    .search-field ::ng-deep input.mat-mdc-input-element {
      padding-left: 10px !important;
      border-radius: 4px !important;
    }

    .search-field ::ng-deep .mdc-line-ripple {
      display: none !important;
    }

    :host-context([data-theme="dark"]) .search-field ::ng-deep .mdc-notched-outline__leading,
    :host-context([data-theme="dark"]) .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__leading {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-left: 2px solid #ff9800 !important;
    }

    :host-context([data-theme="dark"]) .search-field ::ng-deep .mdc-notched-outline__notch,
    :host-context([data-theme="dark"]) .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-bottom: 2px solid #ff9800 !important;
    }

    :host-context([data-theme="dark"]) .search-field ::ng-deep .mdc-notched-outline__trailing,
    :host-context([data-theme="dark"]) .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__trailing {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-right: 2px solid #ff9800 !important;
    }

    .nodes-textarea {
      width: 100%;
      min-height: 220px;
      padding: 10px 10px 10px 12px;
      border: none;
      border-radius: 0;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      color: #374151;
      line-height: 1.4;
      resize: none;
      background: transparent;
      box-sizing: border-box;
      transition: border-color 0.18s ease;
      overflow: auto;
    }

    .nodes-textarea:focus {
      outline: none;
      box-shadow: none;
    }

    /* Footer */
    .dialog-footer {
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
      border-color: #f1ece5;
      color: #374151;
      background: #f1ece5;
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
      border-color: #ff9800;
      color: #ffffff;
      background: #ff9800;
    }
    .next-btn:hover {
      background: #f57c00 !important;
      color: #ffffff !important;
    }

    

    .finish-btn:hover, .finish-btn:hover:not([disabled]) {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `]
})
export class AssociatedNodesDialog implements OnInit {
  nodesText = '';

  constructor(
    public dialogRef: MatDialogRef<AssociatedNodesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AssociatedNodesData,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Pre-fill nodesText if provided (edit mode)
    if (this.data.nodesText) {
      console.log('AssociatedNodesDialog ngOnInit - Setting nodesText:', this.data.nodesText);
      this.nodesText = this.data.nodesText;
    } else {
      console.log('AssociatedNodesDialog ngOnInit - No nodesText provided in data');
    }
  }

  onBack(): void {
    this.dialogRef.close({ action: 'back' });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onNext(): void {
    // Just close and return notes, let wizard handle next dialog
    this.dialogRef.close({ action: 'finish', nodesText: this.nodesText });
  }
}
