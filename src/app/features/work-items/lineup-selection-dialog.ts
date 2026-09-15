import { Component, Inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

export interface LineupBay {
  lineup: string;
  startBay: string;
  endBay: string;
  qty: number;
  partDescription: string;
}

export interface ByLineupSelectionData {
  projectNum: string;
  lineupBays: LineupBay[];
  stackDepth?: number;
  dialogPosition?: any;
}

@Component({
  selector: 'app-by-lineup-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatTableModule, MatCheckboxModule, MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title style="color: #8a4d00; font-weight: 600;">Lineup Selection ({{ data.projectNum }})</h2>
    <p style="font-size: 14px; color: #6b7280; margin: -12px 20px 0;">Select the lineups and bays for this work item.</p>

    

      <!-- Body -->
      <mat-dialog-content class="dialog-body">
        <table class="lineup-table">
          <thead>
            <tr>
              <th class="col-select"></th>
              <th class="col-lineup">LINEUP</th>
              <th class="col-startbay">START BAY</th>
              <th class="col-endbay">END BAY</th>
              <th class="col-qty">QTY</th>
              <th class="col-description">PART DESCRIPTION</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let bay of data.lineupBays; let i = index">
              <td class="col-select">
                <input type="checkbox" class="lineup-checkbox" (change)="toggleLineup(i)" />
              </td>
              <td class="col-lineup">
                <input class="cell-input" [(ngModel)]="bay.lineup" placeholder="Lineup..." (ngModelChange)="onRowEdit(i)" />
              </td>
              <td class="col-startbay">
                <input class="cell-input cell-input-center" [(ngModel)]="bay.startBay" placeholder="Start" (ngModelChange)="onRowEdit(i)" />
              </td>
              <td class="col-endbay">
                <input class="cell-input cell-input-center" [(ngModel)]="bay.endBay" placeholder="End" (ngModelChange)="onRowEdit(i)" />
              </td>
              <td class="col-qty">
                <input class="cell-input cell-input-center" type="number" min="0" [(ngModel)]="bay.qty" (ngModelChange)="onRowEdit(i)" />
              </td>
              <td class="col-description">
                <input class="cell-input" [(ngModel)]="bay.partDescription" placeholder="Part description..." (ngModelChange)="onRowEdit(i)" />
              </td>
            </tr>
          </tbody>
        </table>
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
  styles: [`\n    :host {
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
      min-height: 260px;
      max-height: 500px;
    }

    mat-dialog-actions {
      width: 700px;
    }

    /* Body */
    .dialog-body {
      flex: 1;
      padding: 20px 24px;
      overflow-y: auto;
    }

    /* Table */
    .lineup-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #d1d5db;
      font-size: 13px;
    }

    .lineup-table thead {
      background-color: #f3f4f6;
    }

    .lineup-table th {
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border: 1px solid #d1d5db;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.3px;
    }

    .lineup-table td {
      padding: 4px 6px;
      border: 1px solid #d1d5db;
      color: #374151;
    }

    .cell-input {
      width: 100%;
      border: none;
      background: transparent;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      color: #374151;
      padding: 6px 4px;
      box-sizing: border-box;
      outline: none;
    }

    .cell-input-center {
      text-align: center;
    }

    .cell-input:focus {
      background: #fff9f0;
      border-radius: 3px;
      box-shadow: inset 0 0 0 2px #ff9800;
    }

    .add-row-btn {
      margin-top: 8px;
      height: 30px;
      padding: 0 14px;
      border-radius: 6px;
      border: 1.5px dashed #ff9800;
      background: transparent;
      font-size: 12px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-weight: 500;
      color: #ff9800;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .add-row-btn:hover {
      background: #f1ece5;
    }

    .lineup-table tbody tr:hover {
      background-color: #f1ece5;
    }

    .col-select {
      width: 40px;
      text-align: center;
    }

    .col-lineup {
      width: 100px;
    }

    .col-startbay {
      width: 100px;
      text-align: center;
    }

    .col-endbay {
      width: 100px;
      text-align: center;
    }

    .col-qty {
      width: 80px;
      text-align: center;
    }

    .col-description {
      flex: 1;
    }

    .lineup-checkbox {
      accent-color: #ff9800;
      width: 16px;
      height: 16px;
      cursor: pointer;
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

    .dialog-btn:hover:not([disabled]) {
      border-color: #ff9800;
      color: #ff9800;
      background: #fff3e0;
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

    .back-btn:hover:not([disabled]) {
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
  `]
})
export class ByLineupDialog {
  selectedLineups: Set<number> = new Set();
  stackDepth: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ByLineupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ByLineupSelectionData,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) {
    // Initialize stack depth from data, default to 0
    this.stackDepth = data.stackDepth ?? 0;

    // Ensure only one row exists by default
    this.data.lineupBays = [{ lineup: '', startBay: '', endBay: '', qty: 0, partDescription: '' }];
  }

  onRowEdit(index: number): void {
    // Automatically add a new row if editing the last row
    if (index === this.data.lineupBays.length - 1) {
      this.data.lineupBays.push({ lineup: '', startBay: '', endBay: '', qty: 0, partDescription: '' });
    }
  }

  toggleLineup(index: number): void {
    if (this.selectedLineups.has(index)) {
      this.selectedLineups.delete(index);
    } else {
      this.selectedLineups.add(index);
    }
  }

  onBack(): void {
    this.dialogRef.close({ action: 'back' });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onNext(): void {
    const selectedData = this.data.lineupBays.filter((_, i) => this.selectedLineups.has(i));
    // Close this dialog and move to next step
    this.dialogRef.close({ action: 'next', selectedLineups: Array.from(this.selectedLineups), lineupData: selectedData });
  }
}
