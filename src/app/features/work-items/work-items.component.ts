import { Component, OnInit, signal, computed, ViewChild, ViewChildren, QueryList, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSelect } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { WorkItemService } from '../../core/services/work-item.service';
import { WorkItemWizardDialog } from './operation-category-selection-dialog';
import { WiNotesDialog } from './wi-notes-dialog';
import { WorkItem, ProjectPart } from '../../core/models/models';
import { WorkItemDeletedDialog } from './work-item-deleted-dialog';
import { WorkItemDeleteDialog } from './delete-work-item-dialog';
import { WorkItemIntroDialog } from './work-item-intro-dialog';
import { ConfirmationDialog } from './confirmation.dialog';

/**
 * Work Items component — converted from VB6 frmWorkItems.
 * Top: Work Items grid with WI#, Operation, Notes.
 * Bottom three panels: Associated WI Parts, LineUp & Bay Locations, Additional Associated Parts.
 * Toolbar: Add (wizard), Delete, Edit, WI Notes, Inst Notes, Up/Down reorder, Part Group, Part Sort.
 */
@Component({
  selector: 'app-work-items',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatToolbarModule,
    MatTooltipModule, MatSelectModule, MatFormFieldModule, MatInputModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatRadioModule,
    MatExpansionModule, MatTabsModule, MatDialogModule
  ],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <button mat-button class="back-button" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
          <span>Back to Project: {{ projectNum }}</span>
        </button>
        <div class="header-divider-v"></div>

        <button class="nav-item add-btn" (click)="addWorkItem()" matTooltip="Add work item">
          <mat-icon>add_circle</mat-icon>
          <span>Add</span>
        </button>

        <button class="nav-item delete-btn" (click)="deleteWorkItem()" [disabled]="!selectedWorkItem()" matTooltip="Delete work item">
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>

        <button class="nav-item edit-btn" (click)="editWorkItem()" [disabled]="!selectedWorkItem()" matTooltip="Edit work item">
          <mat-icon>edit</mat-icon>
          <span>Edit</span>
        </button>

        <button class="nav-item" (click)="openWiNotes()" [disabled]="!selectedWorkItem()" matTooltip="WI Notes">
          <mat-icon>notes</mat-icon>
          <span>WI Notes</span>
        </button>

        <div class="header-divider-v"></div>

    

        <div class="header-select-group">
          <label class="header-select-label">Part Sort:</label>
          <mat-select #partSortSelect class="header-select" [ngModel]="partSort()" (ngModelChange)="partSort.set($event)" panelClass="custom-select-panel">
            <mat-option value="desc">Description</mat-option>
            <mat-option value="num">Part Number</mat-option>
          </mat-select>
        </div>
      </div>
      <div class="header-right">
        <span class="page-title-right">Work Items Menu</span>
      </div>
    </div>
    <div class="header-divider"></div>

    @if (loading()) {
      <div class="spinner-wrapper">
        <mat-spinner diameter="44"></mat-spinner>
        <p class="spinner-text">Loading WorkItems...</p>
      </div>
    } @else {
      <div class="wi-body">
        <div class="tab-content">
          <div class="dashboard-grid">
            <section class="grid-panel">
              <div class="panel-title work-items-panel-title">Work Items</div>
              <div class="panel-table-wrap">
                <table mat-table [dataSource]="workItems()" class="full-width">
                  <ng-container matColumnDef="wrkItemNum">
                    <th mat-header-cell *matHeaderCellDef>WI #</th>
                    <td mat-cell *matCellDef="let row">{{ row.workItemNum }}</td>
                  </ng-container>
                  <ng-container matColumnDef="wrkOpDesc">
                    <th mat-header-cell *matHeaderCellDef>Operation</th>
                    <td mat-cell *matCellDef="let row">{{ getOperationLabelById(row.workOpId) }}</td>
                  </ng-container>
                  <ng-container matColumnDef="wrkItemTxt">
                    <th mat-header-cell *matHeaderCellDef>Notes</th>
                    <td mat-cell *matCellDef="let row" class="notes-cell">{{ getFirstLineOfNotes(row.workItemText) }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="workItemColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: workItemColumns;"
                      [class.selected]="selectedWorkItem()?.workItemId === row.workItemId"
                      (click)="selectWorkItem(row)"></tr>
                </table>
                <p *ngIf="!workItems().length" class="empty-msg">No work items found.</p>
              </div>
            </section>

            <section class="grid-panel">
              <div class="panel-header">
                <div class="panel-title">Primary Parts with Work Item</div>
                <div class="action-buttons-group">
                  @if (editingPrimaryPartId !== null) {
                    <button class="action-btn save-btn" (click)="saveSelectedPrimaryPartInline()" matTooltip="Save primary part">
                      <mat-icon>save</mat-icon>
                      <span>Save</span>
                    </button>
                    <button class="action-btn cancel-btn" (click)="cancelPrimaryPartEditAndClean()" matTooltip="Cancel">
                      <mat-icon>cancel</mat-icon>
                      <span>Cancel</span>
                    </button>
                  } @else {
                    <button class="action-btn add-btn" (click)="addPrimaryPartInline()" matTooltip="Add primary part">
                      <mat-icon>add_circle</mat-icon>
                      <span>Add</span>
                    </button>
                    <button class="action-btn edit-btn" [disabled]="!selectedPrimaryPartId()" (click)="editSelectedPrimaryPartInline()" matTooltip="Edit selected primary part">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button class="action-btn delete-btn" [disabled]="!selectedPrimaryPartId()" (click)="deleteSelectedPrimaryPartInline()" matTooltip="Delete selected primary part">
                      <mat-icon>delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  }
                </div>
              </div>
              <div #primaryPanelTableWrap class="panel-table-wrap">
                <table mat-table [dataSource]="sortedPrimaryParts()" class="full-width primary-parts-table">
                  <ng-container matColumnDef="qty">
                    <th mat-header-cell *matHeaderCellDef>Qty</th>
                    <td mat-cell *matCellDef="let row" (click)="row.id === editingPrimaryPartId && $event.stopPropagation()">
                      <span *ngIf="row.id !== editingPrimaryPartId">{{ row.qty }}</span>
                      <input *ngIf="row.id === editingPrimaryPartId" [(ngModel)]="row.qty" type="number" class="inline-input inline-input-qty" min="0" (click)="$event.stopPropagation()">
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="partDesc">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let row" (click)="row.id === editingPrimaryPartId && $event.stopPropagation()">
                      <span *ngIf="row.id !== editingPrimaryPartId">{{ row.partDesc }}</span>
                      <mat-select
                        *ngIf="row.id === editingPrimaryPartId"
                        class="assoc-part-select"
                        [(ngModel)]="row.partId"
                        (ngModelChange)="onPrimaryPartSelected(row, $event)"
                        (click)="$event.stopPropagation()"
                        [compareWith]="comparePartIds"
                        panelClass="primary-part-panel">
                        <mat-option [value]="null">-- Select Part --</mat-option>
                        <mat-option disabled>
                          <div class="assoc-part-option header">
                            <span>Description</span>
                            <span>Order Parameter</span>
                            <span>Part Number</span>
                          </div>
                        </mat-option>
                        <mat-option *ngIf="!filteredPrimaryDropdownParts().length" [disabled]="true">parts loading</mat-option>
                        <mat-option *ngFor="let part of filteredPrimaryDropdownParts()" [value]="part.partId">
                          <div class="assoc-part-option">
                            <span>{{ part.partDesc }}</span>
                            <span>{{ part.orderParm || '-' }}</span>
                            <span>{{ part.partNum || '-' }}</span>
                          </div>
                        </mat-option>
                      </mat-select>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="partNum">
                    <th mat-header-cell *matHeaderCellDef>Part Number</th>
                    <td mat-cell *matCellDef="let row" (click)="row.id === editingPrimaryPartId && $event.stopPropagation()">
                      <span *ngIf="row.id !== editingPrimaryPartId">{{ row.partNum }}</span>
                      <input *ngIf="row.id === editingPrimaryPartId" [(ngModel)]="row.partNum" class="inline-input" (click)="$event.stopPropagation()">
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="primaryPartColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: primaryPartColumns;"
                      [class.selected]="selectedPrimaryPartId() === row.id"
                      [class.has-assoc-parts]="hasAssociatedPartsForPrimary(row.projPartId)"
                      (click)="selectPrimaryPart(row)"></tr>
                </table>
                <p *ngIf="!primaryParts().length" class="empty-msg">No primary parts found.</p>
              </div>
            </section>

            <section class="grid-panel">
              <div class="panel-header">
                <div class="panel-title">Lineups / Bays for Work Item</div>
                <div class="action-buttons-group">
                  @if (editingLineupId !== null) {
                    <button class="action-btn save-btn" (click)="saveSelectedLineupInline()" matTooltip="Save lineup/bay">
                      <mat-icon>save</mat-icon>
                      <span>Save</span>
                    </button>
                    <button class="action-btn cancel-btn" (click)="cancelLineupEditAndClean()" matTooltip="Cancel">
                      <mat-icon>cancel</mat-icon>
                      <span>Cancel</span>
                    </button>
                  } @else {
                    <button class="action-btn add-btn" (click)="addLineupInline()" matTooltip="Add lineup/bay">
                      <mat-icon>add_circle</mat-icon>
                      <span>Add</span>
                    </button>
                    <button class="action-btn edit-btn" [disabled]="!selectedLineupId()" (click)="editSelectedLineupInline()" matTooltip="Edit selected lineup/bay">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button class="action-btn delete-btn" [disabled]="!selectedLineupId()" (click)="deleteSelectedLineupInline()" matTooltip="Delete selected lineup/bay">
                      <mat-icon>delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  }
                </div>
              </div>
              <div class="panel-table-wrap">
                <table mat-table [dataSource]="lineupBays()" class="full-width">
                  <ng-container matColumnDef="lineup">
                    <th mat-header-cell *matHeaderCellDef>Lineup</th>
                    <td mat-cell *matCellDef="let row">
                      <span *ngIf="row.id !== editingLineupId">{{ row.lineup }}</span>
                      <input *ngIf="row.id === editingLineupId" [(ngModel)]="row.lineup" class="inline-input">
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="startBay">
                    <th mat-header-cell *matHeaderCellDef>Start Bay</th>
                    <td mat-cell *matCellDef="let row">
                      <span *ngIf="row.id !== editingLineupId">{{ row.startBay }}</span>
                      <input *ngIf="row.id === editingLineupId" type="number" step="1" [(ngModel)]="row.startBay" class="inline-input">
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="endBay">
                    <th mat-header-cell *matHeaderCellDef>End Bay</th>
                    <td mat-cell *matCellDef="let row">
                      <span *ngIf="row.id !== editingLineupId">{{ row.endBay }}</span>
                      <input *ngIf="row.id === editingLineupId" type="number" step="1" [(ngModel)]="row.endBay" class="inline-input">
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="lineupBayColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: lineupBayColumns;"
                      [class.selected]="selectedLineupId() === row.id"
                      (click)="selectLineup(row)"></tr>
                </table>
                <p *ngIf="!lineupBays().length" class="empty-msg">No lineups/bays found.</p>
              </div>
            </section>

            <section class="grid-panel">
              <div class="panel-header">
                <div class="panel-title">Additional Associated Parts</div>
                <div class="action-buttons-group">
                  @if (editingAdditionalPartId !== null) {
                    <button class="action-btn save-btn" (click)="saveSelectedAdditionalPartInline()" matTooltip="Save associated part">
                      <mat-icon>save</mat-icon>
                      <span>Save</span>
                    </button>
                    <button class="action-btn cancel-btn" (click)="cancelAdditionalPartEditAndClean()" matTooltip="Cancel">
                      <mat-icon>cancel</mat-icon>
                      <span>Cancel</span>
                    </button>
                  } @else {
                    <button class="action-btn add-btn" [disabled]="!selectedPrimaryPartId()" (click)="addAdditionalPartInline()" matTooltip="Add associated part">
                      <mat-icon>add_circle</mat-icon>
                      <span>Add</span>
                    </button>
                    <button class="action-btn edit-btn" [disabled]="!selectedAdditionalPartId()" (click)="editSelectedAdditionalPartInline()" matTooltip="Edit selected associated part">
                      <mat-icon>edit</mat-icon>
                      <span>Edit</span>
                    </button>
                    <button class="action-btn delete-btn" [disabled]="!selectedAdditionalPartId()" (click)="deleteSelectedAdditionalPartInline()" matTooltip="Delete selected associated part">
                      <mat-icon>delete</mat-icon>
                      <span>Delete</span>
                    </button>
                  }
                </div>
              </div>
              <div #additionalPanelTableWrap class="panel-table-wrap">
                <table mat-table [dataSource]="hasSelectedPrimaryPart() ? sortedFilteredAdditionalParts() : []" class="full-width additional-parts-table">
                  <ng-container matColumnDef="qty">
                    <th mat-header-cell *matHeaderCellDef>Qty</th>
                    <td mat-cell *matCellDef="let row">
                      <span *ngIf="row.id !== editingAdditionalPartId">{{ row.qty }}</span>
                      <input *ngIf="row.id === editingAdditionalPartId" [(ngModel)]="row.qty" type="number" class="inline-input inline-input-qty" min="0">
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="partDesc">
                    <th mat-header-cell *matHeaderCellDef>Description</th>
                    <td mat-cell *matCellDef="let row" (click)="row.id === editingAdditionalPartId && $event.stopPropagation()">
                      <span *ngIf="row.id !== editingAdditionalPartId">{{ row.partDesc }}</span>
                      <mat-select
                        *ngIf="row.id === editingAdditionalPartId"
                        class="assoc-part-select"
                        [(ngModel)]="row.assocPartId"
                        (ngModelChange)="onAssociatedPartSelected(row, $event)"
                        (click)="$event.stopPropagation()"
                        panelClass="assoc-part-panel">
                        <mat-option [value]="null">-- Select Part --</mat-option>
                        <mat-option disabled>
                          <div class="assoc-part-option header">
                            <span>Description</span>
                            <span>Order Parameter</span>
                            <span>Part Number</span>
                          </div>
                        </mat-option>
                        <mat-option *ngIf="!filteredAssocDropdownParts().length" [disabled]="true">parts loading</mat-option>
                        <mat-option *ngFor="let part of filteredAssocDropdownParts()" [value]="part.partId">
                          <div class="assoc-part-option">
                            <span>{{ part.partDesc }}</span>
                            <span>{{ part.orderParm || '-' }}</span>
                            <span>{{ part.partNum || '-' }}</span>
                          </div>
                        </mat-option>
                      </mat-select>
                    </td>
                  </ng-container>
                  <ng-container matColumnDef="partNum">
                    <th mat-header-cell *matHeaderCellDef>Part Number</th>
                    <td mat-cell *matCellDef="let row">{{ row.partNum }}</td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="partColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: partColumns;"
                      [class.selected]="selectedAdditionalPartId() === row.id"
                      (click)="selectAdditionalPart(row)"></tr>
                </table>
                <p *ngIf="!hasSelectedPrimaryPart()" class="empty-msg">Select a primary part to view additional associated parts.</p>
                <p *ngIf="hasSelectedPrimaryPart() && !filteredAdditionalParts().length" class="empty-msg">No additional parts found.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ============ Host ============ */
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    /* ============ Page Header ============ */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 8px;
      background-color: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      min-height: 50px;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 18px;
      flex: 1;
    }

    /* Match specificity of global button[mat-button]:not([color]) selector */
    button[mat-button].back-button {
      color: #808080 !important;
      margin-left: 20px;
        --mat-text-button-hover-state-layer-opacity: 0;
        --mat-text-button-focus-state-layer-opacity: 0;
        --mat-text-button-pressed-state-layer-opacity: 0;
      }

    button[mat-button].back-button mat-icon {
      color: #808080 !important;
    }

    button[mat-button].back-button:hover {
      color: #ff9800 !important;
    }

    button[mat-button].back-button:hover mat-icon {
      color: #ff9800 !important;
    }

    .back-button {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #6b7280 !important;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 14px;
      font-weight: 500;
      gap: 8px;
      white-space: nowrap;
    }

    .back-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #6b7280 !important;
      transition: color 0.2s;
    }

    .back-button:hover {
      background-color: #f0f4f8;
      color: #ff9800 !important;
    }

    .back-button:hover mat-icon {
      color: #ff9800 !important;
    }

    .back-button:active {
      background-color: #fff3e0 !important;
      color: #ff9800 !important;
      box-shadow: 0 0 0 1.5px #ff9800 !important;
    }

    .back-button:active mat-icon {
      color: #ff9800 !important;
    }

    .header-divider-v {
      width: 1px;
      height: 18px;
      background-color: #e5e7eb;
      margin: 0 4px;
    }

    /* Navigation item buttons (matches landing-page) */
    .nav-item {
      display: flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 13px;
      font-weight: 500;
      gap: 6px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #6b7280;
        transition: color 0.2s;
      }

      &:hover:not(:disabled) {
        background-color: #f0f4f8;
        color: #ff9800;

        mat-icon {
          color: #ff9800;
        }
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        color: #9ca3af;
      }

      &:disabled mat-icon {
        color: #9ca3af;
      }
    }

    .add-btn:hover, .delete-btn:hover, .edit-btn:hover {
      background-color: #f0f4f8 !important;
      color: #ff9800 !important;
    }

    .add-btn:hover mat-icon, .delete-btn:hover mat-icon, .edit-btn:hover mat-icon {
      color: #ff9800 !important;
    }

    .header-right {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .page-title-right {
      font-size: 20px;
      font-weight: 500;
      color: #8a4d00;
      margin: 0;
      padding-right: 15px;
      white-space: nowrap;
    }

    .header-divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 0;
      flex-shrink: 0;
    }

    /* ============ Body ============ */
    .wi-body {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      min-height: 0;
      overflow: hidden;
      padding: 12px;
    }

    /* ============ Tab Group (matches landing-page exactly) ============ */
    .wi-tab-group {
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 100%;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;

      --mat-tab-active-label-text-color: #ff9800 !important;
      --mat-tab-inactive-label-text-color: #6b7280 !important;
      --mat-tab-focus-state-layer-color: #ff9800 !important;
      --mdc-tab-indicator-color: #ff9800 !important;
      --mat-tab-indicator-color: #ff9800 !important;
    }

    ::ng-deep .wi-tab-group .mat-mdc-tab-labels {
      background: #f9f9f9;
      border-bottom: 1px solid #e0e0e0;
      overflow-x: hidden;
      overflow-y: hidden;
      position: sticky;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
      display: flex !important;
      width: 100% !important;
    }

    /* ---- Custom label span (directly in template, no ng-deep needed) ---- */
    .wi-tab-label {
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
      text-align: center;
    }

    /* ALL tab labels - equal width, no wrapping */
    ::ng-deep .wi-tab-group .mat-mdc-tab-label,
    ::ng-deep .wi-tab-group .mat-mdc-tab,
    ::ng-deep .wi-tab-group .mdc-tab {
      flex: 1 1 0 !important;
      width: 25% !important;
      min-width: 0 !important;
      max-width: none !important;
      height: 40px !important;
      box-sizing: border-box !important;
      padding: 0 6px !important;
      transition: color 0.2s ease;
    }

    ::ng-deep .wi-tab-group .mat-mdc-tab-label .mdc-tab__text-label,
    ::ng-deep .wi-tab-group .mat-mdc-tab .mdc-tab__text-label,
    ::ng-deep .wi-tab-group .mdc-tab .mdc-tab__text-label {
      color: #6b7280 !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 100% !important;
    }

    /* Active tab label */
    ::ng-deep .wi-tab-group .mat-mdc-tab-label[aria-selected="true"],
    ::ng-deep .wi-tab-group .mat-mdc-tab-label.mat-mdc-tab-label-active {
      color: #ff9800 !important;
      background-color: #fff3e0 !important;
    }

    ::ng-deep .wi-tab-group .mat-mdc-tab-label[aria-selected="true"] .mdc-tab__text-label,
    ::ng-deep .wi-tab-group .mdc-tab--active .mdc-tab__text-label {
      color: #ff9800 !important;
      font-size: 13px !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    ::ng-deep .wi-tab-group .mdc-tab--active {
      background-color: #fff3e0 !important;
    }

    ::ng-deep .wi-tab-group [role="tab"][aria-selected="true"] {
      background-color: #fff3e0 !important;
    }

    /* Hover on inactive tabs */
    ::ng-deep .wi-tab-group .mat-mdc-tab-label:hover:not([aria-selected="true"]) .mdc-tab__text-label {
      color: #ff9800 !important;
    }

    /* Tab indicator */
    ::ng-deep .wi-tab-group .mdc-tab-indicator {
      display: block !important;
      height: 2px !important;
      position: absolute !important;
      bottom: 0 !important;
      top: auto !important;
    }

    ::ng-deep .wi-tab-group .mdc-tab-indicator__content {
      display: block !important;
      height: 2px !important;
      background-color: #ff9800 !important;
      border: none !important;
      width: 100% !important;
      position: absolute !important;
      bottom: 0 !important;
      top: auto !important;
    }

    ::ng-deep .wi-tab-group .mdc-tab-indicator__content--underline {
      display: block !important;
      height: 2px !important;
      background-color: #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      width: 100% !important;
      position: absolute !important;
      bottom: 0 !important;
      top: auto !important;
    }

    ::ng-deep .wi-tab-group .mat-mdc-tab-body-wrapper {
      overflow-x: hidden;
      overflow-y: hidden;
      width: 100%;
      max-width: 100%;
      flex: 1;
      min-height: 0;
    }

    ::ng-deep .wi-tab-group .mat-mdc-tab-body {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }

    /* ============ Tab Content ============ */
    .tab-content {
      padding: 0;
      flex: 1;
      height: 100%;
      min-height: 0;
      overflow: hidden;
      overflow-x: hidden;
      max-height: none;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
      gap: 10px;
      height: 100%;
      min-height: 0;
      padding: 1px;
      box-sizing: border-box;
    }

    .grid-panel {
      display: flex;
      flex-direction: column;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      background: #fff;
      overflow: hidden;
      min-height: 0;
      border: 2px solid #facd9a;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      border-bottom: 1px solid #e5e7eb;
      background: #fafafa;
      padding: 3px 6px;
      flex-shrink: 0;
    }

    .panel-title {
      font-size: 13px;
      font-weight: 700;
      color: #8a4d00;
      text-transform: uppercase;
      letter-spacing: 0.2px;
      padding-left: 5px;
      border-bottom: none;
      background: transparent;
      flex-shrink: 0;
    }

    .work-items-panel-title {
      /* Align first panel title with titles inside .panel-header (6px + 5px). */
      padding-left: 11px;
      padding-top: 3px;
      padding-bottom: 3px;
    }

    .action-buttons-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 0 !important;
      border: none;
      border-radius: 0;
      background: transparent;
      color: #ebaf56;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }

    .action-btn mat-icon {
      font-size: 17px;
      width: 17px;
      height: 17px;
    }

    .action-btn span {
      display: none;
    }

    .action-btn:hover:not(:disabled) {
      color: #f57c00;
      transform: scale(1.1);
    }

    .action-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      color: #ccc !important;
    }

    .action-btn:disabled:hover {
      transform: scale(1);
    }

    .panel-table-wrap {
      --table-header-height: 34px;
      --table-row-height: 34px;
      --table-border-offset: 2px;
      height: calc(var(--table-header-height) + (5 * var(--table-row-height)) + var(--table-border-offset));
      max-height: calc(var(--table-header-height) + (5 * var(--table-row-height)) + var(--table-border-offset));
      min-height: calc(var(--table-header-height) + (5 * var(--table-row-height)) + var(--table-border-offset));
      flex: 0 0 auto;
      overflow-x: hidden;
      overflow-y: scroll;
    }

    /* ============ Header Select Dropdowns ============ */
    .header-select-group {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
    }

    .header-select-label {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      line-height: 1;
      white-space: nowrap;
    }

    .header-select {
      height: 26px;
      min-width: 120px !important;
      display: flex !important;
      align-items: center !important;
      border: 1.5px solid #e5e7eb !important;
      border-radius: 6px !important;
      background: white !important;
    }

    /* Material Select Styling */
    ::ng-deep .header-select .mdc-select {
      height: 26px !important;
      display: flex !important;
      align-items: center !important;
    }

    ::ng-deep .header-select .mdc-select__anchor {
      height: 26px !important;
      min-height: 26px !important;
      padding: 0 8px !important;
      display: flex !important;
      align-items: center !important;
      border: none !important;
      border-radius: 0 !important;
      background: transparent !important;
      transition: none !important;
    }

    ::ng-deep .header-select .mdc-notched-outline {
      display: none !important;
    }

    ::ng-deep .header-select .mat-mdc-select-trigger {
      display: flex !important;
      align-items: center !important;
      color: #374151 !important;
      font-size: 13px !important;
      font-weight: 500 !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      height: 26px !important;
      line-height: 26px !important;
      padding: 0 8px !important;
      width: 100% !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

  

    ::ng-deep .header-select:focus {
      outline: none;
      border: 1.5px solid #ff9800 !important;
      border-radius: 6px !important;
    }

    ::ng-deep .header-select.mat-focused {
      border: 1.5px solid #ff9800 !important;
      box-shadow: none !important;
    }

    ::ng-deep .header-select .mdc-select__dropdown-icon {
      display: none !important;
    }

    /* Custom Select Panel */
    ::ng-deep .custom-select-panel {
      .mat-mdc-optgroup,
      .mat-mdc-option {
        font-size: 13px !important;
        font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      }

      .mat-mdc-option {
        color: #374151 !important;
        height: 36px !important;
      }

      .mat-mdc-option:hover {
        background-color: #fff3e0 !important;
        color: #ff9800 !important;
      }

      .mat-mdc-option.mat-selected {
        background-color: #fff3e0 !important;
        color: #ff9800 !important;
        font-weight: 600 !important;
      }

      .mat-mdc-option.mat-selected:hover {
        background-color: #fff3e0 !important;
        color: #ff9800 !important;
      }
    }

    /* ============ Tables ============ */
    .full-width {
      width: 100%;
      border-collapse: collapse !important;
      border: 1px solid #d1d5db !important;
    }

    .primary-parts-table,
    .additional-parts-table {
      table-layout: fixed;
    }

    .notes-cell { max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .inline-input {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      box-sizing: border-box;
      padding: 2px 0 !important;
      border: none;
      border-radius: 0;
      font-size: 11px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      color: #222;
      background: transparent;
      margin: 0;
    }

    .inline-input-qty {
      width: 50px !important;
      text-align: center;
    }

    .inline-input:focus {
      outline: none;
      border: none;
      box-shadow: none;
    }

    .assoc-part-select {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      font-size: 11px;
      display: block;
    }

    .assoc-part-option {
      display: grid;
      grid-template-columns: minmax(0, 55%) minmax(0, 22%) minmax(0, 23%);
      gap: 0;
      align-items: center;
      width: 100%;
      min-width: 100%;
      font-size: 11px;
      line-height: 1.2;
      background: #fff;
    }

    .assoc-part-option span {
      display: block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 4px 6px;
      box-sizing: border-box;
    }

    .assoc-part-option.header {
      font-weight: 700;
      color: #30271a;
      text-transform: uppercase;
      letter-spacing: 0.2px;
      font-size: 10px;
      background: #f7f3ed;
      border-bottom: 1px solid #d1d5db;
    }

    .assoc-part-option.header span + span {
      border-left: 1px solid #d1d5db;
    }

    ::ng-deep .primary-part-panel,
    ::ng-deep .assoc-part-panel {
      min-width: 560px !important;
      max-width: 800px !important;
      width: 100% !important;
      left: 0 !important;
      right: 0 !important;
      transform-origin: top left !important;
    }

    ::ng-deep .primary-parts-table .mat-column-qty,
    ::ng-deep .additional-parts-table .mat-column-qty {
      width: 64px !important;
      min-width: 64px !important;
      max-width: 64px !important;
    }

    ::ng-deep .primary-parts-table .mat-column-partNum,
    ::ng-deep .additional-parts-table .mat-column-partNum {
      width: 180px !important;
      min-width: 180px !important;
      max-width: 180px !important;
    }

    ::ng-deep .primary-parts-table .mat-column-partDesc,
    ::ng-deep .additional-parts-table .mat-column-partDesc {
      width: auto !important;
      min-width: 0 !important;
    }

    ::ng-deep .cdk-overlay-popover.cdk-overlay-connected-position-bounding-box:has(.primary-part-panel),
    ::ng-deep .cdk-overlay-connected-position-bounding-box:has(.primary-part-panel) {
      inset: 358.667px auto auto 700.333px !important;
    }

    ::ng-deep .cdk-overlay-popover.cdk-overlay-connected-position-bounding-box:has(.assoc-part-panel),
    ::ng-deep .cdk-overlay-connected-position-bounding-box:has(.assoc-part-panel) {
      inset: auto auto 225.333px 700.635px !important;
    }

    ::ng-deep .primary-part-panel .mat-mdc-option,
    ::ng-deep .assoc-part-panel .mat-mdc-option {
      min-height: 30px !important;
      height: auto !important;
      padding: 0 !important;
    }

    ::ng-deep .primary-part-panel .mat-mdc-option .mdc-list-item__primary-text,
    ::ng-deep .assoc-part-panel .mat-mdc-option .mdc-list-item__primary-text {
      display: block !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    ::ng-deep .mat-mdc-header-cell {
      background: #f1ece5 !important;
      font-weight: 600 !important;
      font-size: 12px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.2px !important;
      color: #424242 !important;
      white-space: nowrap !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      border: 1px solid #d1d5db !important;
      padding: 6px 8px !important;
    }

    ::ng-deep .mat-mdc-cell {
      font-size: 12px !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      color: #222 !important;
      border: 1px solid #e5e7eb !important;
      padding: 6px 8px !important;
    }

    ::ng-deep .mat-mdc-header-row {
      height: 34px !important;
      min-height: 34px !important;
    }

    ::ng-deep .mat-mdc-row {
      height: 34px !important;
      min-height: 34px !important;
    }

    ::ng-deep .mat-mdc-header-row {
      border-bottom: 2px solid #d1d5db !important;
    }

    tr.mat-mdc-row:hover {
      background: #f1ece5 !important;
      cursor: pointer;
    }

    tr.selected { background: #f1ece5 !important; }

    tr.has-assoc-parts ::ng-deep .mat-mdc-cell {
      font-weight: 700 !important;
    }

    .spinner-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      min-height: calc(100vh - 120px);
      width: 100%;
      padding: 0;
      box-sizing: border-box;
    }

    .spinner-text {
      margin: 0;
      font-size: 16px;
      color: #6b7280;
      font-weight: 500;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    }

    .empty-msg {
      color: #999;
      text-align: center;
      padding: 8px 6px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 11px;
    }

    /* Hide mat-pseudo-checkbox tick in custom select panel */
    ::ng-deep .custom-select-panel .mat-pseudo-checkbox {
      display: none !important;
    }

    /* Snackbar Styling */
    ::ng-deep .snackbar-success {
      background-color: #4a5568 !important;
      color: #ffffff !important;
    }

    ::ng-deep .snackbar-success .mdc-button__label {
      color: #ffffff !important;
    }

    ::ng-deep .snackbar-success .mat-mdc-button {
      color: #ffffff !important;
    }

    /* ====== DARK MODE ====== */
    :host-context([data-theme="dark"]) .page-header { background-color: #1e1e1e !important; border-bottom-color: #424242 !important; }
    :host-context([data-theme="dark"]) .back-button { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .back-button mat-icon { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .back-button:hover { background-color: #1a2a4a !important; color: #ffffff !important; }
    :host-context([data-theme="dark"]) .page-title-right { color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .header-divider, :host-context([data-theme="dark"]) .header-divider-v { background-color: #424242 !important; }
    :host-context([data-theme="dark"]) .nav-item { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .nav-item mat-icon { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .nav-item:hover:not(:disabled) { background-color: #2a2a2a !important; color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .nav-item:hover:not(:disabled) mat-icon { color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .add-btn:hover, :host-context([data-theme="dark"]) .delete-btn:hover, :host-context([data-theme="dark"]) .edit-btn:hover { background-color: #2a2a2a !important; color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .add-btn:hover mat-icon, :host-context([data-theme="dark"]) .delete-btn:hover mat-icon, :host-context([data-theme="dark"]) .edit-btn:hover mat-icon { color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .header-select .mdc-select__anchor { background-color: #2c2c2c !important; border-color: #424242 !important; color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .header-select .mat-mdc-select-trigger { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .header-select:hover .mdc-select__anchor { border-color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .header-select.mat-focused .mdc-select__anchor { border-color: #ff9800 !important; box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.15) !important; }
    :host-context([data-theme="dark"]) .header-select option { background-color: #2c2c2c !important; color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .header-select option:hover, :host-context([data-theme="dark"]) .header-select option:checked { background: linear-gradient(#3d2a10, #3d2a10) !important; color: #ff9800 !important; }
    :host-context([data-theme="dark"]) ::ng-deep .custom-select-panel .mat-mdc-option { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) ::ng-deep .custom-select-panel .mat-mdc-option:hover, :host-context([data-theme="dark"]) ::ng-deep .custom-select-panel .mat-mdc-option.mat-selected { background-color: #3d2a10 !important; color: #ff9800 !important; }
    :host-context([data-theme="dark"]) ::ng-deep .custom-select-panel .mat-mdc-option.mat-selected:hover { background-color: #3d2a10 !important; color: #ff9800 !important; }
    :host-context([data-theme="dark"]) ::ng-deep .wi-tab-group .mat-mdc-tab-labels { background: #1e1e1e !important; border-bottom-color: #424242 !important; }
    :host-context([data-theme="dark"]) ::ng-deep .wi-tab-group .mat-mdc-tab-label .mdc-tab__text-label { color: #9e9e9e !important; }
    :host-context([data-theme="dark"]) ::ng-deep .wi-tab-group .mdc-tab--active .mdc-tab__text-label, :host-context([data-theme="dark"]) ::ng-deep .wi-tab-group .mat-mdc-tab-label[aria-selected="true"] .mdc-tab__text-label { color: #ff9800 !important; }
    :host-context([data-theme="dark"]) ::ng-deep .wi-tab-group .mdc-tab--active { background-color: #2a1a08 !important; }
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-header-cell { background: #2a1a08 !important; color: #ff9800 !important; border-color: #424242 !important; }
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-cell { color: #e0e0e0 !important; border-color: #333 !important; }
    :host-context([data-theme="dark"]) .full-width { border-color: #424242 !important; }
    :host-context([data-theme="dark"]) tr.mat-mdc-row:hover { background: #2a2520 !important; }
    :host-context([data-theme="dark"]) tr.selected { background: #3d2a10 !important; }
    :host-context([data-theme="dark"]) .empty-msg { color: #9e9e9e !important; }
  `]
})
export class WorkItemsComponent implements OnInit {
  @ViewChild('partSortSelect') partSortSelect?: MatSelect;
  @ViewChild('primaryPanelTableWrap') primaryPanelTableWrap?: ElementRef<HTMLDivElement>;
  @ViewChild('additionalPanelTableWrap') additionalPanelTableWrap?: ElementRef<HTMLDivElement>;
  @ViewChildren(MatSelect) allSelects?: QueryList<MatSelect>;

  projectNum = '';
  project: any = null;
  partGroup: number | string = 1;
  partSort = signal('desc');

  sortedPrimaryParts = computed(() => {
    const parts = [...this.primaryParts()];
    return this.partSort() === 'num'
      ? parts.sort((a, b) => String(a.partNum || '').localeCompare(String(b.partNum || '')))
      : parts.sort((a, b) => String(a.partDesc || '').localeCompare(String(b.partDesc || '')));
  });

  sortedFilteredAdditionalParts = computed(() => {
    const parts = [...this.filteredAdditionalParts()];
    return this.partSort() === 'num'
      ? parts.sort((a, b) => String(a.partNum || '').localeCompare(String(b.partNum || '')))
      : parts.sort((a, b) => String(a.partDesc || '').localeCompare(String(b.partDesc || '')));
  });
  tabIndex = 0;

  loading = signal(false);
  workItems = signal<WorkItem[]>([]);
  workItemParts = signal<ProjectPart[]>([]);
  primaryParts = signal<any[]>([]);
  selectedWorkItem = signal<WorkItem | null>(null);
  selectedPrimaryPartId = signal<number | null>(null);
  selectedLineupId = signal<number | null>(null);
  selectedAdditionalPartId = signal<number | null>(null);
  workOperations = signal<any[]>([]);

  workItemColumns = ['wrkItemNum', 'wrkOpDesc', 'wrkItemTxt'];
  partColumns = ['qty', 'partDesc', 'partNum'];
  primaryPartColumns = ['qty', 'partDesc', 'partNum'];
  lineupBayColumns = ['lineup', 'startBay', 'endBay'];

  lineupBays = signal<any[]>([]);
  additionalParts = signal<ProjectPart[]>([]);
  masterParts = signal<any[]>([]);
  filteredAssocDropdownParts = signal<any[]>([]);
  filteredPrimaryDropdownParts = computed(() => {
    return [...(this.masterParts() || [])].sort((a: any, b: any) =>
      String(a.partDesc || '').localeCompare(String(b.partDesc || ''))
    );
  });

  editingPrimaryPartId: number | null = null;
  editingLineupId: number | null = null;
  editingAdditionalPartId: number | null = null;
  editingPrimaryPartOriginal: any = null;
  editingLineupOriginal: any = null;
  editingAdditionalPartOriginal: any = null;

  filteredAdditionalParts = computed(() => {
    const selectedPrimary = this.primaryParts().find(p => p.id === this.selectedPrimaryPartId());
    if (!selectedPrimary?.projPartId) {
      return [];
    }
    return (this.additionalParts() as any[]).filter(ap => ap.projPartId === selectedPrimary.projPartId);
  });

  hasSelectedPrimaryPart = computed(() =>
    this.primaryParts().some(p => p.id === this.selectedPrimaryPartId())
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private workItemService: WorkItemService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.projectNum = this.route.snapshot.paramMap.get('projectNum') || '';
    // Capture project data from navigation state if available
    const navState = history.state as { projectNum?: string; project?: any };
    this.project = navState?.project || null;
    // Load work operations for the operation column mapping
    this.http.get<any[]>(`${environment.apiUrl}/api/admin/work-operations`).subscribe({
      next: (ops) => {
        this.workOperations.set(ops);
        console.log('✅ Work operations loaded:', ops);
      },
      error: (err) => {
        console.error('❌ Error loading work operations:', err);
      }
    });
    this.loadMasterPartsForDropdowns();
    this.loadWorkItems();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const clickedInsideSelectTrigger = !!target.closest('mat-select, .mat-mdc-select-trigger');
    const clickedInsideSelectPanel = !!target.closest('.mat-mdc-select-panel, .cdk-overlay-pane');
    if (clickedInsideSelectTrigger || clickedInsideSelectPanel) {
      return;
    }

    this.closeAllDropdowns();
  }

  private closeAllDropdowns(): void {
    this.partSortSelect?.close();
    this.allSelects?.forEach((select) => select.close());
  }

  private scrollPanelToBottom(panelRef?: ElementRef<HTMLDivElement>): void {
    setTimeout(() => {
      const panel = panelRef?.nativeElement;
      if (!panel) {
        return;
      }
      panel.scrollTop = panel.scrollHeight;
    });
  }

  loadWorkItems(): void {
    console.log('Loading work items for project:', this.projectNum);
    this.loading.set(true);
    this.workItemService.getWorkItems(this.projectNum).subscribe({
      next: (items) => {
        console.log('Work items loaded:', items);
        
        if (!items || items.length === 0) {
          this.workItems.set([]);
          this.selectedWorkItem.set(null);
          this.workItemParts.set([]);
          this.loading.set(false);
          return;
        }
        
        // Load parts for each work item using forkJoin
        const partRequests: { [key: string]: any } = {};
        items.forEach((item, index) => {
          console.log(`Creating part request for item_${index} (workItemId: ${item.workItemId})`);
          partRequests[`item_${index}`] = this.workItemService.getProjectParts(this.projectNum, item.workItemId).pipe(
            catchError(err => {
              console.error('Error loading parts for work item', item.workItemId, err);
              return of([]);
            })
          );
        });
        
        forkJoin(partRequests).subscribe({
          next: (partResults: any) => {
            console.log('All parts fetched - partResults:', partResults);
            const itemsWithParts = items.map((item, index) => {
              const itemParts = partResults[`item_${index}`] || [];
              console.log(`item_${index} (workItemId: ${item.workItemId}) has ${itemParts.length} parts:`, itemParts);
              return {
                ...item,
                parts: itemParts
              };
            });
            console.log('Work items with parts loaded:', itemsWithParts);
            this.workItems.set(itemsWithParts);
            // Automatically select the first work item
            if (itemsWithParts.length > 0) {
              const firstWorkItem = itemsWithParts[0];
              this.selectWorkItem(firstWorkItem);
            } else {
              this.selectedWorkItem.set(null);
              this.workItemParts.set([]);
              this.primaryParts.set([]);
              this.lineupBays.set([]);
              this.additionalParts.set([]);
              this.selectedPrimaryPartId.set(null);
            }
            this.loading.set(false);
          },
          error: (err) => {
            console.error('Error loading parts:', err);
            this.loading.set(false);
            this.snackBar.open('Failed to load work item parts', 'Close', { duration: 4000 });
          }
        });
      },
      error: (err) => {
        console.error('Error loading work items:', err);
        this.loading.set(false);
        this.snackBar.open('Failed to load work items', 'Close', { duration: 4000 });
      }
    });
  }

  selectWorkItem(wi: WorkItem): void {
    this.selectedWorkItem.set(wi);
    this.workItemParts.set(wi.parts || []);
    this.applyPrimaryParts(wi.parts || []);
    this.loadDetailTablesForWorkItem(wi.workItemId);
    // Reset all editing states when switching work items
    this.editingPrimaryPartId = null;
    this.editingLineupId = null;
    this.editingAdditionalPartId = null;
    this.editingPrimaryPartOriginal = null;
    this.editingLineupOriginal = null;
    this.editingAdditionalPartOriginal = null;
  }

  selectPrimaryPart(part: any): void {
    this.selectedPrimaryPartId.set(part?.id ?? null);
    this.selectedAdditionalPartId.set(null);
  }

  selectLineup(lineup: any): void {
    this.selectedLineupId.set(lineup?.id ?? null);
  }

  selectAdditionalPart(part: any): void {
    this.selectedAdditionalPartId.set(part?.id ?? null);
  }

  hasAssociatedPartsForPrimary(projPartId: number | undefined): boolean {
    if (!projPartId) {
      return false;
    }
    return (this.additionalParts() as any[]).some(p => p?.projPartId === projPartId);
  }

  private loadMasterPartsForDropdowns(): void {
    this.workItemService.getWorkItemMasterParts(this.projectNum).subscribe({
      next: (parts) => {
        const normalized = (parts || []).filter((p: any) => !!p.partId && !!p.partDesc);
        if (normalized.length) {
          this.masterParts.set(normalized);
          this.refreshAssocDropdownParts();
          return;
        }

        this.workItemService.getAllMasterParts(this.projectNum).subscribe({
          next: (fallbackParts) => {
            const fallback = (fallbackParts || []).filter((p: any) => !!p.partId && !!p.partDesc);
            this.masterParts.set(fallback);
            this.refreshAssocDropdownParts();
          },
          error: () => {
            this.masterParts.set([]);
            this.filteredAssocDropdownParts.set([]);
          }
        });
      },
      error: () => {
        this.workItemService.getAllMasterParts(this.projectNum).subscribe({
          next: (fallbackParts) => {
            const fallback = (fallbackParts || []).filter((p: any) => !!p.partId && !!p.partDesc);
            this.masterParts.set(fallback);
            this.refreshAssocDropdownParts();
          },
          error: () => {
            this.masterParts.set([]);
            this.filteredAssocDropdownParts.set([]);
          }
        });
      }
    });
  }

  comparePartIds(p1: any, p2: any): boolean {
    if (p1 === null || p2 === null) return p1 === p2;
    return Number(p1) === Number(p2);
  }

  onPrimaryPartSelected(row: any, partId: number | null): void {
    if (!partId) {
      row.partId = null;
      row.partDesc = '';
      row.partNum = '';
      row.catId = 0;
      return;
    }

    const selected = this.masterParts().find((p: any) => Number(p.partId) === Number(partId));
    if (!selected) {
      return;
    }

    row.partId = selected.partId;
    row.partDesc = selected.partDesc || '';
    row.partNum = selected.partNum || '';
    row.catId = selected.categoryId ?? selected.catId ?? 0;
    this.refreshAssocDropdownParts();
  }

  onAssociatedPartSelected(row: any, assocPartId: number | null): void {
    if (!assocPartId) {
      row.assocPartId = null;
      row.partDesc = '';
      row.partNum = '';
      row.orderParm = '';
      row.catId = 0;
      return;
    }

    const selected = this.masterParts().find((p: any) => Number(p.partId) === Number(assocPartId));
    if (!selected) {
      return;
    }

    row.assocPartId = selected.partId;
    row.partDesc = selected.partDesc || '';
    row.partNum = selected.partNum || '';
    row.orderParm = selected.orderParm || '';
    row.catId = selected.categoryId ?? selected.catId ?? 0;
  }

  private refreshAssocDropdownParts(): void {
    const all = this.masterParts() || [];
    const selectedPrimary = this.primaryParts().find(p => p.id === this.selectedPrimaryPartId());
    const selectedCatId = selectedPrimary?.catId;

    let scoped = all;
    if (selectedCatId !== undefined && selectedCatId !== null && String(selectedCatId).trim() !== '' && String(selectedCatId) !== '0') {
      const selectedCatText = String(selectedCatId).trim().toLowerCase();
      scoped = all.filter((p: any) => {
        const partCatRaw = p.categoryId ?? p.catId ?? '';
        const partCatText = String(partCatRaw).trim().toLowerCase();
        const numericMatch = Number.isFinite(Number(partCatText))
          && Number.isFinite(Number(selectedCatText))
          && Number(partCatText) === Number(selectedCatText);
        return partCatText === selectedCatText || numericMatch;
      });
      if (!scoped.length) {
        scoped = all;
      }
    }

    scoped = [...scoped].sort((a: any, b: any) =>
      String(a.partDesc || '').localeCompare(String(b.partDesc || ''))
    );
    this.filteredAssocDropdownParts.set(scoped);
  }

  private loadDetailTablesForWorkItem(workItemId?: number, preferredPrimaryPartId?: number | null): void {
    if (!workItemId) {
      this.primaryParts.set([]);
      this.lineupBays.set([]);
      this.additionalParts.set([]);
      this.selectedPrimaryPartId.set(null);
      return;
    }

    this.workItemService.getProjectParts(this.projectNum, workItemId).subscribe({
      next: (parts) => {
        this.applyPrimaryParts(parts || [], preferredPrimaryPartId ?? this.selectedPrimaryPartId());
      },
      error: (err) => {
        console.error('Error loading primary parts:', err);
        this.primaryParts.set([]);
        this.selectedPrimaryPartId.set(null);
      }
    });

    this.workItemService.getLineups(this.projectNum, workItemId).subscribe({
      next: (lineups) => {
        const transformedLineups = (lineups || []).map((lineup: any) => ({
          lineup: lineup.lineup || '',
          startBay: lineup.startBay ?? '',
          endBay: lineup.endBay ?? '',
          id: lineup.itemLineupId,
          itemLineupId: lineup.itemLineupId,
          projPartId: lineup.projPartId
        }));
        this.lineupBays.set(transformedLineups);
        this.selectedLineupId.set(transformedLineups.length ? transformedLineups[0].id : null);
      },
      error: (err) => {
        console.warn('No lineups found:', err);
        this.lineupBays.set([]);
        this.selectedLineupId.set(null);
      }
    });

    this.workItemService.getAssociatedParts(this.projectNum, workItemId).subscribe({
      next: (parts) => {
        const transformedAssociatedParts = (parts || []).map((part: any) => ({
          qty: part.qty,
          partDesc: part.partDesc || '(No description)',
          partNum: part.partNum || '(No part number)',
          orderParm: part.orderParm || '',
          id: part.assocPartId,
          projPartId: part.projPartId,
          assocPartId: part.assocPartId,
          catId: part.catId
        }));
        this.additionalParts.set(transformedAssociatedParts as any);
        this.selectedAdditionalPartId.set(null);
      },
      error: (err) => {
        console.error('Error loading associated parts:', err);
        this.additionalParts.set([]);
        this.selectedAdditionalPartId.set(null);
      }
    });
  }

  private applyPrimaryParts(parts: any[], preferredPrimaryPartId?: number | null): void {
    const transformedParts = (parts || []).map((part: any) => ({
      qty: part.qty,
      partDesc: part.partDesc || part.masterPart?.partDesc || '(No description)',
      partNum: part.partNum || part.masterPart?.partNum || '(No part number)',
      catId: part.catId ?? part.masterPart?.categoryId ?? 0,
      id: part.projPartId ?? part.id,
      projPartId: part.projPartId ?? part.id,
      partId: part.partId,
      workItemId: part.workItemId
    }));

    this.primaryParts.set(transformedParts);
    const retainedPrimary = transformedParts.find(p => p.id === preferredPrimaryPartId);
    this.selectedPrimaryPartId.set(retainedPrimary ? retainedPrimary.id : (transformedParts.length ? transformedParts[0].id : null));
    this.selectedAdditionalPartId.set(null);
  }

  addPrimaryPartInline(): void {
    const wi = this.selectedWorkItem();
    if (!wi?.workItemId) {
      this.snackBar.open('Please select a work item', 'Close', { duration: 2000 });
      return;
    }

    const newPart = {
      id: Date.now(),
      qty: 1,
      partDesc: '',
      partNum: '',
      projPartId: null,
      partId: null,
      catId: 0,
      workItemId: wi.workItemId,
      isNew: true
    };
    this.primaryParts.set([...this.primaryParts(), newPart]);
    this.selectedPrimaryPartId.set(newPart.id);
    this.editingPrimaryPartId = newPart.id;
    this.editingPrimaryPartOriginal = null;
    this.refreshAssocDropdownParts();
    this.scrollPanelToBottom(this.primaryPanelTableWrap);
  }

  editSelectedPrimaryPartInline(): void {
    const selected = this.primaryParts().find(p => p.id === this.selectedPrimaryPartId());
    if (!selected) {
      return;
    }
    this.editingPrimaryPartId = selected.id;
    this.editingPrimaryPartOriginal = { ...selected };
  }

  saveSelectedPrimaryPartInline(): void {
    const wi = this.selectedWorkItem();
    const row = this.primaryParts().find(p => p.id === this.editingPrimaryPartId);
    if (!wi?.workItemId || !row) {
      return;
    }

    if (!row.qty || !row.partId) {
      this.snackBar.open('Please fill in Qty and Description', 'Close', { duration: 2200 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirm Changes',
        message: `Save changes to part ${row.partNum || ''}?`,
        confirmText: 'Save',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        if (this.editingPrimaryPartOriginal && row && !row.isNew) {
          Object.assign(row, this.editingPrimaryPartOriginal);
          this.primaryParts.set([...this.primaryParts()]);
        }
        this.editingPrimaryPartId = null;
        this.editingPrimaryPartOriginal = null;
        return;
      }

      this.workItemService.savePart(this.projectNum, wi.workItemId, {
        projPartId: row.projPartId || undefined,
        partId: row.partId,
        qty: Number(row.qty)
      }).subscribe({
        next: () => {
          this.editingPrimaryPartId = null;
          this.editingPrimaryPartOriginal = null;
          this.loadDetailTablesForWorkItem(wi.workItemId);
          this.snackBar.open('Primary part saved successfully', 'Close', { duration: 2400 });
        },
        error: () => this.snackBar.open('Failed to save primary part', 'Close', { duration: 2400 })
      });
    });
  }

  cancelPrimaryPartEditAndClean(): void {
    if (this.editingPrimaryPartId === null) {
      return;
    }
    const row = this.primaryParts().find(p => p.id === this.editingPrimaryPartId);
    if (row?.isNew) {
      this.primaryParts.set(this.primaryParts().filter(p => p.id !== this.editingPrimaryPartId));
    } else if (row && this.editingPrimaryPartOriginal) {
      Object.assign(row, this.editingPrimaryPartOriginal);
      this.primaryParts.set([...this.primaryParts()]);
    }
    this.editingPrimaryPartId = null;
    this.editingPrimaryPartOriginal = null;
  }

  deleteSelectedPrimaryPartInline(): void {
    const wi = this.selectedWorkItem();
    const selected = this.primaryParts().find(p => p.id === this.selectedPrimaryPartId());
    if (!wi?.workItemId || !selected) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Delete part ${selected.partNum || ''}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      if (selected.projPartId && this.hasAssociatedPartsForPrimary(selected.projPartId)) {
        this.snackBar.open('Delete failed: associated part linked with the primary part', 'Close', { duration: 2800 });
        return;
      }

      if (selected.isNew || !selected.projPartId) {
        const updated = this.primaryParts().filter(p => p.id !== selected.id);
        this.primaryParts.set(updated);
        this.selectedPrimaryPartId.set(updated.length ? updated[0].id : null);
        this.snackBar.open('Primary part deleted successfully', 'Close', { duration: 2400 });
        return;
      }

      this.workItemService.deletePart(this.projectNum, wi.workItemId, selected.projPartId).subscribe({
        next: () => {
          this.loadDetailTablesForWorkItem(wi.workItemId);
          this.snackBar.open('Primary part deleted successfully', 'Close', { duration: 2400 });
        },
        error: () => this.snackBar.open('Failed to delete primary part', 'Close', { duration: 2400 })
      });
    });
  }

  addLineupInline(): void {
    if (!this.selectedPrimaryPartId()) {
      this.snackBar.open('Select a primary part first', 'Close', { duration: 2200 });
      return;
    }

    const newLineup = {
      id: Date.now(),
      lineup: '',
      startBay: '',
      endBay: '',
      projPartId: this.selectedPrimaryPartId(),
      isNew: true
    };
    this.lineupBays.set([...this.lineupBays(), newLineup]);
    this.selectedLineupId.set(newLineup.id);
    this.editingLineupId = newLineup.id;
    this.editingLineupOriginal = null;
  }

  editSelectedLineupInline(): void {
    const selected = this.lineupBays().find(l => l.id === this.selectedLineupId());
    if (!selected) {
      return;
    }
    this.editingLineupId = selected.id;
    this.editingLineupOriginal = { ...selected };
  }

  saveSelectedLineupInline(): void {
    const row = this.lineupBays().find(l => l.id === this.editingLineupId);
    if (!row) {
      return;
    }
    if (!String(row.lineup || '').trim() || !String(row.startBay || '').trim() || !String(row.endBay || '').trim()) {
      this.snackBar.open('Please fill in Lineup, Start Bay, and End Bay', 'Close', { duration: 2400 });
      return;
    }

    const startBayNum = Number(row.startBay);
    const endBayNum = Number(row.endBay);
    if (!Number.isFinite(startBayNum) || !Number.isFinite(endBayNum)) {
      this.snackBar.open('Start Bay and End Bay must be numeric', 'Close', { duration: 2400 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirm Changes',
        message: `Save changes to lineup ${row.lineup || ''}?`,
        confirmText: 'Save',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        if (this.editingLineupOriginal && row && !row.isNew) {
          Object.assign(row, this.editingLineupOriginal);
          this.lineupBays.set([...this.lineupBays()]);
        }
        this.editingLineupId = null;
        this.editingLineupOriginal = null;
        return;
      }

      const wi = this.selectedWorkItem();
      if (!wi?.workItemId) {
        this.snackBar.open('No work item selected', 'Close', { duration: 2200 });
        return;
      }

      const primaryPartId = row.projPartId || this.selectedPrimaryPartId();
      if (!primaryPartId) {
        this.snackBar.open('Select a primary part first', 'Close', { duration: 2200 });
        return;
      }

      this.workItemService.saveLineup(this.projectNum, wi.workItemId, {
        itemLineupId: row.itemLineupId || undefined,
        projPartId: primaryPartId,
        lineup: row.lineup,
        startBay: startBayNum,
        endBay: endBayNum
      }).subscribe({
        next: () => {
          this.editingLineupId = null;
          this.editingLineupOriginal = null;
          this.loadDetailTablesForWorkItem(wi.workItemId);
          this.snackBar.open('Lineup/Bay saved successfully', 'Close', { duration: 2400 });
        },
        error: (err) => {
          if (this.editingLineupOriginal && row && !row.isNew) {
            Object.assign(row, this.editingLineupOriginal);
            this.lineupBays.set([...this.lineupBays()]);
          }
          this.editingLineupId = null;
          this.editingLineupOriginal = null;
          const message = (err && err.error && err.error.message)
            ? err.error.message
            : 'Failed to save lineup/bay';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      });
    });
  }

  cancelLineupEditAndClean(): void {
    if (this.editingLineupId === null) {
      return;
    }
    const row = this.lineupBays().find(l => l.id === this.editingLineupId);
    if (row?.isNew) {
      this.lineupBays.set(this.lineupBays().filter(l => l.id !== this.editingLineupId));
    } else if (row && this.editingLineupOriginal) {
      Object.assign(row, this.editingLineupOriginal);
      this.lineupBays.set([...this.lineupBays()]);
    }
    this.editingLineupId = null;
    this.editingLineupOriginal = null;
  }

  deleteSelectedLineupInline(): void {
    const selectedId = this.selectedLineupId();
    const wi = this.selectedWorkItem();
    if (!selectedId || !wi?.workItemId) {
      return;
    }

    const selected = this.lineupBays().find(l => l.id === selectedId);
    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Delete lineup ${selected?.lineup || ''}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      if (selected?.isNew || !selected?.itemLineupId) {
        const updated = this.lineupBays().filter(l => l.id !== selectedId);
        this.lineupBays.set(updated);
        this.selectedLineupId.set(updated.length ? updated[0].id : null);
        this.snackBar.open('Lineup/Bay deleted', 'Close', { duration: 2200 });
        return;
      }

      this.workItemService.deleteLineup(this.projectNum, wi.workItemId, selected.itemLineupId).subscribe({
        next: () => {
          this.loadDetailTablesForWorkItem(wi.workItemId, this.selectedPrimaryPartId());
          this.snackBar.open('Lineup/Bay deleted', 'Close', { duration: 2200 });
        },
        error: (err) => {
          const message = (err && err.error && err.error.message)
            ? err.error.message
            : 'Failed to delete lineup/bay';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      });
    });
  }

  addAdditionalPartInline(): void {
    const selectedPrimary = this.primaryParts().find(p => p.id === this.selectedPrimaryPartId());
    if (!selectedPrimary?.projPartId) {
      this.snackBar.open('Select a primary part first', 'Close', { duration: 2200 });
      return;
    }
    this.refreshAssocDropdownParts();
    const newPart: any = {
      id: Date.now(),
      qty: 1,
      partDesc: '',
      partNum: '',
      orderParm: '',
      projPartId: selectedPrimary.projPartId,
      assocPartId: null,
      catId: selectedPrimary.catId || 0,
      isNew: true
    };

    this.additionalParts.set([...this.additionalParts(), newPart] as any);
    this.selectedAdditionalPartId.set(newPart.id);
    this.editingAdditionalPartId = newPart.id;
    this.editingAdditionalPartOriginal = null;
    this.scrollPanelToBottom(this.additionalPanelTableWrap);
  }

  editSelectedAdditionalPartInline(): void {
    const selected = (this.additionalParts() as any[]).find(p => p.id === this.selectedAdditionalPartId());
    if (!selected) {
      return;
    }
    this.editingAdditionalPartId = selected.id;
    this.editingAdditionalPartOriginal = { ...selected };
  }

  saveSelectedAdditionalPartInline(): void {
    const wi = this.selectedWorkItem();
    const row = (this.additionalParts() as any[]).find(p => p.id === this.editingAdditionalPartId);
    const selectedPrimaryId = this.selectedPrimaryPartId();
    if (!wi?.workItemId || !row?.projPartId) {
      return;
    }
    if (!row.qty || !row.assocPartId) {
      this.snackBar.open('Please fill in Qty and Description', 'Close', { duration: 2200 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirm Changes',
        message: `Save changes to part ${row.partNum || ''}?`,
        confirmText: 'Save',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        if (this.editingAdditionalPartOriginal && row && !row.isNew) {
          Object.assign(row, this.editingAdditionalPartOriginal);
          this.additionalParts.set([...(this.additionalParts() as any[])] as any);
        }
        this.editingAdditionalPartId = null;
        this.editingAdditionalPartOriginal = null;
        return;
      }

      const saveCurrent = () => {
        this.workItemService.saveAssociatedPart(this.projectNum, wi.workItemId, {
          projPartId: row.projPartId,
          assocPartId: Number(row.assocPartId),
          qty: Number(row.qty),
          catId: Number(row.catId || 0)
        }).subscribe({
          next: () => {
            this.editingAdditionalPartId = null;
            this.editingAdditionalPartOriginal = null;
            this.loadDetailTablesForWorkItem(wi.workItemId, selectedPrimaryId);
            this.snackBar.open('Associated part saved successfully', 'Close', { duration: 2400 });
          },
          error: () => this.snackBar.open('Failed to save associated part', 'Close', { duration: 2400 })
        });
      };

      const originalAssocPartId = this.editingAdditionalPartOriginal?.assocPartId;
      if (!row.isNew && originalAssocPartId && Number(originalAssocPartId) !== Number(row.assocPartId)) {
        this.workItemService.deleteAssociatedPart(this.projectNum, wi.workItemId, row.projPartId, originalAssocPartId).subscribe({
          next: () => saveCurrent(),
          error: () => this.snackBar.open('Failed to save associated part', 'Close', { duration: 2400 })
        });
        return;
      }

      saveCurrent();
    });
  }

  cancelAdditionalPartEditAndClean(): void {
    if (this.editingAdditionalPartId === null) {
      return;
    }
    const row = (this.additionalParts() as any[]).find(p => p.id === this.editingAdditionalPartId);
    if (row?.isNew) {
      this.additionalParts.set((this.additionalParts() as any[]).filter(p => p.id !== this.editingAdditionalPartId) as any);
    } else if (row && this.editingAdditionalPartOriginal) {
      Object.assign(row, this.editingAdditionalPartOriginal);
      this.additionalParts.set([...(this.additionalParts() as any[])] as any);
    }
    this.editingAdditionalPartId = null;
    this.editingAdditionalPartOriginal = null;
  }

  deleteSelectedAdditionalPartInline(): void {
    const wi = this.selectedWorkItem();
    const selected = (this.additionalParts() as any[]).find(p => p.id === this.selectedAdditionalPartId());
    const selectedPrimaryId = this.selectedPrimaryPartId();
    if (!wi?.workItemId || !selected) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Delete part ${selected.partNum || ''}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      if (selected.isNew || !selected.projPartId || !selected.assocPartId) {
        this.additionalParts.set((this.additionalParts() as any[]).filter(p => p.id !== selected.id) as any);
        this.selectedAdditionalPartId.set(null);
        this.snackBar.open('Associated part deleted successfully', 'Close', { duration: 2400 });
        return;
      }

      this.workItemService.deleteAssociatedPart(this.projectNum, wi.workItemId, selected.projPartId, selected.assocPartId).subscribe({
        next: () => {
          this.loadDetailTablesForWorkItem(wi.workItemId, selectedPrimaryId);
          this.snackBar.open('Associated part deleted successfully', 'Close', { duration: 2400 });
        },
        error: () => this.snackBar.open('Failed to delete associated part', 'Close', { duration: 2400 })
      });
    });
  }

  addWorkItem(): void {
    // Check if user has opted to skip the intro dialog
    const skipIntro = localStorage.getItem('skipWorkItemIntroDialog') === 'true';

    if (skipIntro) {
      // Directly open the operation/category selection dialog
      this.openOperationCategoryDialog();
    } else {
      // Show the intro dialog first
      const ref = this.dialog.open(WorkItemIntroDialog, {
        data: { projectNum: this.projectNum },
        disableClose: true,
        autoFocus: false
      });
      ref.afterClosed().subscribe(result => {
        console.log('WorkItemWizardDialog closed - result:', result);
        console.log('Result selectedParts:', result?.selectedParts);
        if (result?.action === 'finish' || result?.action === 'complete') {
          this.createWorkItemFromResult(result);
        }
      });
    }
  }

  /** Open the operation/category selection dialog directly (for skipped intro) */
  private openOperationCategoryDialog(): void {
    const ref = this.dialog.open(WorkItemWizardDialog, {
      data: { 
        projectNum: this.projectNum,
        isEditMode: false  // Explicitly set to false for new items - NOT edit mode
      },
      disableClose: true,
      autoFocus: false
    });
    ref.afterClosed().subscribe(result => {
      if (result?.action === 'finish' || result?.action === 'complete') {
        this.createWorkItemFromResult(result);
      }
    });
  }

  /** Create work item from wizard result */
  private createWorkItemFromResult(result: any): void {
    console.log('createWorkItemFromResult - result:', result);
    console.log('createWorkItemFromResult - result.selectedParts:', result.selectedParts);
    console.log('createWorkItemFromResult - result.selectedLineups:', result.selectedLineups);
    
    const opLabel = this.getOperationLabel(result.workItemOperation);
    const notes = this.buildAutoNotes(result);
    // result.workItemOperation is already a numeric workOpId from the dialog dropdown
    const opId = typeof result.workItemOperation === 'number'
      ? result.workItemOperation
      : (Number(result.workItemOperation) || 1);
    
    // Convert selected parts - only include parts with qty > 0 and partId
    const projectParts: any[] = [];
    if (result.selectedParts && result.selectedParts.length > 0) {
      projectParts.push(...result.selectedParts
        .filter((part: any) => part.qty && part.qty > 0 && part.partId)  // Only filter by qty and partId
        .map((part: any) => {
          const projPart: any = {
            qty: part.qty,
            partId: part.partId
          };
          return projPart;
        })
      );
    }
    
    const newItem: any = {
      projectNum: this.projectNum,
      workOpId: opId,
      workItemText: notes,
      category: result.materialCategory || '',
      parts: projectParts.length > 0 ? projectParts : undefined
    };
    
    console.log('Creating work item with data:', newItem);
    console.log('Parts count:', projectParts.length);
    console.log('Parts data sent to backend:', projectParts);
    projectParts.forEach((p, i) => console.log(`  Part ${i}:`, p));
    
    this.loading.set(true);
    this.workItemService.createWorkItem(this.projectNum, newItem).subscribe({
      next: () => {
        this.loadWorkItems();
        this.tabIndex = 0;
        this.snackBar.open('Work item added successfully', 'Close', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        // Reload BOM table if open
        const openDialogs = this.dialog.openDialogs;
        for (const dlg of openDialogs) {
          if (dlg.componentInstance && (dlg.componentInstance as any).loadBOM) {
            (dlg.componentInstance as any).loadBOM();
          }
        }
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to add work item', 'Close', { duration: 4000 });
      }
    });
  }

  private getOperationId(op: string): number {
    // Map operation string to WRK_OP_ID in order: Add, Info only, Modify (bom), Remove
    switch (op) {
      case 'install': return 1; // Add
      case 'modify': return 2; // Info only
      case 'relocate': return 3; // Modify (bom)
      case 'remove': return 4; // Remove
      default: return 1;
    }
  }

  /** Map workOpId to user-friendly operation label for table display - dynamically loads from backend */
  getOperationLabelById(workOpId: number | undefined): string {
    if (!workOpId) return '';
    // Normalize common operation descriptions
    // Note: workOpId values are from database sequence, so we use a dynamic lookup
    // First, try to find from loaded operations
    const operations = this.workOperations() || [];
    const operation = operations.find((op: any) => op.workOpId === workOpId);
    if (operation) {
      return operation.workOpDesc || '';
    }
    // Fallback mapping for common cases (if operations haven't loaded yet)
    const fallbackMap: Record<number, string> = {
      1: 'Add',
      2: 'Modify (BOM)',
      22: 'Remove',
      23: 'Extend',
      62: 'Info. Only',
      82: 'Modify/Relocate',
      102: 'Recable',
      142: 'Relocate (BOM)'
    };
    return (workOpId && fallbackMap[workOpId]) || '';
  }

  private getOperationLabel(op: string): string {
    const map: Record<string, string> = {
      install: 'Add',
      modify: 'Info only',
      relocate: 'Modify (bom)',
      remove: 'Remove'
    };
    return map[op] || op || '';
  }

  private buildAutoNotes(result: any): string {
    return result.nodesText?.trim() || '';
  }

  openWiNotes(): void {
    const wi = this.selectedWorkItem();
    
    if (!wi?.workItemId) {
      this.snackBar.open('Please select a work item', 'Close', { duration: 2000 });
      return;
    }

    // Always show notes for the selected work item in single-item mode
    const ref = this.dialog.open(WiNotesDialog, {
      data: {
        projectNum: this.projectNum,
        workItemNum: wi.workItemNum,
        notes: wi.workItemText,
        mode: 'single'
      },
      disableClose: false,
      autoFocus: false
    });
    ref.afterClosed().subscribe((result: any) => {
      console.log('[openWiNotes] Dialog closed with result:', result);
      
      if (result?.action === 'save') {
        console.log('[openWiNotes] Saving notes: "' + result.notes + '"');
        console.log('[openWiNotes] WorkItem ID:', wi.workItemId);
        console.log('[openWiNotes] Project Num:', this.projectNum);
        
        this.loading.set(true);
        // Use service method so URL always matches backend /api/projects/... route
        this.workItemService.updateNotes(this.projectNum, wi.workItemId, result.notes).subscribe({
          next: (response) => {
            console.log('[openWiNotes] ✅ Update successful:', response);
            this.loadWorkItems();
            this.snackBar.open('Notes updated successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['snackbar-success']
            });
          },
          error: (err) => {
            console.error('[openWiNotes] ❌ Update failed:', err);
            console.error('[openWiNotes] Error status:', err?.status);
            console.error('[openWiNotes] Error message:', err?.message);
            console.error('[openWiNotes] Error body:', err?.error);
            this.loading.set(false);
            this.snackBar.open('Failed to update notes', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  /**
   * Extract first line of work item notes for table display
   */
  getFirstLineOfNotes(text: string | undefined): string {
    if (!text) return '';
    const firstLineMatch = text.match(/^([^\n\r]*)/);
    return firstLineMatch ? firstLineMatch[1] : '';
  }

  deleteWorkItem(): void {
    const wi = this.selectedWorkItem();
    if (!wi?.workItemId) {
      this.snackBar.open('Please select a work item to delete', 'Close', { duration: 2000 });
      return;
    }

    const ref = this.dialog.open(WorkItemDeleteDialog, {
      data: {
        workItemNum: wi.workItemNum,
        workItemId: wi.workItemId
      },
      disableClose: true,
      autoFocus: false
    });

    ref.afterClosed().subscribe((result: boolean) => {
      if (result === true) {
        // If the workItemId is negative, it's a new/unsaved item, just remove from local list
        const showDeletedDialogAndSnackbar = () => {
          const deletedRef = this.dialog.open(WorkItemDeletedDialog, {
            data: { workItemNum: wi.workItemNum },
            disableClose: false,
            autoFocus: false
          });
          deletedRef.afterClosed().subscribe(() => {
            this.snackBar.open('Work item deleted successfully', 'Close', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['snackbar-success']
            });
          });
        };
        if (wi.workItemId < 0) {
          this.workItems.update((items: WorkItem[]) => items.filter((item: WorkItem) => item.workItemId !== wi.workItemId));
          this.selectedWorkItem.set(null);
          showDeletedDialogAndSnackbar();
        } else {
          this.workItemService.deleteWorkItem(this.projectNum, wi.workItemId).subscribe({
            next: () => {
              this.loadWorkItems();
              showDeletedDialogAndSnackbar();
            },
            error: () => this.snackBar.open('Delete failed', 'Close', { duration: 4000 })
          });
        }
      }
    });
  }

  moveUp(): void {
    const wi = this.selectedWorkItem();
    if (!wi?.workItemId) return;
    const items = this.workItems();
    const idx = items.findIndex(i => i.workItemId === wi.workItemId);
    if (idx > 0) {
      this.workItemService.reorder(this.projectNum, wi.workItemId, items[idx - 1].workItemId).subscribe({
        next: () => this.loadWorkItems()
      });
    }
  }

  moveDown(): void {
    const wi = this.selectedWorkItem();
    if (!wi?.workItemId) return;
    const items = this.workItems();
    const idx = items.findIndex(i => i.workItemId === wi.workItemId);
    if (idx >= 0 && idx < items.length - 1) {
      this.workItemService.reorder(this.projectNum, wi.workItemId, items[idx + 1].workItemId).subscribe({
        next: () => this.loadWorkItems()
      });
    }
  }

  goBack(): void {
    // Navigate back to landing page with project state preserved
    this.router.navigate(['/home'], { 
      state: { 
        projectNum: this.projectNum,
        project: this.project
      }
    });
  }

  editWorkItem(): void {
    const wi = this.selectedWorkItem();
    if (!wi?.workItemId) {
      this.snackBar.open('Please select a work item to edit', 'Close', { duration: 2000 });
      return;
    }

    // Open wizard dialog directly (skip intro dialog)
    const ref = this.dialog.open(WorkItemWizardDialog, {
      data: { 
        projectNum: this.projectNum, 
        workItem: wi,
        isEditMode: true
      },
      disableClose: true,
      autoFocus: false
    });

    ref.afterClosed().subscribe((result: any) => {
      console.log('WorkItemWizardDialog closed with result:', result);
      if (result?.action === 'finish' || result?.action === 'complete') {
        // Patch: flatten result.result if nested
        const flatResult = result.result ? { ...result.result, ...result } : result;
        console.log('Edit result received, PROCESSING UPDATE:', flatResult);
        // Only update fields if changed, otherwise keep original
        const opLabel = this.getOperationLabel(flatResult.workItemOperation);
        const opId = typeof flatResult.workItemOperation === 'number'
          ? flatResult.workItemOperation
          : (Number(flatResult.workItemOperation) || wi.workOpId || 1);
        const updatedItem: Partial<WorkItem> = {};
        
        // Only send fields that exist in the backend WorkItem entity
        if (flatResult.workItemOperation) {
          updatedItem.workOpId = opId;
        } else {
          updatedItem.workOpId = wi.workOpId;
        }
        
        // Use notesText (from edit notes dialog) if available, otherwise use nodesText (from part selection)
        if (typeof flatResult.notesText === 'string' && flatResult.notesText.trim() !== '') {
          updatedItem.workItemText = flatResult.notesText;
        } else if (typeof flatResult.nodesText === 'string' && flatResult.nodesText.trim() !== '') {
          updatedItem.workItemText = flatResult.nodesText;
        } else {
          updatedItem.workItemText = wi.workItemText;
        }

        console.log('Sending update to backend:', updatedItem);
        this.loading.set(true);
        this.workItemService.updateWorkItem(this.projectNum, wi.workItemId, updatedItem).subscribe({
          next: () => {
            console.log('✅ Update successful, loading work items');
            this.loadWorkItems();
            this.selectedWorkItem.set(null); // Clear selection to force UI refresh
            this.tabIndex = 0;
            this.snackBar.open('Work item edited successfully', 'Close', {
              duration: 4000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['snackbar-success']
            });
          },
          error: (err) => {
            console.error('❌ Error updating work item:', err);
            this.loading.set(false);
            this.snackBar.open('Failed to edit work item', 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  editNotes(): void {
    // TODO: Implement edit notes dialog
    const wi = this.selectedWorkItem();
    if (!wi?.workItemId) {
      this.snackBar.open('Please select a work item', 'Close', { duration: 2000 });
      return;
    }
    this.openWiNotes();
  }

  /**
   * Add a primary part to the selected work item and save to database
   */
  addPrimaryPart(part: Partial<ProjectPart>): void {
    const wi = this.selectedWorkItem();
    if (!wi?.workItemId) {
      this.snackBar.open('Please select a work item', 'Close', { duration: 2000 });
      return;
    }

    if (!part.partId || !part.qty || part.qty <= 0) {
      this.snackBar.open('Invalid part data', 'Close', { duration: 2000 });
      return;
    }

    this.loading.set(true);
    this.workItemService.savePart(this.projectNum, wi.workItemId, part).subscribe({
      next: (savedPart: ProjectPart) => {
        console.log('Primary part saved:', savedPart);
        // Update the workItemParts signal with the new part
        this.workItemParts.update(parts => [...parts, savedPart]);
        this.snackBar.open('Part added successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error adding primary part:', err);
        this.loading.set(false);
        this.snackBar.open('Failed to add part', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Remove a primary part from the selected work item and database
   */
  removePrimaryPart(projPartId: number): void {
    const wi = this.selectedWorkItem();
    if (!wi?.workItemId) {
      this.snackBar.open('Please select a work item', 'Close', { duration: 2000 });
      return;
    }

    this.loading.set(true);
    this.workItemService.deletePart(this.projectNum, wi.workItemId, projPartId).subscribe({
      next: () => {
        console.log('Primary part deleted:', projPartId);
        // Update the workItemParts signal
        this.workItemParts.update(parts => parts.filter(p => p.projPartId !== projPartId));
        this.snackBar.open('Part removed successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error removing primary part:', err);
        this.loading.set(false);
        this.snackBar.open('Failed to remove part', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Add an additional associated part and save to database
   */
  addAdditionalPart(part: Partial<ProjectPart>): void {
    const wi = this.selectedWorkItem();
    if (!wi?.workItemId) {
      this.snackBar.open('Please select a work item', 'Close', { duration: 2000 });
      return;
    }

    if (!part.partId || !part.qty || part.qty <= 0) {
      this.snackBar.open('Invalid part data', 'Close', { duration: 2000 });
      return;
    }

    this.loading.set(true);
    this.workItemService.savePart(this.projectNum, wi.workItemId, part).subscribe({
      next: (savedPart: ProjectPart) => {
        console.log('Additional part saved:', savedPart);
        // Update the additionalParts signal with the new part
        this.additionalParts.update(parts => [...parts, savedPart]);
        this.snackBar.open('Additional part added successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error adding additional part:', err);
        this.loading.set(false);
        this.snackBar.open('Failed to add additional part', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Remove an additional associated part and from database
   */
  removeAdditionalPart(projPartId: number): void {
    const wi = this.selectedWorkItem();
    if (!wi?.workItemId) {
      this.snackBar.open('Please select a work item', 'Close', { duration: 2000 });
      return;
    }

    this.loading.set(true);
    this.workItemService.deletePart(this.projectNum, wi.workItemId, projPartId).subscribe({
      next: () => {
        console.log('Additional part deleted:', projPartId);
        // Update the additionalParts signal
        this.additionalParts.update(parts => parts.filter(p => p.projPartId !== projPartId));
        this.snackBar.open('Additional part removed successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snackbar-success']
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error removing additional part:', err);
        this.loading.set(false);
        this.snackBar.open('Failed to remove additional part', 'Close', { duration: 3000 });
      }
    });
  }
}
