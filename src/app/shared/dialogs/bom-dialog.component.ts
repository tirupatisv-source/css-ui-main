import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ExportBomDialogComponent } from '../../features/reports/export-bom-dialog.component';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

export interface BOMItem {
  itemId: string;
  oracleItemId: string;
  partDesc: string;
  partNum: string;
  vendor: string;
  mfr: string;
  quantity: number;
  uom: string;
  cost: number;
}

/**
 * Dialog for displaying and exporting Bill of Materials.
 * Converted from VB6: frmRptBom
 * Shows all project BOM items in a grid with sorting options and export functionality.
 */
@Component({
  selector: 'app-bom-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatTableModule, MatSortModule, MatFormFieldModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatRadioModule
  ],
  template: `
    <h2 mat-dialog-title>Bill of Materials</h2>

    <mat-dialog-content class="dialog-content-wrapper">
      <!-- Sort By Frame -->
      <div class="sort-frame">
        <label class="sort-label">Sort By:</label>
        <mat-radio-group [(ngModel)]="sortBy" (change)="applySorting()">
          <mat-radio-button value="partDesc">Description</mat-radio-button>
          <mat-radio-button value="partNum">Part Number</mat-radio-button>
          <mat-radio-button value="vendor">Vendor</mat-radio-button>
          <mat-radio-button value="mfr">Manufacturer</mat-radio-button>
          <mat-radio-button value="quantity">Quantity</mat-radio-button>
          <mat-radio-button value="uom">UOM</mat-radio-button>
          <mat-radio-button value="cost">Cost</mat-radio-button>
        </mat-radio-group>
      </div>

      <!-- BOM Grid - Only this scrolls -->
      <div class="table-scroll-container">
        @if (loading()) {
          <div class="spinner-wrapper">
            <mat-spinner></mat-spinner>
          </div>
        } @else {
          <table mat-table [dataSource]="dataSource" matSort (matSortChange)="onSort($event)" class="bom-table">
            <!-- SAP Item Id Column -->
            <ng-container matColumnDef="itemId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>SAP Item Id</th>
              <td mat-cell *matCellDef="let item">{{ item.itemId || '-' }}</td>
            </ng-container>

            <!-- Oracle Item Id Column -->
            <ng-container matColumnDef="oracleItemId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Oracle Item Id</th>
              <td mat-cell *matCellDef="let item">{{ item.oracleItemId || '-' }}</td>
            </ng-container>

            <!-- Part Description Column -->
            <ng-container matColumnDef="partDesc">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Part Description</th>
              <td mat-cell *matCellDef="let item">{{ item.partDesc }}</td>
            </ng-container>

            <!-- Part Number Column -->
            <ng-container matColumnDef="partNum">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Part Number</th>
              <td mat-cell *matCellDef="let item">{{ item.partNum }}</td>
            </ng-container>

            <!-- Vendor Column -->
            <ng-container matColumnDef="vendor">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Vendor</th>
              <td mat-cell *matCellDef="let item">{{ item.vendor || '-' }}</td>
            </ng-container>

            <!-- Manufacturer Column -->
            <ng-container matColumnDef="mfr">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Manufacturer</th>
              <td mat-cell *matCellDef="let item">{{ item.mfr || '-' }}</td>
            </ng-container>

            <!-- Quantity Column -->
            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Quantity</th>
              <td mat-cell *matCellDef="let item" class="number-cell">{{ item.quantity }}</td>
            </ng-container>

            <!-- UOM Column -->
            <ng-container matColumnDef="uom">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>UOM</th>
              <td mat-cell *matCellDef="let item">{{ item.uom || '-' }}</td>
            </ng-container>

            <!-- Cost Column -->
            <ng-container matColumnDef="cost">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Cost</th>
              <td mat-cell *matCellDef="let item" class="number-cell">{{ item.cost | currency }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        }
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Close</button>
      <button mat-raised-button color="warn" (click)="exportToHTML()" [disabled]="loading()">
        <mat-icon>download</mat-icon> Export to HTML
      </button>
      <button mat-raised-button color="primary" (click)="exportForSAP()" [disabled]="loading()">
        <mat-icon>download</mat-icon> Export for SAP
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    h2[mat-dialog-title] {
      margin: 0 0 0.3rem 0;
      color: #8a4d00;
      padding-left: 33px;
      padding-top: 0;
      padding-bottom: 0;
      padding-right: 0;
    }

    .dialog-content-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      padding: 0;
      margin: 10px;
      overflow: hidden;
    }

    .sort-frame {
      padding: 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      flex-shrink: 0;
    }

    .sort-label {
      font-weight: 500;
      margin-right: 8px;
    }

    mat-radio-group {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .table-scroll-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
      /* margin: 10px; */
    }

    .bom-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    .bom-table th {
      background: #f5f5f5;
      font-weight: 600;
      padding: 12px 16px;
      text-align: left;
      border-bottom: 2px solid #ddd;
      position: sticky;
      top: 0;
      z-index: 1;
    }

    .bom-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      word-wrap: break-word;
    }

    .bom-table tr:hover {
      background: #fafafa;
    }

    .number-cell {
      text-align: right;
      font-family: monospace;
    }

    .spinner-wrapper {
      display: flex;
      justify-content: center;
      padding: 80px 24px;
      height: 100%;
      align-items: center;
    }

    mat-dialog-content {
      padding: 0;
      margin: 0;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #ddd;
      gap: 8px;
      flex-shrink: 0;
      margin-top: auto;
    }

    button[mat-raised-button] {
      gap: 8px;
    }

    /* ---- Dark mode ---- */
    :host-context([data-theme="dark"]) h2[mat-dialog-title] {
      color: #ff9800 !important;
    }

    :host-context([data-theme="dark"]) .sort-frame {
      background: #1e1e1e !important;
      border-bottom-color: #424242 !important;
    }

    :host-context([data-theme="dark"]) .sort-label {
      color: #ff9800 !important;
    }

    :host-context([data-theme="dark"]) .bom-table th {
      background: #2a1a08 !important;
      color: #ff9800 !important;
      border-bottom-color: #424242 !important;
    }

    :host-context([data-theme="dark"]) .bom-table td {
      background: #1e1e1e !important;
      color: #e0e0e0 !important;
      border-bottom-color: #333 !important;
    }

    :host-context([data-theme="dark"]) .bom-table tr:hover td {
      background: #2a2520 !important;
    }

    :host-context([data-theme="dark"]) .table-scroll-container {
      background: #121212 !important;
    }

    :host-context([data-theme="dark"]) mat-dialog-actions {
      background: #121212 !important;
      border-top-color: #424242 !important;
    }
  `]
})
export class BOMDialogComponent implements OnInit {
    // Add a new BOM item to the table
    addBOMItem(item: Partial<BOMItem>) {
      const newItem: BOMItem = {
        itemId: item.itemId || '-',
        oracleItemId: item.oracleItemId || '-',
        partDesc: item.partDesc || '-',
        partNum: item.partNum || '-',
        vendor: item.vendor || '-',
        mfr: item.mfr || '-',
        quantity: item.quantity ?? 0,
        uom: item.uom || '-',
        cost: item.cost ?? 0
      };
      const items = [...this.bomItems(), newItem];
      this.bomItems.set(items);
      this.dataSource.data = items;
      this.applySorting();
    }
  projectNum = '';
  loading = signal(false);
  sortBy = 'partDesc';

  bomItems = signal<BOMItem[]>([]);
  dataSource = new MatTableDataSource<BOMItem>([]);
  displayedColumns = ['itemId', 'oracleItemId', 'partDesc', 'partNum', 'vendor', 'mfr', 'quantity', 'uom', 'cost'];

  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<BOMDialogComponent>);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadBOM();
  }

  loadBOM(): void {
    this.loading.set(true);
    this.http.get<BOMItem[]>(`${environment.apiUrl}/api/projects/${this.projectNum}/bom`)
      .subscribe({
        next: (items) => {
          this.bomItems.set(items);
          this.dataSource.data = items;
          this.applySorting();
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to load BOM:', err);
          this.snackBar.open('Failed to load Bill of Materials', 'Close', { duration: 4000 });
          this.loading.set(false);
        }
      });
  }

  applySorting(): void {
    const items = [...this.bomItems()];
    
    switch (this.sortBy) {
      case 'partNum':
        items.sort((a, b) => (a.partNum || '').localeCompare(b.partNum || ''));
        break;
      case 'vendor':
        items.sort((a, b) => (a.vendor || '').localeCompare(b.vendor || ''));
        break;
      case 'mfr':
        items.sort((a, b) => (a.mfr || '').localeCompare(b.mfr || ''));
        break;
      case 'quantity':
        items.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        break;
      case 'uom':
        items.sort((a, b) => (a.uom || '').localeCompare(b.uom || ''));
        break;
      case 'cost':
        items.sort((a, b) => (b.cost || 0) - (a.cost || 0));
        break;
      case 'partDesc':
      default:
        items.sort((a, b) => (a.partDesc || '').localeCompare(b.partDesc || ''));
    }

    this.dataSource.data = items;
  }

  onSort(sort: Sort): void {
    const items = [...this.bomItems()];
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = items;
      return;
    }

    this.dataSource.data = items.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      const aValue = (a as any)[sort.active];
      const bValue = (b as any)[sort.active];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return isAsc ? aValue - bValue : bValue - aValue;
      }

      return isAsc
        ? (aValue || '').toString().localeCompare((bValue || '').toString())
        : (bValue || '').toString().localeCompare((aValue || '').toString());
    });
  }

  exportToHTML(): void {
    this.loading.set(true);
    this.http.post(`${environment.apiUrl}/api/projects/${this.projectNum}/bom/export-html`,
      { items: this.dataSource.data },
      { responseType: 'blob' }
    ).subscribe({
      next: (blob) => {
        this.loading.set(false);
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = `BOM_${this.projectNum}.html`;
        a.click();
        this.snackBar.open('BOM exported to HTML', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Export failed:', err);
        this.snackBar.open('Export failed', 'Close', { duration: 4000 });
      }
    });
  }

  exportForSAP(): void {
    this.dialog.open(ExportBomDialogComponent, {
      width: '1200px',
      maxWidth: '95vw',
      height: '95vh',
      maxHeight: '95vh',
      disableClose: false,
      data: { projectNumber: this.projectNum },
      panelClass: ['themed-dialog']
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
