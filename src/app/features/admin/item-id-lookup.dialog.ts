import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../core/services/admin.service';
import { MasterPart } from '../../core/models/models';

export interface LookupResult {
  vendor: string;
  partNumber: string;
  sapItemId: string;
  description: string;
}

/**
 * Item ID Lookup Dialog
 * Converted from VB6: frmItemIDLookup
 * 
 * Displays master parts for selection with 4 columns:
 * - Vendor
 * - Part Number
 * - SAP Item ID
 * - Description
 * 
 * Admin-only feature. First row is selected by default.
 */
@Component({
  selector: 'app-item-id-lookup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title>Item ID Lookup</h2>
    
    <mat-dialog-content>
      <div class="results-container">
        <table mat-table [dataSource]="resultsDataSource" class="results-table">
          <!-- Vendor -->
          <ng-container matColumnDef="vendor">
            <th mat-header-cell *matHeaderCellDef>Vendor</th>
            <td mat-cell *matCellDef="let row">{{ row.vendor }}</td>
          </ng-container>

          <!-- Part Number -->
          <ng-container matColumnDef="partNumber">
            <th mat-header-cell *matHeaderCellDef>Part Number</th>
            <td mat-cell *matCellDef="let row">{{ row.partNumber }}</td>
          </ng-container>

          <!-- SAP Item ID -->
          <ng-container matColumnDef="sapItemId">
            <th mat-header-cell *matHeaderCellDef>SAP Item ID</th>
            <td mat-cell *matCellDef="let row" class="item-id-cell">{{ row.sapItemId }}</td>
          </ng-container>

          <!-- Description -->
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let row" class="desc-cell">{{ row.description }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="resultsColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: resultsColumns;"
              [class.selected-row]="row === selectedResult"
              (click)="selectedResult = row"></tr>
        </table>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button class="btn-close" (click)="onCancel()">Close</button>
      <button mat-raised-button class="btn-select" 
              (click)="onSelect()" 
              [disabled]="!selectedResult">
        Select
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-height: 400px;
      padding: 16px;
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }

    .results-container {
      width: 100%;
      max-height: 500px;
      overflow: auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background: #fff;
    }

    .results-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: separate;
      border-spacing: 0;
    }

    .results-table th.mat-mdc-header-cell {
      z-index: 1;
      background: #f5f5f5;
      color: #8a4d00;
      font-weight: 600;
      font-size: 12px;
      white-space: nowrap;
      border-bottom: 2px solid #ff9800;
      padding: 10px 12px;
      position: sticky;
      top: 0;
      text-align: left;
      box-sizing: border-box;
    }

    .results-table td.mat-mdc-cell {
      font-size: 12px;
      padding: 8px 12px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: top;
      box-sizing: border-box;
      word-break: break-word;
      white-space: normal;
      overflow-wrap: break-word;
    }

    .results-table tr.mat-mdc-row {
      cursor: pointer;
    }

    .results-table tr.mat-mdc-row:hover td.mat-mdc-cell {
      background: #fff8f0;
    }

    .results-table tr.selected-row td.mat-mdc-cell {
      background: #fff3e0;
    }

    .results-table tr.selected-row:hover td.mat-mdc-cell {
      background: #ffe8cc;
    }

    .results-table .mat-column-vendor {
      width: 22%;
    }

    .results-table .mat-column-partNumber {
      width: 22%;
    }

    .results-table .mat-column-sapItemId {
      width: 18%;
    }

    .results-table .mat-column-description {
      width: 38%;
    }

    .item-id-cell {
      font-weight: 600;
      color: #ff9800;
    }

    mat-dialog-actions {
      padding: 12px 0 0;
      margin: 0;
      gap: 10px;
    }

    .btn-close {
      
      color: #31302f;
      background: #fff;
      font-weight: 600;
    }

    .btn-close:hover {
      background: #cac8c6;
    }

    .btn-select {
      background: #ff9800;
      color: #fff;
      font-weight: 600;
    }

    .btn-select:hover {
      background: #e68900;
    }

    .btn-select[disabled] {
      background: #ffd699;
      color: #fff;
    }

    button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Dark theme support */
    :host-context([data-theme="dark"]) .results-container {
      background: #1e1e1e;
      border-color: #424242;
    }

    :host-context([data-theme="dark"]) .results-table th.mat-mdc-header-cell {
      background: #2a2a2a;
      border-bottom-color: #ff9800;
    }

    :host-context([data-theme="dark"]) .results-table td.mat-mdc-cell {
      color: #e0e0e0;
      border-bottom-color: #2a2a2a;
    }

    :host-context([data-theme="dark"]) .results-table tr.mat-mdc-row:hover td.mat-mdc-cell {
      background: #2a1a08;
    }

    :host-context([data-theme="dark"]) .results-table tr.selected-row td.mat-mdc-cell {
      background: #3a2410;
    }

    :host-context([data-theme="dark"]) .btn-close {
      border-color: #ff9800;
      color: #ffcc80;
      background: #1e1e1e;
    }

    :host-context([data-theme="dark"]) .btn-close:hover {
      background: #2a1a08;
    }

    :host-context([data-theme="dark"]) .btn-select {
      background: #ff9800;
      color: #1e1e1e;
    }

    /* Hide Material pseudo-checkbox */
    ::ng-deep .mat-pseudo-checkbox {
      display: none !important;
    }
  `]
})
export class ItemIdLookupDialog implements OnInit {
  
  searchResults: LookupResult[] = [];
  resultsDataSource = new MatTableDataSource<LookupResult>([]);
  resultsColumns = ['vendor', 'partNumber', 'sapItemId', 'description'];
  selectedResult: LookupResult | null = null;

  constructor(
    private dialogRef: MatDialogRef<ItemIdLookupDialog>,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { parts: MasterPart[] }
  ) {}

  ngOnInit(): void {
    // Convert MasterPart[] to LookupResult[] format
    this.searchResults = (this.data?.parts || []).map(p => ({
      vendor: p.vendorName || '',
      partNumber: p.partNum || '',
      sapItemId: p.itemId || '',
      description: p.partDesc || ''
    }));

    this.resultsDataSource.data = this.searchResults;

    // Select first row by default
    if (this.searchResults.length > 0) {
      this.selectedResult = this.searchResults[0];
    }
  }

  /**
   * Admin selects a result
   */
  onSelect(): void {
    if (this.selectedResult) {
      this.dialogRef.close(this.selectedResult);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
