import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule, MatMenu } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '@core/services/admin.service';
import { measureAdminDialogWidth } from './admin-compact-table.shared';

@Component({
  selector: 'app-admin-unit-of-measure',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDialogModule
  ],
  template: `
    <div class="admin-container">
      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading UOM...</p>
      </div>

      <div *ngIf="!isLoading && filteredData.length > 0" class="contact-tab-table" #tableWrap>
        <div class="table-scroll">
          <table class="footer-table uom-table">
            <thead>
              <tr>
                <th>UOM Type</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let element of getPaginatedData()">
                <td class="uom-cell">
                  <span class="uom-label">{{ element.uomType }}</span>
                  <button
                    mat-icon-button
                    type="button"
                    [matMenuTriggerFor]="contextMenu"
                    (click)="selectRow(element); $event.stopPropagation()"
                    class="action-btn"
                    aria-label="Row actions">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <mat-menu #contextMenu="matMenu">
        <button mat-menu-item (click)="editRecord(selectedRowData); $event.stopPropagation()">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>
        <button mat-menu-item (click)="deleteRecord(selectedRowData); $event.stopPropagation()" color="warn">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
      </mat-menu>

      <ng-template #addUomDialog>
        <h2 mat-dialog-title>{{ editUomId ? 'Edit Unit of Measure' : 'Add New Unit of Measure' }}</h2>
        <mat-dialog-content>
          <form [formGroup]="addUomForm" (ngSubmit)="onSubmitAddUom()" class="uom-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>UOM Type</mat-label>
              <input matInput formControlName="uomType" placeholder="Enter UOM type">
              <mat-error *ngIf="addUomForm.get('uomType')?.hasError('required')">
                UOM Type is required
              </mat-error>
            </mat-form-field>
          </form>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button (click)="onCancelAddUom()">Cancel</button>
          <button mat-raised-button color="primary" (click)="onSubmitAddUom()" [disabled]="!addUomForm.valid">
            {{ editUomId ? 'Update UOM' : 'Add UOM' }}
          </button>
        </mat-dialog-actions>
      </ng-template>

      <div *ngIf="!isLoading && filteredData.length === 0" class="no-data">
        <mat-icon>inbox</mat-icon>
        <p>No Unit of Measure found</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }

    .admin-container {
      padding: 0;
      margin: 0;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      gap: 12px;
      text-align: center;
    }

    .loading p {
      margin: 0;
    }

    /* Matches project contacts table (landing-page footer-table) */
    .contact-tab-table {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      padding: 6px;
      margin: 0;
      overflow: hidden;
    }

    .table-scroll {
      width: 100%;
      max-width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }

    .footer-table.uom-table {
      width: 100%;
      max-width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      margin: 0;
      background: #fafbfc;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      box-sizing: border-box;
    }

    .footer-table th,
    .footer-table td {
      border: 1px solid #949392;
      padding: 4px 8px;
      text-align: left;
      font-size: 12px;
      color: #222;
    }

    .footer-table th {
      background: #f1ece5;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #424242;
      white-space: nowrap;
    }

    .footer-table td {
      background: #fff;
      height: 24px;
      line-height: 16px;
      vertical-align: middle;
    }

    .footer-table tbody tr:hover td {
      background: #f5f5f5;
      transition: background 0.2s ease;
    }

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
    }

    .footer-table .uom-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-btn {
      width: 32px !important;
      height: 32px !important;
      flex-shrink: 0;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
    }

    .action-btn mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      color: #ff9800 !important;
      opacity: 0.7;
    }

    .action-btn:hover mat-icon {
      opacity: 1 !important;
    }

    :host-context([data-theme="dark"]) .action-btn mat-icon {
      color: #ffb74d !important;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.5;
    }

    :host-context([data-theme="dark"]) .footer-table {
      background: #1e1e1e !important;
    }

    :host-context([data-theme="dark"]) .footer-table th {
      background: #2a1a08 !important;
      color: #ff9800 !important;
      border-color: #424242 !important;
    }

    :host-context([data-theme="dark"]) .footer-table td {
      background: #1e1e1e !important;
      color: #e0e0e0 !important;
      border-color: #424242 !important;
    }

    :host-context([data-theme="dark"]) .footer-table tbody tr:hover td {
      background: #2a2520 !important;
    }

    /* Context Menu Styling */
    ::ng-deep .mat-mdc-menu-content {
      padding: 8px 0 !important;
    }

    ::ng-deep .admin-container .mat-mdc-menu-item {
      font-size: 13px !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      color: #333333 !important;
      transition: color 200ms ease !important;
    }

    ::ng-deep .admin-container .mat-mdc-menu-item:hover {
      background: rgba(255, 152, 0, 0.08) !important;
    }

    ::ng-deep .admin-container .mat-mdc-menu-item:hover mat-icon {
      color: #ff7043 !important;
    }

    ::ng-deep .admin-container .mat-mdc-menu-item:hover span {
      color: #ff7043 !important;
    }

    ::ng-deep .admin-container .mat-mdc-menu-item:focus {
      background: rgba(255, 152, 0, 0.12) !important;
    }

    ::ng-deep .admin-container .mat-mdc-menu-item.mat-mdc-menu-item-highlighted {
      background: rgba(255, 152, 0, 0.15) !important;
    }

    ::ng-deep .admin-container .mat-mdc-menu-item.mat-mdc-menu-item-highlighted mat-icon {
      color: #ff7043 !important;
    }

    ::ng-deep .admin-container .mat-mdc-menu-item.mat-mdc-menu-item-highlighted span {
      color: #ff7043 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .admin-container .mat-mdc-menu-item {
      color: #fff9c4 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .admin-container .mat-mdc-menu-item:hover {
      background: rgba(255, 152, 0, 0.25) !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .admin-container .mat-mdc-menu-item:hover mat-icon {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .admin-container .mat-mdc-menu-item:hover span {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .admin-container .mat-mdc-menu-item.mat-mdc-menu-item-highlighted {
      background: rgba(255, 152, 0, 0.25) !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .admin-container .mat-mdc-menu-item.mat-mdc-menu-item-highlighted mat-icon {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .admin-container .mat-mdc-menu-item.mat-mdc-menu-item-highlighted span {
      color: #ffb74d !important;
    }

    /* Add UOM Dialog Styles */
    ::ng-deep mat-dialog-title {
      margin: 0 !important;
      padding: 24px 24px 16px 24px !important;
      background: #fff !important;
    }

    ::ng-deep h2[mat-dialog-title] {
      margin: 0;
      padding: 0;
      font-size: 18px;
      font-weight: 600;
      color: #ff9800;
      letter-spacing: 0.3px;
    }

    ::ng-deep [data-theme="dark"] mat-dialog-title {
      background: #1a1a1a !important;
    }

    ::ng-deep [data-theme="dark"] h2[mat-dialog-title] {
      color: #ffb74d;
    }

    /* Only apply padding to the specific Add UOM dialog form, not modal wrapper */
    ::ng-deep .mat-mdc-dialog-container .uom-form .mat-mdc-form-field {
      padding: 0;
    }

    .uom-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
    }

    ::ng-deep [data-theme="dark"] .mat-mdc-dialog-container mat-dialog-content {
      background-color: #1a1a1a !important;
      color: #e0e0e0 !important;
    }

    ::ng-deep mat-dialog-actions {
      padding: 16px 8px !important;
      gap: 8px !important;
    }

    ::ng-deep mat-dialog-actions button {
      min-width: 80px;
      font-weight: 500;
    }

    ::ng-deep mat-dialog-actions button[color="primary"] {
      background-color: #ff9800 !important;
      color: white !important;
    }

    ::ng-deep mat-dialog-actions button[color="primary"]:hover:not(:disabled) {
      background-color: #fb8500 !important;
    }

    ::ng-deep [data-theme="dark"] mat-dialog-actions button[color="primary"] {
      background-color: #ffb74d !important;
      color: #222 !important;
    }

    ::ng-deep [data-theme="dark"] mat-dialog-actions button[color="primary"]:hover:not(:disabled) {
      background-color: #ffa726 !important;
    }

    ::ng-deep .mat-mdc-dialog-container {
      background-color: #fff !important;
    }

    ::ng-deep [data-theme="dark"] .mat-mdc-dialog-container {
      background-color: #1a1a1a !important;
    }

    ::ng-deep .uom-form .mat-mdc-form-field {
      width: 100%;
    }

    ::ng-deep .uom-form .mdc-text-field {
      background-color: #f9f9f9 !important;
    }

    ::ng-deep [data-theme="dark"] .uom-form .mdc-text-field {
      background-color: #2a2a2a !important;
    }

    ::ng-deep .uom-form .mat-mdc-form-field-label {
      color: #666 !important;
    }

    ::ng-deep [data-theme="dark"] .uom-form .mat-mdc-form-field-label {
      color: #aaa !important;
    }

    ::ng-deep .uom-form .mdc-text-field__input {
      color: #222 !important;
      font-size: 13px !important;
    }

    ::ng-deep [data-theme="dark"] .uom-form .mdc-text-field__input {
      color: #e0e0e0 !important;
    }

    ::ng-deep .uom-form .mdc-notched-outline__leading,
    ::ng-deep .uom-form .mdc-notched-outline__notch,
    ::ng-deep .uom-form .mdc-notched-outline__trailing {
      border-color: #d1d5db !important;
    }

    ::ng-deep [data-theme="dark"] .uom-form .mdc-notched-outline__leading,
    ::ng-deep [data-theme="dark"] .uom-form .mdc-notched-outline__notch,
    ::ng-deep [data-theme="dark"] .uom-form .mdc-notched-outline__trailing {
      border-color: #424242 !important;
    }

    ::ng-deep .uom-form .mat-mdc-form-field-underline::after {
      background-color: #ff9800 !important;
    }

    ::ng-deep [data-theme="dark"] .uom-form .mat-mdc-form-field-underline::after {
      background-color: #ffb74d !important;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class UnitOfMeasureComponent implements OnInit {
  @ViewChild('contextMenu') contextMenu!: MatMenu;
  @ViewChild('addUomDialog') addUomDialog: any;
  @ViewChild('tableWrap') tableWrap!: ElementRef<HTMLElement>;

  isLoading = false;
  searchText = '';
  allData: any[] = [];
  filteredData: any[] = [];
  pageSize = 10;
  currentPageIndex = 0;
  selectedRowData: any = null;
  contextMenuPosition = { x: 0, y: 0 };
  addUomForm!: FormGroup;
  editUomId: number | null = null;
  addUomDialogRef: any = null;

  @Output() paginationChange = new EventEmitter<{ totalItems: number; pageSize: number; pageIndex: number }>();
  @Output() dialogWidthChange = new EventEmitter<number>();
  @Output() editAction = new EventEmitter<any>();
  @Output() deleteAction = new EventEmitter<any>();

  /** Column count for dialog sizing (1 = compact UOM table). */
  readonly tableColumnCount = 1;

  constructor(
    private snackBar: MatSnackBar,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  initializeForm(): void {
    this.addUomForm = this.formBuilder.group({
      uomType: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.adminService.getUnitOfMeasure().subscribe({
      next: (data) => {
        this.allData = data || [];
        this.filteredData = [...this.allData];
        this.currentPageIndex = 0;
        this.isLoading = false;
        this.emitPaginationChange(true);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load UOM:', error);
        this.snackBar.open('Failed to load UOM', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  filterData(): void {
    this.currentPageIndex = 0;
    this.filteredData = !this.searchText.trim()
      ? [...this.allData]
      : this.allData.filter(item =>
          Object.values(item).some(val =>
            String(val).toLowerCase().includes(this.searchText.toLowerCase())
          )
        );
    this.emitPaginationChange(true);
    this.cdr.markForCheck();
  }

  emitPaginationChange(resizeDialog = false): void {
    this.paginationChange.emit({
      totalItems: this.filteredData.length,
      pageSize: this.pageSize,
      pageIndex: this.currentPageIndex
    });
    if (resizeDialog) {
      this.scheduleDialogWidthUpdate();
    }
  }

  measureDialogWidth(): number {
    return measureAdminDialogWidth(this.tableWrap?.nativeElement, this.tableColumnCount);
  }

  scheduleDialogWidthUpdate(): void {
    setTimeout(() => {
      this.dialogWidthChange.emit(
        measureAdminDialogWidth(this.tableWrap?.nativeElement, this.tableColumnCount)
      );
    }, 0);
  }

  addNew(): void {
    this.initializeForm();
    this.addUomDialogRef = this.dialog.open(this.addUomDialog, {
      width: '400px',
      disableClose: false
    });
  }

  onSubmitAddUom(): void {
    if (this.addUomForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    const formData = this.addUomForm.value;
    this.isLoading = true;
    this.cdr.markForCheck();

    const request$ = this.editUomId
      ? this.adminService.updateUnitOfMeasure(this.editUomId, formData)
      : this.adminService.createUnitOfMeasure(formData);

    request$.subscribe({
      next: (response) => {
        const message = this.editUomId ? 'UOM updated successfully' : 'UOM added successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.addUomDialogRef?.close();
        this.editUomId = null;
        this.loadData();
      },
      error: (error) => {
        const errorMsg = this.editUomId ? 'Failed to update UOM' : 'Failed to add UOM';
        console.error(errorMsg + ':', error);
        this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onCancelAddUom(): void {
    this.addUomDialogRef?.close();
  }

  editRecord(element: any): void {
    if (element) {
      this.editUomId = element.id;
      this.initializeForm();
      this.addUomForm.patchValue({
        uomType: element.uomType
      });
      
      this.addUomDialogRef = this.dialog.open(this.addUomDialog, {
        width: '400px',
        disableClose: false
      });
    }
  }

  deleteRecord(element: any): void {
    if (element && confirm('Delete this record?')) {
      this.isLoading = true;
      this.cdr.markForCheck();
      
      this.adminService.deleteUnitOfMeasure(element.id).subscribe({
        next: (response) => {
          this.snackBar.open('UOM deleted successfully', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: (error) => {
          console.error('Failed to delete UOM:', error);
          this.snackBar.open('Failed to delete UOM', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  selectRow(element: any): void {
    this.selectedRowData = element;
  }

  exportData(): void {
    const csv = this.allData.length
      ? [
          Object.keys(this.allData[0]).join(','),
          ...this.allData.map(item => Object.values(item).join(','))
        ].join('\n')
      : '';
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'unit-of-measure.csv';
    a.click();
    this.snackBar.open('Exported', 'Close', { duration: 3000 });
  }

  onPageChange(event: PageEvent): void {
    this.currentPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.emitPaginationChange();
    this.cdr.markForCheck();
  }

  getPaginatedData(): any[] {
    const startIndex = this.currentPageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredData.slice(startIndex, endIndex);
  }
}
