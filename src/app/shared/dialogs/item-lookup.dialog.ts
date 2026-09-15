import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ItemLookupResult {
  itemId: string;
  description: string;
  orderParameter: string;
  manufacturer: string;
}

/**
 * Item ID lookup dialog — converted from VB6 frmItemIDLookup.
 * Queries Supply Logistics API for item details by item ID or search keyword.
 */
@Component({
  selector: 'app-item-lookup',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatTableModule, MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>Item ID Lookup</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Search by Item ID or keyword</mat-label>
        <input matInput [(ngModel)]="searchText" (keyup.enter)="search()" />
      </mat-form-field>

      @if (loading()) {
        <div class="spinner-wrapper"><mat-spinner diameter="32"></mat-spinner></div>
      }

      @if (results().length) {
        <table mat-table [dataSource]="results()" class="full-width">
          <ng-container matColumnDef="itemId">
            <th mat-header-cell *matHeaderCellDef>Item ID</th>
            <td mat-cell *matCellDef="let row">{{ row.itemId }}</td>
          </ng-container>
          <ng-container matColumnDef="description">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let row">{{ row.description }}</td>
          </ng-container>
          <ng-container matColumnDef="orderParameter">
            <th mat-header-cell *matHeaderCellDef>Order Param</th>
            <td mat-cell *matCellDef="let row">{{ row.orderParameter }}</td>
          </ng-container>
          <ng-container matColumnDef="manufacturer">
            <th mat-header-cell *matHeaderCellDef>Manufacturer</th>
            <td mat-cell *matCellDef="let row">{{ row.manufacturer }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"
              [class.selected]="selectedItem()?.itemId === row.itemId"
              (click)="selectItem(row)"
              (dblclick)="confirmSelection()"></tr>
        </table>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="search()" [disabled]="loading() || !searchText">Search</button>
      <button mat-raised-button color="primary" [disabled]="!selectedItem()"
              (click)="confirmSelection()">Select</button>
      <button mat-button mat-dialog-close>Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .spinner-wrapper { display: flex; justify-content: center; padding: 12px; }
    tr.selected { background: rgba(255, 152, 0, 0.08); }
    tr.mat-mdc-row:hover { background: rgba(255, 152, 0, 0.04); cursor: pointer; }
  `]
})
export class ItemLookupDialog {
  searchText = '';
  columns = ['itemId', 'description', 'orderParameter', 'manufacturer'];

  loading = signal(false);
  results = signal<ItemLookupResult[]>([]);
  selectedItem = signal<ItemLookupResult | null>(null);

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<ItemLookupDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  search(): void {
    this.loading.set(true);
    this.results.set([]);
    this.selectedItem.set(null);

    this.http.get<ItemLookupResult[]>(
      `${environment.apiUrl}/api/lookup/items`, { params: { q: this.searchText } }
    ).subscribe({
      next: (res) => { this.results.set(res); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  selectItem(item: ItemLookupResult): void {
    this.selectedItem.set(item);
  }

  confirmSelection(): void {
    if (this.selectedItem()) {
      this.dialogRef.close(this.selectedItem());
    }
  }
}
