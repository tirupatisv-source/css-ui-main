import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { AdminService } from '@core/services/admin.service';
import { AdminCompactTableComponent } from './admin-compact-table.component';
import {
  AdminCompactColumn,
  ADMIN_ROUTE_COLUMN_COUNT,
  emitAdminPagination,
  exportCsv,
  getPaginatedSlice,
  measureAdminDialogWidth
} from './admin-compact-table.shared';

@Component({
  selector: 'app-admin-runlist-association',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, AdminCompactTableComponent],
  template: `
    <div class="admin-container">
      <app-admin-compact-table
        #compactTable
        [columns]="columns"
        [rows]="getPaginatedData()"
        [loading]="isLoading"
        loadingMessage="Loading runlist associations..."
        emptyMessage="No runlist associations found"
        (editRow)="editRecord($event)"
        (deleteRow)="deleteRecord($event)">
      </app-admin-compact-table>
    </div>
  `,
  styles: [`:host { display: block; width: 100%; }`]
})
export class RunlistAssociationComponent implements OnInit {
  @ViewChild('compactTable') compactTable!: AdminCompactTableComponent;

  @Output() paginationChange = new EventEmitter<{ totalItems: number; pageSize: number; pageIndex: number }>();
  @Output() dialogWidthChange = new EventEmitter<number>();

  readonly tableColumnCount = ADMIN_ROUTE_COLUMN_COUNT['runlist-association'];

  columns: AdminCompactColumn[] = [
    { key: 'runlistCategory', header: 'Run List Category' },
    { key: 'fromPartDesc', header: 'Run From Part' },
    { key: 'toPartDesc', header: 'Run To Part' }
  ];

  isLoading = false;
  allData: Record<string, unknown>[] = [];
  filteredData: Record<string, unknown>[] = [];
  pageSize = 10;
  currentPageIndex = 0;

  constructor(
    private snackBar: MatSnackBar,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.adminService.getRunListAssociations().subscribe({
      next: (data) => {
        this.allData = (data || []) as unknown as Record<string, unknown>[];
        this.filteredData = [...this.allData];
        this.currentPageIndex = 0;
        this.isLoading = false;
        this.emitPaginationChange(true);
        this.cdr.markForCheck();
      },
      error: () => {
        this.snackBar.open('Failed to load runlist associations', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  emitPaginationChange(resizeDialog = false): void {
    emitAdminPagination(
      this.filteredData,
      this.pageSize,
      this.currentPageIndex,
      this.paginationChange,
      this.dialogWidthChange,
      () => this.compactTable?.tableWrap,
      this.tableColumnCount + 1,
      resizeDialog
    );
  }

  measureDialogWidth(): number {
    return measureAdminDialogWidth(
      this.compactTable?.getTableElement(),
      this.tableColumnCount + 1
    );
  }

  getPaginatedData(): Record<string, unknown>[] {
    return getPaginatedSlice(this.filteredData, this.currentPageIndex, this.pageSize);
  }

  onPageChange(event: PageEvent): void {
    this.currentPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.emitPaginationChange();
    this.cdr.markForCheck();
  }

  addNew(): void {
    this.snackBar.open('Add feature coming soon', 'Close', { duration: 3000 });
  }

  editRecord(row: Record<string, unknown>): void {
    this.snackBar.open(
      `Edit: ${row['runlistCategory']} / ${row['fromPartDesc']}`,
      'Close',
      { duration: 3000 }
    );
  }

  deleteRecord(_row: Record<string, unknown>): void {
    if (confirm('Delete this record?')) {
      this.snackBar.open('Record deleted', 'Close', { duration: 3000 });
    }
  }

  exportData(): void {
    exportCsv(this.filteredData, 'runlist-associations.csv');
    this.snackBar.open('Exported', 'Close', { duration: 3000 });
  }
}
