
import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, HostListener, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import * as XLSX from 'xlsx';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { MasterPart } from '../../core/models/models';
import { ItemIdLookupDialog } from './item-id-lookup.dialog';

/**
 * Master Parts List admin   converted from VB6 frmAdmPartsList.
 * Matches the legacy screen: Sort By radio buttons, all original columns.
 */
@Component({
  selector: 'app-parts-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatRadioModule, MatSelectModule,
    MatIconModule, MatFormFieldModule,
    MatInputModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule, MatButtonModule,
    MatCheckboxModule
  ],
  template: `
    <div class="secondary-nav-header">
      <button mat-button class="nav-item back-button" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        <span>Back to Admin</span>
      </button>
      <h1 class="page-title-right">Master Parts List</h1>
    </div>

   
    <!-- Controls panel -->
    <div class="controls-panel">

      <!-- Part Group row -->
      <div class="control-row">
        <span class="control-label">Part Group:</span>
        <mat-radio-group class="radio-group" [(ngModel)]="selectedGroupId" (change)="loadParts()">
          @for (g of partGroups; track g.id) {
            <mat-radio-button [value]="g.id" color="primary">{{ g.label }}</mat-radio-button>
          }
        </mat-radio-group>
        <div class="spacer"></div>
        <!-- Compact Search controls on right -->
        <div class="compact-search-controls">
          

          <div class="header-select-group compact">
            <label class="header-select-label">Search By:</label>
            <mat-select #searchBySelect class="header-select compact-select" [(ngModel)]="searchByField" (selectionChange)="onSearchFieldChange(searchBySelect)" panelClass="custom-select-panel">
              @for (option of searchByOptions; track option.value) {
                <mat-option [value]="option.value">{{ option.label }}</mat-option>
              }
            </mat-select>
          </div>

          <mat-form-field class="compact-search-value description-like">
            <input matInput [(ngModel)]="searchByValue" (keyup)="onSearchValueChange()" [placeholder]="getSearchPlaceholder()" [disabled]="!searchByField">
          </mat-form-field>
        </div>
      </div>

      <!-- Sort By row -->
      <div class="control-row">
        <span class="control-label">Sort By:</span>
        <mat-radio-group class="radio-group sort-group" [(ngModel)]="sortBy" (change)="onSortByChange()">
          @for (s of sortOptions; track s.value) {
            <mat-radio-button [value]="s.value" color="primary">{{ s.label }}</mat-radio-button>
          }
        </mat-radio-group>
      </div>



    </div>

    <!-- Spinner -->
    @if (loading) {
      <div class="spinner-wrapper">
        <mat-spinner diameter="48"></mat-spinner>
        <p class="spinner-text">Loading parts...</p>
      </div>
    } @else {

      <!-- Table -->
      <div class="table-wrapper" #tableWrapper>
        <table mat-table [dataSource]="dataSource" class="parts-table">

          <!-- SAP Item Id -->
          <ng-container matColumnDef="itemId">
            <th mat-header-cell *matHeaderCellDef>SAP Item Id</th>
            <td mat-cell *matCellDef="let row">
              @if (isDraftRow(row)) {
                <input class="inline-edit-input" [(ngModel)]="row.itemId" placeholder="SAP Item Id">
              } @else {
                {{ row.itemId }}
              }
            </td>
          </ng-container>

          <!-- Oracle Item Id (hidden per request) -->
          <!--
          <ng-container matColumnDef="oracleItemId">
            <th mat-header-cell *matHeaderCellDef>Oracle Item Id</th>
            <td mat-cell *matCellDef="let row">{{ row.oracleItemId }}</td>
          </ng-container>
          -->

          <!-- Description -->
          <ng-container matColumnDef="partDesc">
            <th mat-header-cell *matHeaderCellDef>Description</th>
            <td mat-cell *matCellDef="let row" class="desc-cell">
              @if (isDraftRow(row)) {
                <input class="inline-edit-input" [(ngModel)]="row.partDesc" placeholder="Description">
              } @else {
                {{ row.partDesc }}
              }
            </td>
          </ng-container>

          <!-- Ordering Parameter -->
          <ng-container matColumnDef="orderParm">
            <th mat-header-cell *matHeaderCellDef>Ordering Parameter</th>
            <td mat-cell *matCellDef="let row">
              @if (isDraftRow(row)) {
                <input class="inline-edit-input" [(ngModel)]="row.orderParm" placeholder="Ordering Parameter">
              } @else {
                {{ row.orderParm }}
              }
            </td>
          </ng-container>

          <!-- Part Number -->
          <ng-container matColumnDef="partNum">
            <th mat-header-cell *matHeaderCellDef>Part Number</th>
            <td mat-cell *matCellDef="let row">
              @if (isDraftRow(row)) {
                <input class="inline-edit-input" [(ngModel)]="row.partNum" placeholder="Part Number">
              } @else {
                {{ row.partNum }}
              }
            </td>
          </ng-container>

          <!-- Vendor -->
          <ng-container matColumnDef="vendorName">
            <th mat-header-cell *matHeaderCellDef>Vendor</th>
            <td mat-cell *matCellDef="let row">
              @if (isDraftRow(row)) {
                <input class="inline-edit-input" [(ngModel)]="row.vendorName" placeholder="Vendor">
              } @else {
                {{ row.vendorName }}
              }
            </td>
          </ng-container>

          <!-- Manufacturer -->
          <ng-container matColumnDef="manufacturerName">
            <th mat-header-cell *matHeaderCellDef>Manufacturer</th>
            <td mat-cell *matCellDef="let row">
              @if (isDraftRow(row)) {
                <input class="inline-edit-input" [(ngModel)]="row.manufacturerName" placeholder="Manufacturer">
              } @else {
                {{ row.manufacturerName }}
              }
            </td>
          </ng-container>

          <!-- Cost -->
          <ng-container matColumnDef="cost">
            <th mat-header-cell *matHeaderCellDef class="num-header">Cost</th>
            <td mat-cell *matCellDef="let row" class="cost-cell">
              @if (isDraftRow(row)) {
                <input class="inline-edit-input inline-edit-number" type="number" [(ngModel)]="row.cost" placeholder="0.00">
              } @else {
                {{ row.cost != null ? (row.cost | number:'1.2-2') : '' }}
              }
            </td>
          </ng-container>

          <!-- UOM -->
          <ng-container matColumnDef="uom">
            <th mat-header-cell *matHeaderCellDef>UOM</th>
            <td mat-cell *matCellDef="let row">
              @if (isDraftRow(row)) {
                <input class="inline-edit-input" [(ngModel)]="row.uom" placeholder="UOM">
              } @else {
                {{ row.uom }}
              }
            </td>
          </ng-container>

          <!-- Material Category -->
          <ng-container matColumnDef="categoryName">
            <th mat-header-cell *matHeaderCellDef>Material Category</th>
            <td mat-cell *matCellDef="let row">
              @if (isDraftRow(row)) {
                <input class="inline-edit-input" [(ngModel)]="row.categoryName" placeholder="Material Category">
              } @else {
                {{ row.categoryName }}
              }
            </td>
          </ng-container>

          <!-- Kit -->
          <ng-container matColumnDef="kit">
            <th mat-header-cell *matHeaderCellDef class="bool-header">Kit</th>
            <td mat-cell *matCellDef="let row" class="bool-cell">
              @if (isDraftRow(row)) {
                <mat-checkbox [(ngModel)]="row.kit"></mat-checkbox>
              } @else {
                <mat-icon [class.icon-yes]="row.kit" [class.icon-no]="!row.kit">
                  {{ row.kit ? 'check_circle' : 'radio_button_unchecked' }}
                </mat-icon>
              }
            </td>
          </ng-container>

          <!-- Active -->
          <ng-container matColumnDef="active">
            <th mat-header-cell *matHeaderCellDef class="bool-header">Active</th>
            <td mat-cell *matCellDef="let row" class="bool-cell">
              @if (isDraftRow(row)) {
                <mat-checkbox [(ngModel)]="row.active"></mat-checkbox>
              } @else {
                <mat-icon [class.icon-yes]="row.active" [class.icon-no]="!row.active">
                  {{ row.active ? 'check_circle' : 'radio_button_unchecked' }}
                </mat-icon>
              }
            </td>
          </ng-container>

          <!-- Part Group -->
          <ng-container matColumnDef="partGroupName">
            <th mat-header-cell *matHeaderCellDef>Part Group</th>
            <td mat-cell *matCellDef="let row">
              @if (isDraftRow(row)) {
                <input class="inline-edit-input" [(ngModel)]="row.partGroupName" placeholder="Part Group">
              } @else {
                {{ row.partGroupName }}
              }
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row" class="action-cell">
              @if (isDraftRow(row)) {
                <button class="inline-action-btn save" (click)="saveDraftRow()" [disabled]="savingDraftRow">Save</button>
                <button class="inline-action-btn cancel" (click)="cancelDraftRow()" [disabled]="savingDraftRow">Cancel</button>
              } @else {
                <span class="muted-action">-</span>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              [class.selected-row]="row === selectedTableRow"
              (click)="onTableRowClick(row)"></tr>

          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data-cell" [attr.colspan]="displayedColumns.length">No parts found.</td>
          </tr>
        </table>
      </div>

      <!-- Footer with actions + pagination -->
      <div class="footer-panel">
        <div class="footer-pagination">
          <span class="pagination-label">Items per page:</span>
          <mat-select class="page-size-select-mat"
                      [(ngModel)]="pageSize"
                      (selectionChange)="onPageSizeChange($event.value)"
                      panelClass="pagination-panel"
                      disableOptionCentering>
            @for (size of pageSizeOptions; track size) {
              <mat-option [value]="size">{{ size === 'all' ? 'All' : size }}</mat-option>
            }
          </mat-select>

          <span class="pagination-range">
            {{ paginationStart }}-{{ paginationEnd }} of {{ totalCount || filteredSortedParts.length }}
          </span>

          <button
            mat-icon-button
            class="pagination-btn"
            (click)="goToPreviousPage()"
            [disabled]="!canGoPreviousPage()"
            matTooltip="Previous page"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>

          <button
            mat-icon-button
            class="pagination-btn"
            (click)="goToNextPage()"
            [disabled]="!canGoNextPage()"
            matTooltip="Next page"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>

        <div class="footer-right-actions">
          <button mat-raised-button class="footer-button"
                  (click)="onAddPart()"
                  [disabled]="!isAdminUser()"
                  [matTooltip]="isAdminUser() ? 'Add a new master part' : 'Only admins have access'">
            Add
          </button>

          <button mat-raised-button class="footer-button delete-button"
                  (click)="onDeletePart()"
                  [disabled]="!isAdminUser() || !selectedTableRow || isAddingRow"
                  [matTooltip]="isAdminUser() ? 'Delete selected master part' : 'Only admins have access'">
            Delete
          </button>

          <button
            mat-raised-button
            class="footer-button"
            (click)="onItemLookupComingSoon()"
            matTooltip="Lookup item Id in Clarify"
          >
            Item ID Lookup
          </button>

          <button mat-raised-button class="footer-button" (click)="onExport()" matTooltip="Export data">
            Export
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    /* -- Component Layout -- */
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
      padding: 12px 40px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;
    }

    .page-title-right { font-size: 20px; font-weight: 420; color: #8a4d00; margin: 0 0 0 auto; padding-right: 10px; margin-right:-21px;}

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

    .nav-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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

    .add-nav-item {
      flex-shrink: 0;
      margin-right: 4px;
    }

    /* -- Controls panel -- */
    .controls-panel {
      background: #fff;
      padding: 4px 32px 4px 20px;
      border-bottom: 1px solid #e0e0e0;
      overflow-x: auto;
      flex-shrink: 0;
    }
    .control-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 0px;
      flex-wrap: nowrap;
    }
    .control-label {
      font-size: 13px;
      font-weight: 600;
      color: #8a4d00;
      min-width: 72px;
      white-space: nowrap;
      flex-shrink: 0;
      margin-left: 1px;
    }
    .radio-group {
      display: flex;
      flex-wrap: nowrap;
      gap: 0 8px;
      align-items: center;
      overflow: visible;
    }
    .radio-group mat-radio-button { font-size: 13px; white-space: nowrap; }
    /* orange accent on selected radio */
    ::ng-deep .radio-group .mat-mdc-radio-button.mat-primary .mdc-radio__background::before { background-color: #ff9800 !important; }
    ::ng-deep .radio-group .mat-mdc-radio-button.mat-primary.mat-mdc-radio-checked .mdc-radio__outer-circle { border-color: #ff9800 !important; }
    ::ng-deep .radio-group .mat-mdc-radio-button.mat-primary.mat-mdc-radio-checked .mdc-radio__inner-circle { background-color: #ff9800 !important; }

    .total-count-label {
      font-size: 13px;
      font-weight: 600;
      color: #8a4d00;
      margin-left: 12px;
    }
    .total-count-label strong {
      color: #ff9800;
      font-weight: 700;
    }

    .search-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .compact-search-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-right: -19px;
      flex-shrink: 0;
    }
    /* reuse workitems header-select styles for parity */
    .header-select-group.compact { display: flex; align-items: center; gap: 8px; }
    .header-select-label { font-size: 13px; font-weight: 600; color: #374151; white-space: nowrap; font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif; line-height: 1; }
    .header-select.compact-select { height: 32px !important; min-width: 140px !important; border: 1.5px solid #e5e7eb !important; border-radius: 6px !important; background: white !important; display: flex !important; align-items: center !important; }
    
    ::ng-deep .header-select.compact-select .mdc-select {
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
    }

    ::ng-deep .header-select.compact-select .mdc-select__anchor {
      height: 32px !important;
      min-height: 32px !important;
      padding: 0 8px !important;
      display: flex !important;
      align-items: center !important;
      border: none !important;
      background: transparent !important;
      transition: none !important;
    }

    ::ng-deep .header-select.compact-select .mdc-notched-outline {
      display: none !important;
    }

    ::ng-deep .header-select.compact-select .mat-mdc-select-trigger {
      display: flex !important;
      align-items: center !important;
      color: #374151 !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      height: 32px !important;
      line-height: 32px !important;
      padding: 0 8px !important;
      width: 100% !important;
    }

    ::ng-deep .header-select.compact-select:focus-within {
      border: 1.5px solid #ff9800 !important;
    }

    ::ng-deep .header-select.compact-select.mat-focused {
      border: 1.5px solid #ff9800 !important;
      box-shadow: none !important;
    }

    ::ng-deep .header-select.compact-select .mdc-select__dropdown-icon {
      display: none !important;
    }
    .record-count { font-size: 13px; color: #6b7280; }

    /* --- Search Input Field --- */
    .compact-search-value {
      width: 180px;
      flex-shrink: 0;
    }

    .compact-search-value ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none !important;
    }

    .compact-search-value ::ng-deep .mat-mdc-text-field-wrapper {
      padding: 0 !important;
      background: #ffffff !important;
      border: 1.5px solid #e5e7eb !important;
      border-radius: 6px !important;
    }

    .compact-search-value ::ng-deep .mat-mdc-form-field-flex {
      align-items: center !important;
      min-height: 32px !important;
      max-height: 32px;
    }

    .compact-search-value ::ng-deep .mat-mdc-form-field-infix {
      min-height: auto !important;
      height: auto !important;
      padding: 4px 0 !important;
      border-top: 0 !important;
      width: auto !important;
    }

    .compact-search-value ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: transparent !important;
      opacity: 0 !important;
    }

    .compact-search-value ::ng-deep .mdc-text-field__input,
    .compact-search-value ::ng-deep .mdc-text-field--no-label:not(.mdc-text-field--textarea) .mat-mdc-form-field-input-control.mdc-text-field__input {
      height: auto !important;
    }

    .compact-search-value ::ng-deep .mdc-text-field__input {
      padding: 6px 8px !important;
      text-align: left !important;
      font-size: 13px !important;
      color: #374151 !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      caret-color: #374151 !important;
    }

    .compact-search-value ::ng-deep .mdc-text-field__input::placeholder {
      color: #9ca3af !important;
      opacity: 1;
    }

    .compact-search-value ::ng-deep .mdc-line-ripple::before,
    .compact-search-value ::ng-deep .mdc-line-ripple::after {
      display: none !important;
    }

    .compact-search-value.mat-focused ::ng-deep .mat-mdc-text-field-wrapper,
    .compact-search-value ::ng-deep .mdc-text-field--focused {
      border: 1.5px solid #ff9800 !important;
      box-shadow: none !important;
    }

    /* --- Dropdown Panel Options --- */
    ::ng-deep .custom-select-panel .mat-mdc-option {
      font-size: 13px !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      color: #374151 !important;
      height: 36px !important;
      padding-left: 8px !important;
    }

    ::ng-deep .custom-select-panel .mat-mdc-option:hover:not(.mdc-list-item--disabled) {
      background-color: #f1ece5 !important;
    }

    /* Remove Angular Material's focus/active state layer background */
    ::ng-deep .custom-select-panel .mat-mdc-option:focus.mdc-list-item,
    ::ng-deep .custom-select-panel .mat-mdc-option.mat-mdc-option-active.mdc-list-item {
      background-color: transparent !important;
    }

    ::ng-deep .custom-select-panel .mat-mdc-option.mat-selected {
      background-color: #f1ece5 !important;
      color: #374151 !important;
      font-weight: 600 !important;
    }

    ::ng-deep .custom-select-panel .mat-mdc-option.mat-selected:hover {
      background-color: #f1ece5 !important;
      color: #374151 !important;
    }

    ::ng-deep .custom-select-panel .mat-mdc-option .mat-pseudo-checkbox,
    ::ng-deep .custom-select-panel .mat-pseudo-checkbox,
    ::ng-deep .custom-select-panel .mat-mdc-option-pseudo-checkbox {
      display: none !important;
      width: 0 !important;
      margin: 0 !important;
    }

    /* -- Table Container -- */
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
    .parts-table {
      width: 100%;
      min-width: 2000px;
      border-collapse: separate;
      border-spacing: 0;
    }

    /* Table header styling */
    .parts-table th.mat-mdc-header-cell {
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

    




    .parts-table td.mat-mdc-cell {
      font-size: 12px;
      padding: 8px 12px;
      border-bottom: 1px solid #f0f0f0;
      vertical-align: middle;
    }
    .parts-table tr.mat-mdc-row:hover td { background: #f1ece5; }

    .parts-table tr.selected-row {
      background: #f1ece5 !important;
    }

    .parts-table tr.selected-row:hover td {
      background: #ffe8cc !important;
    }


    /* Removed duplicates */








    /* Column-specific widths */
    .parts-table [matColumnDef="itemId"] th,
    .parts-table [matColumnDef="itemId"] td { width: 120px; min-width: 100px; }

    .parts-table [matColumnDef="oracleItemId"] th,
    .parts-table [matColumnDef="oracleItemId"] td { width: 130px; min-width: 110px; }

    .parts-table [matColumnDef="partDesc"] th,
    .parts-table [matColumnDef="partDesc"] td { min-width: 250px; }

    .parts-table [matColumnDef="orderParm"] th,
    .parts-table [matColumnDef="orderParm"] td { min-width: 150px; }

    .parts-table [matColumnDef="partNum"] th,
    .parts-table [matColumnDef="partNum"] td { min-width: 130px; }

    .parts-table [matColumnDef="vendorName"] th,
    .parts-table [matColumnDef="vendorName"] td { min-width: 180px; }

    .parts-table [matColumnDef="manufacturerName"] th,
    .parts-table [matColumnDef="manufacturerName"] td { min-width: 180px; }

    .parts-table [matColumnDef="cost"] th,
    .parts-table [matColumnDef="cost"] td { width: 100px; min-width: 90px; }

    .parts-table [matColumnDef="uom"] th,
    .parts-table [matColumnDef="uom"] td { width: 80px; min-width: 70px; }

    .parts-table [matColumnDef="categoryName"] th,
    .parts-table [matColumnDef="categoryName"] td { min-width: 160px; }

    .parts-table [matColumnDef="kit"] th,
    .parts-table [matColumnDef="kit"] td { width: 70px; min-width: 60px; }

    .parts-table [matColumnDef="active"] th,
    .parts-table [matColumnDef="active"] td { width: 80px; min-width: 70px; }

    .parts-table [matColumnDef="partGroupName"] th,
    .parts-table [matColumnDef="partGroupName"] td { min-width: 120px; }

    .desc-cell { word-break: break-word; white-space: normal; }
    .cost-cell { text-align: right; }
    .num-header, .bool-header { text-align: center; }
    .bool-cell { text-align: center; }
    .bool-cell mat-icon { font-size: 18px; width: 18px; height: 18px; vertical-align: middle; }
    .icon-yes { color: #4caf50; }
    .icon-no  { color: #bdbdbd; }

    .inline-edit-input {
      width: 100%;
      min-width: 90px;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 10px 6px;
      font-size: 13px;
      color: #374151;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      background: #fff;
      outline: none;
    }

    .inline-edit-input:focus {
      border-color: #f1ece5;
      box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.15);
    }

    .inline-edit-number {
      text-align: right;
    }

    .action-cell {
      white-space: nowrap;
      text-align: center;
    }

    .inline-action-btn {
      border: 1px solid #e5e7eb;
      background: #fff;
      color: #374151;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      margin-right: 6px;
      cursor: pointer;
    }

    .inline-action-btn.save {
      border-color: #ff9800;
      color: #8a4d00;
    }

    .inline-action-btn.save:hover:not(:disabled) {
      background: #f1ece5;
    }

    .inline-action-btn.cancel:hover:not(:disabled) {
      background: #f5f5f5;
    }

    .inline-action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .muted-action {
      color: #9ca3af;
    }

    .no-data-cell { text-align: center; padding: 32px; color: #9e9e9e; font-style: italic; }

    /* -- Spinner -- */
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

    /* -- Footer panel -- */
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
    }
    
    

    .footer-left-actions,
    .footer-right-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 140px;
    }

    .footer-right-actions {
      justify-content: flex-end;
      min-width: fit-content;
    }

    .footer-pagination {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #374151;
      font-size: 12px;
      font-weight: 500;
      min-height: 32px;
      padding-left: 400px;
    }

    .pagination-label {
      color: #6b7280;
      white-space: nowrap;
    }

    /* Page size mat-select (replaces native <select>) */
    .page-size-select-mat {
      height: 32px !important;
      min-width: 64px !important;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      background: #fff;
      color: #374151;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
    }

    ::ng-deep .page-size-select-mat .mdc-notched-outline {
      display: none !important;
    }

    ::ng-deep .page-size-select-mat .mat-mdc-select-trigger {
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      padding: 0 8px !important;
      font-size: 12px !important;
      color: #374151 !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
    }

    ::ng-deep .page-size-select-mat .mdc-select__anchor {
      height: 32px !important;
      min-height: 32px !important;
    }

    .page-size-select-mat:focus-within {
      border-color: #ff9800;
      box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.15);
    }

    /* Pagination dropdown panel options */
    ::ng-deep .pagination-panel .mat-mdc-option {
      font-size: 12px !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      color: #374151 !important;
      height: 36px !important;
      min-height: 36px !important;
    }

    ::ng-deep .pagination-panel .mat-mdc-option:hover:not(.mdc-list-item--disabled),
    ::ng-deep .pagination-panel .mat-mdc-option.mat-mdc-option-active.mdc-list-item {
      background-color: #f1ece5 !important;
    }

    ::ng-deep .pagination-panel .mat-mdc-option.mat-selected:not(.mat-mdc-option-multiple) {
      background-color: #f1ece5 !important;
      font-weight: 600 !important;
    }

    ::ng-deep .pagination-panel .mat-mdc-option .mat-pseudo-checkbox {
      display: none !important;
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
    .footer-button:hover {
      background: #e68900;
      box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
    }
    .footer-button:disabled,
    .footer-button[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
      background: #d1d5db !important;
      color: #9ca3af !important;
      box-shadow: none !important;
    }
    .footer-button.cancel-button {
      background: #d1d5db;
      color: #374151;
    }
    .footer-button.cancel-button:hover {
      background: #9ca3af;
    }
    .footer-button.delete-button {
      background: #ff9800;
      color: #fff;
    }
    .footer-button.delete-button:hover {
      background:#e68900;
    }

    .access-denied-banner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #e5e7eb;
      color: #4b5563;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }

    .access-denied-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #6b7280;
    }

    /* dark theme */
    :host-context([data-theme="dark"]) {
      background: #121212;
    }
    :host-context([data-theme="dark"]) .controls-panel { background: #1e1e1e !important; border-bottom-color: #424242 !important; }
    :host-context([data-theme="dark"]) .control-label { color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .table-wrapper { background: #121212 !important; }
    :host-context([data-theme="dark"]) .parts-table th.mat-mdc-header-cell { background: #1e1e1e !important; color: #ff9800 !important; border-bottom-color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .parts-table td.mat-mdc-cell { color: #e0e0e0 !important; border-bottom-color: #2a2a2a !important; }
    :host-context([data-theme="dark"]) .parts-table tr.mat-mdc-row:hover td { background: #2a1a08 !important; }
    :host-context([data-theme="dark"]) .footer-panel { background: #1e1e1e !important; border-top-color: #424242 !important; }
    :host-context([data-theme="dark"]) .footer-button { background: #ff9800 !important; }
    :host-context([data-theme="dark"]) .footer-button:hover { background: #e68900 !important; }
    :host-context([data-theme="dark"]) .footer-button.cancel-button { background: #424242 !important; color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .footer-button.cancel-button:hover { background: #555 !important; }
    :host-context([data-theme="dark"]) .access-denied-banner { background: #2a2a2a !important; color: #d1d5db !important; border-color: #424242 !important; }
    :host-context([data-theme="dark"]) .access-denied-icon { color: #9ca3af !important; }
  `]
})
export class PartsListComponent implements OnInit, AfterViewInit {

  displayedColumns = [
    'itemId',
    // 'oracleItemId', // hidden per UX request
    'partDesc', 'orderParm', 'partNum',
    'vendorName', 'manufacturerName', 'cost', 'uom', 'categoryName',
    'kit', 'active', 'partGroupName', 'actions'
  ];

  partGroups = [
    { id: '1', label: 'Facilities' },
    // { id: '2', label: 'Long Haul' },
    // { id: '3', label: 'Metro' },
  ];

  sortOptions = [
    { value: 'partDesc',        label: 'Description' },
    { value: 'orderParm',       label: 'Ordering Parameter' },
    { value: 'partNum',         label: 'Part Number' },
    { value: 'vendorName',      label: 'Vendor' },
    { value: 'manufacturerName', label: 'Manufacturer' },
    { value: 'categoryName',    label: 'Material Category' },
    { value: 'kit',             label: 'Kit' },
    { value: 'active',          label: 'Active' },
  ];

  searchByOptions = [
    { value: 'partNum', label: 'Part Number' },
    { value: 'vendorName', label: 'Vendor' },
    { value: 'partDesc', label: 'Description' },
    { value: 'itemId', label: 'SAP Item ID' },
    { value: 'oracleItemId', label: 'Oracle Item ID' },
  ];

  selectedGroupId = '1';   // Facilities (facId in VB6 Global_Declarations)
  sortBy = 'manufacturerName'; // Matches VB6 default sSqlManu
  // Default to Part Number like work-items component
  searchByField: keyof MasterPart | null = 'partNum';
  searchByValue = '';
  loading = false;
  totalCount = 0;
  selectedTableRow: MasterPart | null = null;
  draftRow: MasterPart | null = null;
  isAddingRow = false;
  savingDraftRow = false;

  pageSizeOptions: Array<number | 'all'> = [10, 30, 50, 100, 'all'];
  pageSize: number | 'all' = 10;
  pageIndex = 0;
  filteredSortedParts: MasterPart[] = [];

  private allParts: MasterPart[] = [];
  private sortedCache: { [key: string]: MasterPart[] } = {};
  dataSource = new MatTableDataSource<MasterPart>([]);
  @ViewChild('tableWrapper') tableWrapper?: ElementRef<HTMLDivElement>;
  @ViewChild('searchBySelect') searchBySelectRef?: MatSelect;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    this.loadParts();
  }

  ngAfterViewInit(): void {
    // Re-apply filter and sort after view init
    this.onSearchValueChange();
  }

  goBack(): void {
    this.dialogRef?.close();
    this.router.navigate(['/admin']);
  }

  isDraftRow(row: MasterPart): boolean {
    return this.draftRow === row;
  }

  private precomputeSortedArrays(): void {
    this.sortedCache = {};
    for (const opt of this.sortOptions) {
      const key = opt.value as keyof MasterPart;
      const sorted = [...this.allParts].sort((a, b) => {
        const av = String(a[key] ?? '').toLowerCase().trim();
        const bv = String(b[key] ?? '').toLowerCase().trim();
        if (!av && bv) return 1;
        if (av && !bv) return -1;
        if (!av && !bv) return 0;
        const cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
        if (cmp === 0 && key === 'manufacturerName') {
          return String(a.partNum ?? '').toLowerCase().localeCompare(
            String(b.partNum ?? '').toLowerCase(), undefined, { sensitivity: 'base' });
        }
        return cmp;
      });
      this.sortedCache[opt.value] = sorted;
    }
  }

  loadParts(): void {
    this.loading = true;
    this.isAddingRow = false;
    this.draftRow = null;
    // Load parts data
    this.adminService.getParts(this.selectedGroupId).subscribe({
      next: (data) => {
        this.allParts = data;
        // Backend already returns data sorted by manufacturer+partNum
        // Pre-compute all sort arrays once for instant switching
        this.precomputeSortedArrays();
        // For manufacturer (default), use the pre-sorted data from backend directly
        this.dataSource.data = this.sortBy === 'manufacturerName'
          ? [...data]
          : (this.sortedCache[this.sortBy] ?? data);
        // Ensure table data is visible immediately without requiring any additional click.
        this.onSearchValueChange(true);
        // Select first row by default
        if (this.dataSource.data.length > 0) {
          this.selectedTableRow = this.dataSource.data[0];
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading parts:', err);
        this.snackBar.open('Failed to load parts', 'Close', { duration: 4000 });
      }
    });

    // Load total count
    this.adminService.getTotalMasterPartsCount().subscribe({
      next: (count) => {
        this.totalCount = count;
      },
      error: (err) => {
        console.error('Error loading parts count:', err);
      }
    });
  }

  /**
   * Clear search and reset to all parts
   */
  clearSearch(): void {
    this.searchByValue = '';
    this.onSearchValueChange();
  }

  /**
   * Sort order changed - re-apply search filtering with new sort
   */
  onSortByChange(): void {
    this.onSearchValueChange(true);
  }

  /** Close the Search By dropdown when clicking anywhere outside it */
  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (this.searchBySelectRef?.panelOpen) {
      const el = target as HTMLElement | null;
      if (!el?.closest('mat-select')) {
        this.searchBySelectRef.close();
      }
    }
  }

  onSearchFieldChange(selectRef?: { close: () => void }): void {
    this.searchByValue = '';
    this.onSearchValueChange(true);
    selectRef?.close();
  }

  getSearchPlaceholder(): string {
    const selectedOption = this.searchByOptions.find(option => option.value === this.searchByField);
    return selectedOption ? `Search by ${selectedOption.label}` : 'Search value';
  }

  /**
   * Called when search value changes - auto-filters as user types
   */
  onSearchValueChange(resetToFirstPage = false): void {
    // Use pre-computed sorted array
    const sorted = this.sortedCache[this.sortBy] ?? [...this.allParts];
    const searchValue = this.searchByValue.toLowerCase().trim();
    const key = this.searchByField;

    let filtered: MasterPart[];
    if (!searchValue || !key) {
      // Clear search - show all parts based on current sort
      filtered = sorted;
    } else {
      // Auto-filter as user types
      filtered = sorted.filter(p => {
        const fieldValue = String(p[key] ?? '').toLowerCase().trim();
        return fieldValue.includes(searchValue);
      });
    }

    this.filteredSortedParts = filtered;

    if (resetToFirstPage) {
      this.pageIndex = 0;
    }

    this.applyPagination();

    // Select first row of filtered results
    if (this.dataSource.data.length > 0) {
      this.selectedTableRow = this.dataSource.data[0];
    } else {
      this.selectedTableRow = null;
    }
  }

  /**
   * Search button click - explicit search
   */
  onSearchByClick(): void {
    const searchValue = this.searchByValue.trim();
    if (!searchValue) {
      this.snackBar.open('Enter a search term', 'Close', { duration: 2000 });
      return;
    }

    // Trigger the same filtering as onSearchValueChange
    this.onSearchValueChange();
  }

  /**
   * Table row clicked - select it
   */
  onTableRowClick(row: MasterPart): void {
    this.selectedTableRow = row;
  }

  onAddPart(): void {
    if (!this.isAdminUser()) {
      this.snackBar.open('Admin access required to add parts', 'Close', { duration: 3000 });
      return;
    }

    if (this.isAddingRow) {
      this.snackBar.open('Finish or cancel the current new row first', 'Close', { duration: 3000 });
      return;
    }

    const draft: MasterPart = {
      partId: 0,
      itemId: '',
      oracleItemId: '',
      partDesc: '',
      orderParm: '',
      partNum: '',
      vendorCompanyId: 0,
      mfrCompanyId: 0,
      cost: 0,
      uom: '',
      categoryId: 0,
      kit: false,
      active: true,
      partGroupId: this.selectedGroupId,
      vendorName: '',
      manufacturerName: '',
      categoryName: '',
      partGroupName: 'Facilities'
    };

    this.isAddingRow = true;
    this.draftRow = draft;
    this.searchByValue = '';
    this.allParts = [...this.allParts, draft];

    // Keep draft at the end and jump to last page so it is immediately visible.
    const sorted = this.sortedCache[this.sortBy] ?? this.allParts.filter(p => p !== draft);
    this.filteredSortedParts = [...sorted, draft];
    this.pageIndex = Math.max(Math.ceil(this.filteredSortedParts.length / this.getEffectivePageSize()) - 1, 0);
    this.applyPagination();

    this.selectedTableRow = draft;
    this.cdr.detectChanges();

    setTimeout(() => {
      if (this.tableWrapper?.nativeElement) {
        this.tableWrapper.nativeElement.scrollTop = this.tableWrapper.nativeElement.scrollHeight;
      }
    }, 0);
  }

  onDeletePart(): void {
    if (!this.isAdminUser()) {
      this.snackBar.open('Admin access required to delete parts', 'Close', { duration: 3000 });
      return;
    }

    if (this.isAddingRow || this.draftRow) {
      this.snackBar.open('Save or cancel the current new row first', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedTableRow?.partId) {
      this.snackBar.open('Please select a part to delete', 'Close', { duration: 2500 });
      return;
    }

    const selected = this.selectedTableRow;
    const label = selected.partNum || selected.partDesc || String(selected.partId);

    const dialogRef = this.dialog.open(MasterPartDeleteConfirmationDialogComponent, {
      width: '420px',
      data: { partDesc: label }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        return;
      }

      this.adminService.deletePart(selected.partId).subscribe({
        next: () => {
          this.snackBar.open('Master part deleted successfully', 'Close', { duration: 3000 });
          this.selectedTableRow = null;
          this.loadParts();
        },
        error: (err) => {
          console.error('Error deleting master part:', err);
          this.snackBar.open(err?.error?.message || 'Failed to delete master part', 'Close', { duration: 4000 });
        }
      });
    });
  }

  cancelDraftRow(): void {
    if (!this.draftRow) {
      return;
    }

    this.allParts = this.allParts.filter(p => p !== this.draftRow);
    this.draftRow = null;
    this.isAddingRow = false;
    this.onSearchValueChange();
  }

  onPageSizeChange(size: number | 'all'): void {
    this.pageSize = size === 'all' ? 'all' : (Number(size) || 10);
    this.pageIndex = 0;
    this.applyPagination();
  }

  canGoPreviousPage(): boolean {
    return this.pageIndex > 0;
  }

  canGoNextPage(): boolean {
    const effectiveSize = this.getEffectivePageSize();
    return (this.pageIndex + 1) * effectiveSize < this.filteredSortedParts.length;
  }

  goToPreviousPage(): void {
    if (this.canGoPreviousPage()) {
      this.pageIndex -= 1;
      this.applyPagination();
    }
  }

  goToNextPage(): void {
    if (this.canGoNextPage()) {
      this.pageIndex += 1;
      this.applyPagination();
    }
  }

  onItemLookupComingSoon(): void {
    this.snackBar.open('Item Lookup will be coming soon', 'Close', { duration: 2200 });
  }

  get paginationStart(): number {
    if (!this.filteredSortedParts.length) {
      return 0;
    }
    return this.pageIndex * this.getEffectivePageSize() + 1;
  }

  get paginationEnd(): number {
    if (!this.filteredSortedParts.length) {
      return 0;
    }
    return Math.min((this.pageIndex + 1) * this.getEffectivePageSize(), this.filteredSortedParts.length);
  }

  private getEffectivePageSize(): number {
    return this.pageSize === 'all' ? Math.max(this.filteredSortedParts.length, 1) : this.pageSize;
  }

  private applyPagination(): void {
    const total = this.filteredSortedParts.length;
    const effectiveSize = this.getEffectivePageSize();
    const maxPageIndex = Math.max(Math.ceil(total / effectiveSize) - 1, 0);
    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = maxPageIndex;
    }

    const start = this.pageIndex * effectiveSize;
    const end = start + effectiveSize;
    this.dataSource.data = this.filteredSortedParts.slice(start, end);
  }

  saveDraftRow(): void {
    if (!this.draftRow) {
      return;
    }

    if (!String(this.draftRow.partNum ?? '').trim() || !String(this.draftRow.partDesc ?? '').trim()) {
      this.snackBar.open('Part Number and Description are required', 'Close', { duration: 3000 });
      return;
    }

    const payload: Partial<MasterPart> = {
      itemId: String(this.draftRow.itemId ?? '').trim(),
      oracleItemId: String(this.draftRow.oracleItemId ?? '').trim(),
      partDesc: String(this.draftRow.partDesc ?? '').trim(),
      orderParm: String(this.draftRow.orderParm ?? '').trim(),
      partNum: String(this.draftRow.partNum ?? '').trim(),
      vendorCompanyId: Number(this.draftRow.vendorCompanyId ?? 0) > 0 ? Number(this.draftRow.vendorCompanyId) : undefined,
      mfrCompanyId: Number(this.draftRow.mfrCompanyId ?? 0) > 0 ? Number(this.draftRow.mfrCompanyId) : undefined,
      cost: Number(this.draftRow.cost ?? 0),
      uom: String(this.draftRow.uom ?? '').trim(),
      categoryId: Number(this.draftRow.categoryId ?? 0) > 0 ? Number(this.draftRow.categoryId) : undefined,
      kit: !!this.draftRow.kit,
      active: !!this.draftRow.active,
      partGroupId: this.selectedGroupId,
      vendorName: String(this.draftRow.vendorName ?? '').trim(),
      manufacturerName: String(this.draftRow.manufacturerName ?? '').trim(),
      categoryName: String(this.draftRow.categoryName ?? '').trim(),
      partGroupName: String(this.draftRow.partGroupName ?? '').trim() || 'Facilities'
    };

    this.savingDraftRow = true;
    this.adminService.savePart(payload).subscribe({
      next: () => {
        this.snackBar.open('Master part added successfully', 'Close', { duration: 3000 });
        this.savingDraftRow = false;
        this.isAddingRow = false;
        this.draftRow = null;
        this.loadParts();
      },
      error: (err) => {
        this.savingDraftRow = false;
        console.error('Error saving new master part:', err);
        this.snackBar.open(err?.error?.message || 'Failed to add master part', 'Close', { duration: 4000 });
      }
    });
  }

  /**
   * Check if current user is an admin (dataAdmin role)
   * Admins have full access to Item ID Lookup
   * Non-admins have read-only access
   */
  isAdminUser(): boolean {
    const user = this.authService.currentUser();
    return user?.dataAdmin === true;
  }

  /**
   * ADMIN ONLY: Open Item ID Lookup modal dialog
   * Allows admins to select a part and update SAP Item ID for the currently selected part
   */
  onItemIdLookup(): void {
    // Check authorization
    if (!this.isAdminUser()) {
      this.snackBar.open('? Unauthorized: Admin access required for Item ID Lookup', 'Close', { duration: 4000 });
      return;
    }

    // Check if a row is selected
    if (!this.selectedTableRow) {
      this.snackBar.open('? Please select a part first', 'Close', { duration: 3000 });
      return;
    }

    // Legacy behavior: lookup is driven by currently selected row part number,
    // and may return multiple candidate rows for that part number.
    const selectedPartNum = String(this.selectedTableRow.partNum ?? '').trim().toLowerCase();
    const lookupCandidates = this.allParts.filter(part =>
      String(part.partNum ?? '').trim().toLowerCase() === selectedPartNum
    );

    if (lookupCandidates.length === 0) {
      this.snackBar.open(
        `No match found in Item Master/Supply Logistics for Part Number: ${this.selectedTableRow.partNum || '(empty)'}`,
        'Close',
        { duration: 4500 }
      );
      return;
    }

    // Open the dialog
    const dialogRef = this.dialog.open(ItemIdLookupDialog, {
      width: '1200px',
      maxHeight: '90vh',
      data: { parts: lookupCandidates },
      disableClose: false
    });

    // Handle dialog close and result
    dialogRef.afterClosed().subscribe(selectedPart => {
      if (selectedPart) {
        // ? User selected a part - update the currently selected row
        console.log('Selected part for lookup:', selectedPart);
        console.log('Original selected part:', this.selectedTableRow);
        
        // Update the selected part's SAP Item ID with the selected lookup result
        if (this.selectedTableRow) {
          this.selectedTableRow.itemId = selectedPart.sapItemId;
          
          // Persist the change to backend via Oracle DB query
          this.adminService.updateMasterPartItemId(this.selectedTableRow.partId, selectedPart.sapItemId).subscribe({
            next: (result) => {
              console.log('? SAP Item ID persisted to backend:', result);
              this.snackBar.open(`? Updated SAP Item ID to: ${selectedPart.sapItemId}`, 'Close', { duration: 3000 });
            },
            error: (err) => {
              console.error('? Error persisting SAP Item ID:', err);
              this.snackBar.open(`? Failed to save SAP Item ID: ${err.message}`, 'Close', { duration: 4000 });
            }
          });
        }
      } else {
        // ? User cancelled or closed dialog
        console.log('User cancelled Item ID Lookup');
      }
    });
  }

  /**
   * Export the master parts list to a downloadable format
   * Currently shows placeholder - should export to CSV or Excel with:
   * - All visible columns from the current view
   * - Applied search/filter criteria
   * - Current sort order
   */
  onExport(): void {
    const visibleRows = this.dataSource.data ?? [];

    if (visibleRows.length === 0) {
      this.snackBar.open('No rows to export', 'Close', { duration: 2500 });
      return;
    }

    const exportData = visibleRows.map(row => ({
      'SAP Item Id': row.itemId ?? '',
      'Description': row.partDesc ?? '',
      'Ordering Parameter': row.orderParm ?? '',
      'Part Number': row.partNum ?? '',
      'Vendor': row.vendorName ?? '',
      'Manufacturer': row.manufacturerName ?? '',
      'Cost': row.cost ?? '',
      'UOM': row.uom ?? '',
      'Material Category': row.categoryName ?? '',
      'Kit': row.kit ? 'Yes' : 'No',
      'Active': row.active ? 'Yes' : 'No',
      'Part Group': row.partGroupName ?? ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Parts');

    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    XLSX.writeFile(workbook, `master-parts-list-${timestamp}.xlsx`);
    this.snackBar.open(`Exported ${visibleRows.length} rows to Excel`, 'Close', { duration: 3000 });
  }

  onCancel(): void {
    this.snackBar.open('Cancelled', 'Close', { duration: 3000 });
  }
}

@Component({
  selector: 'app-master-part-delete-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="delete-dialog">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 class="dialog-title">Confirm Deletion</h2>
      </div>
      <div class="dialog-content">
        <p>Are you sure you want to delete this master part?</p>
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
      word-break: break-word;
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
export class MasterPartDeleteConfirmationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { partDesc?: string }) {}
}

