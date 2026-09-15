import { Component, OnInit, ChangeDetectorRef, HostListener, ViewChild, ViewChildren, QueryList, ElementRef, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { AdminService } from '../../core/services/admin.service';
import { ComponentPart, MasterPart, EarthquakeZone } from '../../core/models/models';

@Component({
  selector: 'app-admin-part-association-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  template: `
    <div class="secondary-nav-header">
      <button mat-button class="nav-item back-button" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        <span>Back to Admin</span>
      </button>
      <h1 class="page-title-right">Part Association Table</h1>
    </div>

    @if (keyboardSearchTerm) {
      <div class="keyboard-search-bar">
        <mat-icon class="keyboard-search-icon">search</mat-icon>
        <span class="keyboard-search-term">{{ keyboardSearchTerm }}</span>
        <span class="keyboard-search-hint">filtering by Master Component</span>
        <button class="keyboard-search-clear" (click)="clearKeyboardSearch()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    }

    @if (loading) {
      <div class="spinner-wrapper">
        <mat-spinner diameter="48"></mat-spinner>
        <p class="spinner-text">Loading parts...</p>
      </div>
    } @else {

    @if (editingSelectedRow) {
      <div class="table-toolbar">
        <button mat-raised-button class="toolbar-button save-btn" (click)="onSaveSelected()" matTooltip="Save changes">
          
          <span>Save</span>
        </button>
        <button mat-raised-button class="toolbar-button cancel-btn" (click)="onCancelEdit()" matTooltip="Cancel editing">
          
          <span>Cancel</span>
        </button>
      </div>
    }

      <div class="table-wrapper" #tableWrapper>
        <table mat-table [dataSource]="dataSource" class="association-table">
          <ng-container matColumnDef="masterComponent">
            <th mat-header-cell *matHeaderCellDef>Master Component</th>
            <td mat-cell *matCellDef="let row" class="desc-cell">
              @if (isEditingRow(row)) {
                <mat-select class="inline-select" [panelClass]="'part-association-select-panel'" [(ngModel)]="row.partId" (selectionChange)="onMasterComponentChanged(row)">
                  @for (part of masterComponentOptions; track part.partId) {
                    <mat-option [value]="part.partId">{{ part.partDesc }}</mat-option>
                  }
                </mat-select>
              } @else {
                {{ row.masterComponentDesc }}
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="associatedPart">
            <th mat-header-cell *matHeaderCellDef>Associated Part</th>
            <td mat-cell *matCellDef="let row" class="desc-cell">
              @if (isEditingRow(row)) {
                <mat-select class="inline-select" [panelClass]="'part-association-select-panel'" [(ngModel)]="row.assocPartId" (selectionChange)="onAssociatedPartChanged(row)">
                  @for (part of associatedPartOptions; track part.partId) {
                    <mat-option [value]="part.partId">{{ part.partDesc }}</mat-option>
                  }
                </mat-select>
              } @else {
                {{ row.associatedPartDesc }}
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="quantity">
            <th mat-header-cell *matHeaderCellDef class="num-header">Quantity</th>
            <td mat-cell *matCellDef="let row" class="num-cell">
              @if (isEditingRow(row)) {
                <input class="inline-number" type="number" min="0" step="0.01" [(ngModel)]="row.qty" />
              } @else {
                {{ row.qty | number:'1.2-2' }}
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="zone">
            <th mat-header-cell *matHeaderCellDef>For Zone</th>
            <td mat-cell *matCellDef="let row">
              @if (isEditingRow(row)) {
                <mat-select class="inline-select" [panelClass]="'part-association-select-panel'" [(ngModel)]="row.eqId" (selectionChange)="onZoneChanged(row)">
                  @for (zone of zoneOptions; track zone.eqId) {
                    <mat-option [value]="zone.eqId">{{ zone.eqType }}</mat-option>
                  }
                </mat-select>
              } @else {
                {{ row.zoneDesc }}
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns;"
            [class.selected-row]="selectedTableRow === row"
            (click)="onRowSelect(row)"
            (dblclick)="onRowDoubleClick(row)"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data-cell" [attr.colspan]="displayedColumns.length">No component parts found.</td>
          </tr>
        </table>
      </div>

      <div class="footer-panel">
        <div class="footer-pagination">
          <span class="pagination-label">Items per page:</span>
          <select class="page-size-select" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange($event)">
            @for (size of pageSizeOptions; track size) {
              <option [ngValue]="size">{{ size === 'all' ? 'All' : size }}</option>
            }
          </select>

          <span class="pagination-range">
            {{ paginationStart }}-{{ paginationEnd }} of {{ totalCount || filteredData.length }}
          </span>

          <button mat-icon-button class="pagination-btn" (click)="goToPreviousPage()" [disabled]="!canGoPreviousPage()" matTooltip="Previous page">
            <mat-icon>chevron_left</mat-icon>
          </button>

          <button mat-icon-button class="pagination-btn" (click)="goToNextPage()" [disabled]="!canGoNextPage()" matTooltip="Next page">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <!-- when we select the row by single click it should enable the delete button that should also delte in db -->
          

        
        <div class="footer-left-actions">
          <button mat-raised-button class="footer-button" (click)="onAdd()" matTooltip="Add a new association">
            <!-- <mat-icon>add</mat-icon> -->
            <span>Add</span>
          </button>

          <button mat-raised-button class="footer-button delete-button"
                  (click)="onDeleteSelected()"
                  [disabled]="!selectedTableRow || editingSelectedRow"
                  matTooltip="Delete selected association">
            <span>Delete</span>
          </button>
        </div>

        <div class="footer-right-actions">
        <!-- <button mat-raised-button class="footer-button delete-button" (click)="onDeleteSelected()" [disabled]="!selectedTableRow" matTooltip="Delete selected association">Delete</button> -->
          <button mat-raised-button class="footer-button" (click)="onExport()" matTooltip="Export data to Excel">Export</button>
          <button mat-raised-button class="footer-button cancel-button" (click)="goBack()">Cancel</button>
        </div>
      </div>
    }

  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    .secondary-nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 25px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }

    .page-title-right {
      font-size: 20px;
      font-weight: 420;
      color: #8a4d00;
      margin: 0 0 0 auto;
      padding-right: 10px;
      margin-right: -21px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 14px;
      font-weight: 500;
    }

    .nav-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-right: 8px;
      color: #6b7280;
      transition: color 0.2s;
    }

    .nav-item:hover:not(:disabled) {
      background-color: #f0f4f8;
      color: #ff9800;
    }

    .nav-item:hover:not(:disabled) mat-icon {
      color: #ff9800;
    }

    /* Match specificity of global button[mat-button]:not([color]) selector */
    button[mat-button].back-button {
      color: #6b7280 !important;
        --mat-text-button-hover-state-layer-opacity: 0;
        --mat-text-button-focus-state-layer-opacity: 0;
        --mat-text-button-pressed-state-layer-opacity: 0;
      }

    button[mat-button].back-button mat-icon {
      color: #6b7280 !important;
    }

    button[mat-button].back-button:hover {
      color: #ff9800 !important;
    }

    button[mat-button].back-button:hover mat-icon {
      color: #ff9800 !important;
    }

    .nav-item.back-button {
      color: #6b7280 !important;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.2s ease;
      gap: 8px;
    }

    .nav-item.back-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #6b7280 !important;
      transition: color 0.2s;
    }

    .nav-item.back-button:hover {
      background-color: #f0f4f8 !important;
      color: #ff9800 !important;
    }

    .nav-item.back-button:hover mat-icon {
      color: #ff9800 !important;
    }

    .nav-item.back-button:active {
      background-color: #fff3e0 !important;
      color: #ff9800 !important;
      box-shadow: 0 0 0 1.5px #ff9800 !important;
    }

    .nav-item.back-button:active mat-icon {
      color: #ff9800 !important;
    }

    .keyboard-search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 24px;
      background: #fff8e1;
      border-bottom: 1px solid #ffe082;
      font-size: 13px;
      color: #5d4037;
      flex-shrink: 0;
    }

    .keyboard-search-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #ff9800;
    }

    .keyboard-search-term {
      font-weight: 700;
      color: #e65100;
      letter-spacing: 0.5px;
    }

    .keyboard-search-hint {
      color: #8d6e63;
      font-size: 11px;
    }

    .keyboard-search-clear {
      margin-left: auto;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #8d6e63;
      display: flex;
      align-items: center;
      padding: 2px;
      border-radius: 50%;
    }

    .keyboard-search-clear:hover {
      background: #ffe0b2;
      color: #e65100;
    }

    .keyboard-search-clear mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .table-toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      padding: 10px 20px;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }

    .toolbar-button {
      background: #ff9800;
      color: #fff;
      font-weight: 600;
      font-size: 12px;
      padding: 4px 6px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      transition: all 0.2s ease;
      white-space: nowrap;
      flex-shrink: 0;
      min-width: 32px;
      height: 32px;
    }

    .toolbar-button:hover:not(:disabled) {
      background: #e68900;
      box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
    }

    .toolbar-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #d1d5db;
      box-shadow: none;
    }

    .toolbar-button.delete-btn {
      background: #ff9800;
    }

    .toolbar-button.delete-btn:hover:not(:disabled) {
      background: #e68900;
    }

    .toolbar-button.save-btn {
      background: #ff9800;
    }

    .toolbar-button.save-btn:hover:not(:disabled) {
      background: #e68900;
    }

    .toolbar-button.cancel-btn {
      background: #d1d5db;
      color: #374151;
    }

    .toolbar-button.cancel-btn:hover:not(:disabled) {
      background: #c8c9cc;
    }

    .toolbar-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .table-wrapper {
      overflow-x: auto;
      overflow-y: auto;
      flex: 1;
      background: #fff;
      border-left: 1px solid #e0e0e0;
      border-right: 1px solid #e0e0e0;
      min-height: 0;
      padding: 0 16px 16px;
      box-sizing: border-box;
    }

    .association-table {
      width: 100%;
      min-width: 1000px;
      border-collapse: separate;
      border-spacing: 0;
    }

    .association-table th.mat-mdc-header-cell {
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
    }

    .association-table td.mat-mdc-cell {
      font-size: 12px;
      padding: 8px 12px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: middle;
    }

    .association-table tr.mat-mdc-row:hover td {
      background: #f1ece5;
    }

    .association-table tr.selected-row td {
      background: #ffe8cc !important;
    }

    .association-table [matColumnDef="masterComponent"] th,
    .association-table [matColumnDef="masterComponent"] td,
    .association-table [matColumnDef="associatedPart"] th,
    .association-table [matColumnDef="associatedPart"] td {
      min-width: 250px;
    }

    .association-table [matColumnDef="quantity"] th,
    .association-table [matColumnDef="quantity"] td {
      width: 120px;
      min-width: 100px;
    }

    .association-table [matColumnDef="zone"] th,
    .association-table [matColumnDef="zone"] td {
      min-width: 160px;
    }

    .inline-select {
      width: 100%;
      min-width: 160px;
    }

    :host ::ng-deep .inline-select .mat-mdc-select-value {
      width: 90%;
      font-size: 12px;
    }

    :host ::ng-deep .inline-select .mat-mdc-select-value-text,
    :host ::ng-deep .inline-select .mat-mdc-select-min-line {
      font-size: 12px;
    }

    :host ::ng-deep .part-association-select-panel .mat-mdc-option.mdc-list-item {
      font-size: 12px;
      min-height: 34px;
    }

    :host ::ng-deep .part-association-select-panel .mat-mdc-option.mdc-list-item:hover:not(.mdc-list-item--disabled) {
      background: #f1ece5;
    }

    :host ::ng-deep .part-association-select-panel .mat-mdc-option .mdc-list-item__primary-text {
      font-size: 12px;
    }

    :host ::ng-deep .part-association-select-panel .mat-mdc-option-ripple,
    :host ::ng-deep .part-association-select-panel .mat-ripple,
    :host ::ng-deep .part-association-select-panel .mat-focus-indicator::before {
      display: none;
    }

    :host ::ng-deep .cdk-overlay-pane.part-association-select-panel {
      width: 430px !important;
    }

    :host ::ng-deep .part-association-select-panel .mat-mdc-select-panel-wrap {
      padding-top: 0 !important;
    }

    :host ::ng-deep .part-association-select-panel .mat-mdc-select-content {
      margin-top: 0 !important;
      padding-top: 0 !important;
    }

    :host ::ng-deep .part-association-select-panel .mdc-list {
      padding-top: 0 !important;
    }

    .inline-number {
      width: 100%;
      min-width: 80px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 6px 8px;
      font-size: 12px;
      text-align: right;
    }

    .desc-cell {
      word-break: break-word;
      white-space: normal;
    }

    .num-header,
    .num-cell {
      text-align: right;
    }

    .no-data-cell {
      text-align: center;
      padding: 32px;
      color: #9e9e9e;
      font-style: italic;
    }

    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 10px;
      flex: 1;
    }

    .spinner-text {
      margin: 0;
      font-size: 16px;
      color: #6b7280;
      font-weight: 500;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    }

    .loading-inline {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 24px;
      font-size: 12px;
      color: #8a4d00;
      background: #fff8e1;
      border-bottom: 1px solid #ffe082;
      flex-shrink: 0;
    }

    .footer-panel {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 12px 32px;
      background: #fff;
      border-top: 1px solid #e0e0e0;
      min-height: 1px;
      flex-shrink: 0;
      overflow: hidden;
      position: relative;
    }

    .footer-left-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-start;
      min-width: 140px;
      padding-left: 910px;
    }

    .footer-right-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-end;
      min-width: fit-content;
      margin-left: auto;
    }

    .footer-pagination {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #374151;
      font-size: 12px;
      font-weight: 500;
      min-height: 32px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    .pagination-label {
      color: #6b7280;
      white-space: nowrap;
    }

    .page-size-select {
      height: 32px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: #fff;
      color: #374151;
      font-size: 12px;
      padding: 0 8px;
      outline: none;
      cursor: pointer;
      line-height: 30px;
    }

    .pagination-range {
      min-width: 90px;
      text-align: center;
      color: #374151;
    }

    .pagination-btn {
      width: 30px;
      height: 30px;
      min-width: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 1px solid transparent;
      background: transparent;
      color: #8a4d00;
      transition: all 0.2s ease;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #fff3e0;
      border-color: #ffd699;
      color: #e68900;
    }

    .pagination-btn[disabled] {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .pagination-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      line-height: 20px;
    }

    .footer-button {
      background: #ff9800;
      color: #fff;
      font-weight: 600;
      font-size: 12px;
      padding: 6px 14px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .footer-button:hover:not(:disabled) {
      background: #e68900;
      box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
    }

    .footer-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #d1d5db;
      box-shadow: none;
    }

    .footer-button.cancel-button {
      background: #d1d5db;
      color: #4f4f51;
    }

    .footer-button.cancel-button:hover:not(:disabled) {
      background: #c8c9cc;
    }

    .footer-button.delete-button {
      background: #ff9800;
      color: #fff;
    }

    .footer-button.delete-button:hover:not(:disabled) {
      background: #e68900;
    }
  `]
})
export class PartAssociationTableComponent implements OnInit {
  displayedColumns = ['masterComponent', 'associatedPart', 'quantity', 'zone'];

  loading = false;
  totalCount = 0;
  filteredData: ComponentPart[] = [];
  dataSource = new MatTableDataSource<ComponentPart>([]);

  keyboardSearchTerm = '';
  private allData: ComponentPart[] = [];
  private keyboardSearchTimeout: ReturnType<typeof setTimeout> | null = null;

  masterComponentOptions: MasterPart[] = [];
  associatedPartOptions: MasterPart[] = [];
  zoneOptions: EarthquakeZone[] = [];

  selectedTableRow: ComponentPart | null = null;
  editingSelectedRow = false;
  private selectedRowBackup: ComponentPart | null = null;
  private isAddingRow = false;

  pageSizeOptions: Array<number | 'all'> = [10, 30, 50, 100, 'all'];
  pageSize: number | 'all' = 10;
  pageIndex = 0;
  paginationStart = 0;
  paginationEnd = 0;

  @ViewChild('tableWrapper') tableWrapper?: ElementRef<HTMLDivElement>;
  @ViewChildren(MatSelect) inlineSelects?: QueryList<MatSelect>;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    this.loadLookupData();
    this.loadComponentParts();
  }

  goBack(): void {
    this.dialogRef?.close();
    this.router.navigate(['/admin']);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
    if (this.editingSelectedRow) return;

    if (event.key === 'Escape') {
      this.clearKeyboardSearch();
      return;
    }

    if (event.key === 'Backspace' && this.keyboardSearchTerm.length > 0) {
      this.keyboardSearchTerm = this.keyboardSearchTerm.slice(0, -1);
      this.applyKeyboardFilter();
      this.resetKeyboardSearchTimeout();
      return;
    }

    if (event.key.length === 1 && /[\w\s]/.test(event.key)) {
      this.keyboardSearchTerm += event.key;
      this.applyKeyboardFilter();
      this.resetKeyboardSearchTimeout();
    }
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    const element = target as HTMLElement | null;
    if (!element) {
      return;
    }

    const clickedOnSelect = !!element.closest('mat-select, .mat-mdc-select, .cdk-overlay-pane.part-association-select-panel');
    if (!clickedOnSelect) {
      this.inlineSelects?.forEach(select => select.close());
    }
  }

  private resetKeyboardSearchTimeout(): void {
    if (this.keyboardSearchTimeout) clearTimeout(this.keyboardSearchTimeout);
    this.keyboardSearchTimeout = setTimeout(() => this.clearKeyboardSearch(), 2000);
  }

  clearKeyboardSearch(): void {
    this.keyboardSearchTerm = '';
    this.filteredData = [...this.allData];
    this.pageIndex = 0;
    this.applyPagination();
  }

  private applyKeyboardFilter(): void {
    const term = this.keyboardSearchTerm.toLowerCase().trim();
    this.filteredData = term
      ? this.allData.filter(row => String(row.masterComponentDesc ?? '').toLowerCase().includes(term))
      : [...this.allData];
    this.pageIndex = 0;
    this.applyPagination();
  }

  private loadLookupData(): void {
    this.adminService.getParts().subscribe({
      next: (parts) => {
        const active = parts.filter(p => p.active);
        this.masterComponentOptions = [...active].sort((a, b) => String(a.partDesc ?? '').localeCompare(String(b.partDesc ?? '')));
        this.associatedPartOptions = [...active].sort((a, b) => String(a.partDesc ?? '').localeCompare(String(b.partDesc ?? '')));
      },
      error: () => {
        this.masterComponentOptions = [];
        this.associatedPartOptions = [];
      }
    });

    this.adminService.getEarthquakeZones().subscribe({
      next: (zones) => {
        this.zoneOptions = [...zones].sort((a, b) => String(a.eqType ?? '').localeCompare(String(b.eqType ?? '')));
      },
      error: () => {
        this.zoneOptions = [];
      }
    });
  }

  loadComponentParts(): void {
    this.loading = true;
    this.adminService.getAllComponentParts().subscribe({
      next: (data) => {
        const sorted = [...data].sort((a, b) =>
          String(a.masterComponentDesc ?? '').localeCompare(String(b.masterComponentDesc ?? ''), undefined, { sensitivity: 'base' })
        );
        this.allData = sorted;
        this.filteredData = sorted;
        this.pageIndex = 0;
        this.applyPagination();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading component parts:', err);
        this.snackBar.open('Failed to load component parts. Please retry.', 'Close', { duration: 4000 });
      }
    });

    this.adminService.getTotalComponentPartsCount().subscribe({
      next: (count) => {
        this.totalCount = count;
      },
      error: (err) => {
        console.error('Error loading count:', err);
      }
    });
  }

  applyPagination(): void {
    const effectiveSize = this.getEffectivePageSize();
    const maxPageIndex = Math.max(Math.ceil(this.filteredData.length / effectiveSize) - 1, 0);
    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = maxPageIndex;
    }

    const startIndex = this.pageIndex * effectiveSize;
    const endIndex = startIndex + effectiveSize;

    const pageData = this.filteredData.slice(startIndex, endIndex);
    this.dataSource.data = pageData;

    this.paginationStart = this.filteredData.length > 0 ? startIndex + 1 : 0;
    this.paginationEnd = Math.min(endIndex, this.filteredData.length);

    if (!this.selectedTableRow && pageData.length > 0) {
      this.selectedTableRow = pageData[0];
    } else if (this.selectedTableRow && !pageData.includes(this.selectedTableRow) && pageData.length > 0 && !this.editingSelectedRow) {
      this.selectedTableRow = pageData[0];
    }

    this.cdr.detectChanges();
  }

  getEffectivePageSize(): number {
    return this.pageSize === 'all' ? Math.max(this.filteredData.length, 1) : Number(this.pageSize);
  }

  canGoPreviousPage(): boolean {
    return this.pageIndex > 0;
  }

  canGoNextPage(): boolean {
    const effectiveSize = this.getEffectivePageSize();
    return (this.pageIndex + 1) * effectiveSize < this.filteredData.length;
  }

  goToPreviousPage(): void {
    if (this.canGoPreviousPage()) {
      this.pageIndex--;
      this.applyPagination();
    }
  }

  goToNextPage(): void {
    if (this.canGoNextPage()) {
      this.pageIndex++;
      this.applyPagination();
    }
  }

  onPageSizeChange(size: number | 'all'): void {
    this.pageSize = size === 'all' ? 'all' : (Number(size) || 10);
    this.pageIndex = 0;
    this.applyPagination();
  }

  onRowSelect(row: ComponentPart): void {
    if (this.editingSelectedRow) {
      return;
    }
    this.selectedTableRow = row;
  }

  onRowDoubleClick(row: ComponentPart): void {
    if (this.editingSelectedRow) {
      return;
    }
    this.selectedTableRow = row;
    this.onEditSelected();
  }

  isEditingRow(row: ComponentPart): boolean {
    return this.editingSelectedRow && this.selectedTableRow === row;
  }

  onAdd(): void {
    if (this.editingSelectedRow) {
      this.snackBar.open('Save or cancel current edit first', 'Close', { duration: 2500 });
      return;
    }

    const defaultMaster = this.masterComponentOptions[0];
    const defaultAssoc = this.associatedPartOptions[0];
    const defaultZone = this.zoneOptions[0];

    const newRow: ComponentPart = {
      compPartId: 0,
      partId: defaultMaster?.partId ?? 0,
      assocPartId: defaultAssoc?.partId ?? 0,
      qty: 1,
      eqId: defaultZone?.eqId ?? 0,
      masterComponentDesc: defaultMaster?.partDesc ?? '',
      associatedPartDesc: defaultAssoc?.partDesc ?? '',
      zoneDesc: defaultZone?.eqType ?? ''
    };

    this.clearKeyboardSearch();
    this.allData = [...this.allData, newRow];
    this.filteredData = [...this.allData];
    this.isAddingRow = true;
    this.selectedTableRow = newRow;
    this.selectedRowBackup = null;
    this.editingSelectedRow = true;

    const effectiveSize = this.getEffectivePageSize();
    this.pageIndex = Math.max(Math.ceil(this.filteredData.length / effectiveSize) - 1, 0);
    this.applyPagination();

    setTimeout(() => {
      if (this.tableWrapper?.nativeElement) {
        this.tableWrapper.nativeElement.scrollTop = this.tableWrapper.nativeElement.scrollHeight;
      }
    }, 0);
  }

  onEditSelected(): void {
    if (!this.selectedTableRow) {
      return;
    }
    if (this.editingSelectedRow) {
      return;
    }

    this.selectedRowBackup = { ...this.selectedTableRow };
    this.editingSelectedRow = true;
    this.isAddingRow = this.selectedTableRow.compPartId === 0;
  }

  onCancelEdit(): void {
    if (!this.selectedTableRow) {
      this.editingSelectedRow = false;
      this.isAddingRow = false;
      return;
    }

    if (this.isAddingRow) {
      this.allData = this.allData.filter(r => r !== this.selectedTableRow);
      this.filteredData = this.filteredData.filter(r => r !== this.selectedTableRow);
      this.selectedTableRow = null;
    } else if (this.selectedRowBackup) {
      Object.assign(this.selectedTableRow, this.selectedRowBackup);
    }

    this.selectedRowBackup = null;
    this.editingSelectedRow = false;
    this.isAddingRow = false;
    this.applyPagination();
  }

  onSaveSelected(): void {
    if (!this.selectedTableRow) {
      return;
    }

    const row = this.selectedTableRow;

    if (!row.partId || !row.assocPartId || !row.eqId) {
      this.snackBar.open('Master Component, Associated Part and Zone are required', 'Close', { duration: 3000 });
      return;
    }
    if (row.partId === row.assocPartId) {
      this.snackBar.open('A part cannot be associated with itself', 'Close', { duration: 3000 });
      return;
    }
    if (row.qty == null || Number(row.qty) <= 0) {
      this.snackBar.open('Quantity must be greater than zero', 'Close', { duration: 3000 });
      return;
    }

    this.syncDisplayNames(row);

    const payload: Partial<ComponentPart> = {
      compPartId: row.compPartId > 0 ? row.compPartId : undefined,
      partId: row.partId,
      assocPartId: row.assocPartId,
      qty: Number(row.qty),
      eqId: row.eqId
    };

    const save$ = row.compPartId > 0
      ? this.adminService.updateComponentPart(row.compPartId, payload)
      : this.adminService.createComponentPart(payload);

    save$.subscribe({
      next: () => {
        this.snackBar.open('Component part saved successfully', 'Close', { duration: 2500 });
        this.editingSelectedRow = false;
        this.isAddingRow = false;
        this.selectedRowBackup = null;
        this.loadComponentParts();
      },
      error: (err) => {
        console.error('Error saving component part:', err);
        this.snackBar.open(err?.error?.message || 'Failed to save component part', 'Close', { duration: 4000 });
      }
    });
  }

  onDeleteSelected(): void {
    if (!this.selectedTableRow) {
      return;
    }

    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: { partDesc: this.selectedTableRow.masterComponentDesc }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.proceedWithDelete();
      }
    });
  }

  private proceedWithDelete(): void {
    if (!this.selectedTableRow) {
      return;
    }

    const row = this.selectedTableRow;
    if (row.compPartId <= 0) {
      this.allData = this.allData.filter(r => r !== row);
      this.filteredData = this.filteredData.filter(r => r !== row);
      this.selectedTableRow = null;
      this.editingSelectedRow = false;
      this.isAddingRow = false;
      this.applyPagination();
      return;
    }

    const previousAllData = [...this.allData];
    const previousFilteredData = [...this.filteredData];

    // Optimistic UI delete so the row disappears immediately after confirmation.
    this.allData = this.allData.filter(r => r !== row);
    this.filteredData = this.filteredData.filter(r => r !== row);
    this.selectedTableRow = null;
    this.editingSelectedRow = false;
    this.isAddingRow = false;
    this.selectedRowBackup = null;
    this.applyPagination();

    this.adminService.deleteComponentPart(row.compPartId).subscribe({
      next: () => {
        this.snackBar.open('Component part deleted', 'Close', { duration: 2500 });
      },
      error: (err) => {
        this.allData = previousAllData;
        this.filteredData = previousFilteredData;
        this.selectedTableRow = row;
        this.applyPagination();
        console.error('Error deleting component part:', err);
        this.snackBar.open(err?.error?.message || 'Failed to delete component part', 'Close', { duration: 4000 });
      }
    });
  }

  onMasterComponentChanged(row: ComponentPart): void {
    const selected = this.masterComponentOptions.find(p => p.partId === row.partId);
    row.masterComponentDesc = selected?.partDesc ?? row.masterComponentDesc;
  }

  onAssociatedPartChanged(row: ComponentPart): void {
    const selected = this.associatedPartOptions.find(p => p.partId === row.assocPartId);
    row.associatedPartDesc = selected?.partDesc ?? row.associatedPartDesc;
  }

  onZoneChanged(row: ComponentPart): void {
    const selected = this.zoneOptions.find(z => z.eqId === row.eqId);
    row.zoneDesc = selected?.eqType ?? row.zoneDesc;
  }

  private syncDisplayNames(row: ComponentPart): void {
    this.onMasterComponentChanged(row);
    this.onAssociatedPartChanged(row);
    this.onZoneChanged(row);
  }

  onExport(): void {
    const pageRows = this.dataSource.data;
    if (pageRows.length === 0) {
      this.snackBar.open('No data to export', 'Close', { duration: 2000 });
      return;
    }

    try {
      const exportData = pageRows.map(row => ({
        'Master Component': row.masterComponentDesc,
        'Associated Part': row.associatedPartDesc,
        'Quantity': row.qty,
        'For Zone': row.zoneDesc
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Component Parts');

      worksheet['!cols'] = [
        { wch: 30 },
        { wch: 30 },
        { wch: 12 },
        { wch: 20 }
      ];

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `Component_Parts_${timestamp}.xlsx`;
      XLSX.writeFile(workbook, filename);

      this.snackBar.open(`Exported ${pageRows.length} rows to Excel`, 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Export error:', error);
      this.snackBar.open('Export failed', 'Close', { duration: 3000 });
    }
  }
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="delete-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 class="dialog-title">Confirm Deletion</h2>
      </div>
      <div class="dialog-content">
        <p>Are you sure you want to delete this component part?</p>
        <p class="part-info" *ngIf="data.partDesc">
          <strong>{{ data.partDesc }}</strong>
        </p>
        <p class="warning-text">This action cannot be undone.</p>
      </div>
      <div class="dialog-actions">
        <button mat-raised-button class="cancel-btn" [mat-dialog-close]="false">
          <mat-icon>close</mat-icon>
          <span>Cancel</span>
        </button>
        <button mat-raised-button class="delete-btn" [mat-dialog-close]="true">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog {
      padding: 24px;
      min-width: 300px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .warning-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #ff9800;
    }

    .dialog-title {
      margin: 0;
      font-size: 18px;
      color: #1f2937;
      font-weight: 600;
    }

    .dialog-content {
      margin-bottom: 24px;
      color: #4b5563;
      font-size: 13px;
      line-height: 1.6;
    }

    .dialog-content p {
      margin: 8px 0;
    }

    .part-info {
      background: #fef3c7;
      padding: 8px 12px;
      border-radius: 4px;
      border-left: 3px solid #f59e0b;
      margin: 12px 0 !important;
    }

    .warning-text {
      color: #706d6d;
      font-weight: 600;
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    button {
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 12px;
      padding: 8px 16px;
      transition: all 0.2s ease;
    }

    .cancel-btn {
      background: #d1d5db;
      color: #4f4f51;
    }

    .cancel-btn:hover {
      background: #c8c9cc;
    }

    .delete-btn {
      background: #ff9800;
      color: #fff;
    }

    .delete-btn:hover {
      background: #e68900;
    }

    mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class DeleteConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
