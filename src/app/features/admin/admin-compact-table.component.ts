import { Component, ElementRef, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  AdminCompactColumn,
  ADMIN_COMPACT_MENU_STYLES,
  ADMIN_COMPACT_TABLE_STYLES,
  cellValue
} from './admin-compact-table.shared';

@Component({
  selector: 'app-admin-compact-table',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatProgressSpinnerModule],
  template: `
    <div *ngIf="loading" class="loading">
      <mat-spinner diameter="40"></mat-spinner>
      <p>{{ loadingMessage }}</p>
    </div>

    <div *ngIf="!loading && rows.length > 0" class="contact-tab-table" #tableWrap>
      <div class="table-scroll">
        <table class="footer-table admin-compact-table">
          <thead>
            <tr>
              <ng-container *ngIf="singleColumnWithMenu; else multiHeader">
                <th>{{ columns[0]?.header }}</th>
              </ng-container>
              <ng-template #multiHeader>
                <th *ngFor="let col of columns">{{ col.header }}</th>
                <th class="col-actions" aria-label="Actions"></th>
              </ng-template>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of rows">
              <ng-container *ngIf="singleColumnWithMenu; else multiRow">
                <td class="uom-cell">
                  <span class="uom-label">{{ format(row, columns[0]) }}</span>
                  <button
                    mat-icon-button
                    type="button"
                    [matMenuTriggerFor]="rowMenu"
                    (click)="selectRow(row); $event.stopPropagation()"
                    class="action-btn"
                    aria-label="Row actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </td>
              </ng-container>
              <ng-template #multiRow>
                <td *ngFor="let col of columns">{{ format(row, col) }}</td>
                <td class="col-actions">
                  <button
                    mat-icon-button
                    type="button"
                    [matMenuTriggerFor]="rowMenu"
                    (click)="selectRow(row); $event.stopPropagation()"
                    class="action-btn"
                    aria-label="Row actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </td>
              </ng-template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div *ngIf="!loading && rows.length === 0" class="no-data">
      <mat-icon>inbox</mat-icon>
      <p>{{ emptyMessage }}</p>
    </div>

    <mat-menu #rowMenu="matMenu">
      <button mat-menu-item (click)="onEdit(); $event.stopPropagation()">
        <mat-icon>edit</mat-icon>
        <span>Edit</span>
      </button>
      <button mat-menu-item (click)="onDelete(); $event.stopPropagation()" color="warn">
        <mat-icon>delete</mat-icon>
        <span>Delete</span>
      </button>
    </mat-menu>
  `,
  styles: [
    ADMIN_COMPACT_TABLE_STYLES,
    `
    .footer-table .uom-cell {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 4px 8px;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      white-space: normal;
    }

    .footer-table .uom-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    `,
    ADMIN_COMPACT_MENU_STYLES
  ]
})
export class AdminCompactTableComponent {
  @Input() columns: AdminCompactColumn[] = [];
  @Input() rows: Record<string, unknown>[] = [];
  @Input() loading = false;
  @Input() loadingMessage = 'Loading...';
  @Input() emptyMessage = 'No records found';
  @Input() singleColumnWithMenu = false;

  @ViewChild('tableWrap') tableWrap!: ElementRef<HTMLElement>;

  selectedRow: Record<string, unknown> | null = null;

  @Output() editRow = new EventEmitter<Record<string, unknown>>();
  @Output() deleteRow = new EventEmitter<Record<string, unknown>>();

  format(row: Record<string, unknown>, col?: AdminCompactColumn): string {
    return col ? cellValue(row, col) : '-';
  }

  selectRow(row: Record<string, unknown>): void {
    this.selectedRow = row;
  }

  onEdit(): void {
    if (this.selectedRow) {
      this.editRow.emit(this.selectedRow);
    }
  }

  onDelete(): void {
    if (this.selectedRow) {
      this.deleteRow.emit(this.selectedRow);
    }
  }

  getTableElement(): HTMLElement | undefined {
    return this.tableWrap?.nativeElement;
  }
}
