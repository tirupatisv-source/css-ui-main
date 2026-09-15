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
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule, AdminCompactTableComponent],
  template: `
    <div class="admin-container">
      <app-admin-compact-table
        #compactTable
        [columns]="columns"
        [rows]="getPaginatedData()"
        [loading]="isLoading"
        loadingMessage="Loading companies..."
        emptyMessage="No companies found"
        (editRow)="editCompany($event)"
        (deleteRow)="deleteCompany($event)">
      </app-admin-compact-table>
    </div>
  `,
  styles: [`:host { display: block; width: 100%; }`]
})
export class CompaniesComponent implements OnInit {
  @ViewChild('compactTable') compactTable!: AdminCompactTableComponent;

  @Output() paginationChange = new EventEmitter<{ totalItems: number; pageSize: number; pageIndex: number }>();
  @Output() dialogWidthChange = new EventEmitter<number>();

  readonly tableColumnCount = ADMIN_ROUTE_COLUMN_COUNT['companies'];

  columns: AdminCompactColumn[] = [
    { key: 'companyId', header: 'ID' },
    { key: 'companyName', header: 'Company Name' }
  ];

  isLoading = false;
  allData: Record<string, unknown>[] = [];
  filteredData: Record<string, unknown>[] = [];
  pageSize = 10;
  currentPageIndex = 0;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.adminService.getCompanies().subscribe({
      next: (data) => {
        this.allData = (data || []) as unknown as Record<string, unknown>[];
        this.filteredData = [...this.allData];
        this.currentPageIndex = 0;
        this.isLoading = false;
        this.emitPaginationChange(true);
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to load companies', 'Close', { duration: 4000 });
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
    this.snackBar.open('Add Company dialog — coming soon', 'OK', { duration: 2000 });
  }

  editCompany(company: Record<string, unknown>): void {
    this.snackBar.open('Edit Company dialog — coming soon', 'OK', { duration: 2000 });
  }

  deleteCompany(_company: Record<string, unknown>): void {
    this.snackBar.open('Delete Company — coming soon', 'OK', { duration: 2000 });
  }

  exportData(): void {
    exportCsv(this.filteredData, 'companies.csv');
    this.snackBar.open('Exported', 'Close', { duration: 3000 });
  }
}
