import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

export interface WiNotesDialogData {
  projectNum: string;
  workItemNum?: string | number;
  notes?: string;
  workItems?: any[];
  mode?: 'single' | 'all';
}

@Component({
  selector: 'app-wi-notes-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title style="color: #8a4d00; font-weight: 600;">
      <ng-container *ngIf="isSingleMode()">
        Work Items Notes for #WI {{ data.workItemNum}}
      </ng-container>
      <ng-container *ngIf="isAllMode()">
        All Work Items Notes #WI({{ data.projectNum }}) 
      </ng-container>
    </h2>

    <mat-divider></mat-divider>

    <!-- Single Mode: Edit notes for selected work item -->
    <ng-container *ngIf="isSingleMode()">
      <mat-dialog-content class="wi-notes-body">
        <mat-form-field appearance="outline" class="notes-field">
          <mat-label>Notes</mat-label>
          <textarea matInput [(ngModel)]="notes" rows="10" wrap="soft" placeholder="Enter work item notes..." class="notes-textarea"></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-divider></mat-divider>

      <mat-dialog-actions class="wi-notes-footer">
        <button mat-button class="btn-cancel" (click)="cancel()">Cancel</button>
        <button mat-raised-button class="btn-save" (click)="save()">Save</button>
      </mat-dialog-actions>
    </ng-container>

    <!-- All Mode: Display all work items' notes in read-only mode -->
    <ng-container *ngIf="isAllMode()">
      <mat-dialog-content class="wi-notes-body-all">
        <div class="all-notes-container">
          <div *ngFor="let item of displayItems()" class="work-item-note-block">
            <div class="work-item-header">
              <strong>Work Item #{{ item.workItemNum }}<ng-container *ngIf="item.workOpDesc"> - {{ item.workOpDesc }}</ng-container></strong>
            </div>
            <div class="work-item-notes-text">{{ item.workItemText || '(No notes)' }}</div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-divider></mat-divider>

      <mat-dialog-actions class="wi-notes-footer">
        <button mat-raised-button class="btn-close" (click)="close()">Close</button>
      </mat-dialog-actions>
    </ng-container>
    `,
  styles: [`
    :host {
      display: block;
    }

    h2 {
      width: 800px;
    }

    mat-dialog-content {
      width: 800px;
      max-height: 500px;
    }

    .wi-notes-body-all {
      width: 800px;
      max-height: 450px;
      overflow-y: auto;
      padding: 20px 24px 8px;
    }

    mat-dialog-actions {
      width: 800px;
    }

    .wi-notes-body {
      padding: 20px 24px 8px;
      display: flex;
      flex-direction: column;
    }

    .notes-field {
      width: 100%;
      margin-top: 6px;
    }

    .notes-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .notes-field ::ng-deep .mdc-notched-outline__leading,
    .notes-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__leading {
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

    .notes-field ::ng-deep .mdc-notched-outline__notch,
    .notes-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-bottom: 2px solid #ff9800 !important;
      border-left: none !important;
      border-right: none !important;
    }

    .notes-field ::ng-deep .mdc-notched-outline__trailing,
    .notes-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__trailing {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-right: 2px solid #ff9800 !important;
      border-radius: 0 4px 4px 0 !important;
    }

    .notes-field ::ng-deep textarea.mat-mdc-input-element,
    .notes-field ::ng-deep input.mat-mdc-input-element {
      padding-left: 10px !important;
      padding-right: 10px !important;
      border-radius: 4px !important;
    }

    .notes-field ::ng-deep .mdc-line-ripple {
      display: none !important;
    }

    .notes-textarea {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 13px;
      line-height: 1.5;
      resize: none;
    }

    .all-notes-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .work-item-note-block {
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 12px;
      background-color: #f9f9f9;
    }

    .work-item-header {
      color: #8a4d00;
      font-weight: 600;
      margin-bottom: 8px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 6px;
    }

    .work-item-notes-text {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
    }
    

    .wi-notes-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 12px 24px 16px;
    }

    .btn-cancel {
      color: #ff9800;
      border: none;
      border-radius: 6px;
      background: transparent;
    }

    .btn-cancel:hover {
      background: rgba(25, 118, 210, 0.08) !important;
      color: #ff9800 !important;
    }

    .btn-close {
      background-color: #ff9800 !important;
      color: #ffffff !important;
      border-radius: 6px;
    }

    .btn-close:hover {
      background-color: #f57c00 !important;
    }

    .btn-save {
      background-color: #ff9800 !important;
      color: #ffffff !important;
      border-radius: 6px;
    }

    .btn-save:hover {
      background-color: #f57c00 !important;
    }
  `]
})
export class WiNotesDialog {
  notes = '';
  displayItems = signal<any[]>([]);

  constructor(
    public dialogRef: MatDialogRef<WiNotesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WiNotesDialogData
  ) {
    // Initialize based on mode
    if (this.isSingleMode()) {
      this.notes = data.notes || '';
    } else if (this.isAllMode()) {
      this.displayItems.set(data.workItems || []);
    }
  }

  isSingleMode(): boolean {
    return this.data.mode === 'single' || !this.data.mode;
  }

  isAllMode(): boolean {
    return this.data.mode === 'all';
  }

  save(): void {
    this.dialogRef.close({ action: 'save', notes: this.notes });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
