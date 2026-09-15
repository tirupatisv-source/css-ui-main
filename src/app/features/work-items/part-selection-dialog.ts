import { Component, Inject, ElementRef, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { WorkItemService } from '../../core/services/work-item.service';
import { AssociatedNodesDialog } from './associated-notes-entry-dialog';

export interface Part {
  qty: number;
  partDescription: string;
  partId?: number; // Optional: can be set when part is selected from master parts
  partNum?: string; // Part number from master parts
}

export interface PartSelectionData {
  projectNum: string;
  parts: Part[];
  materialCategory?: string | number;
  stackDepth?: number;
  dialogPosition?: any;
}

@Component({
  selector: 'app-part-selection-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule, MatProgressSpinnerModule, MatTableModule, MatCheckboxModule, MatDividerModule,
    MatSelectModule, MatOptionModule
  ],
  template: `
    <h2 mat-dialog-title style="color: #8a4d00; font-weight: 600;">Parts Selection ({{ data.projectNum }})</h2>
    <p style="font-size: 14px; color: #6b7280; margin: -12px 27px 0;">Select the parts for this work item.</p>

    

      <!-- Body -->
      <mat-dialog-content class="dialog-body">
        @if (isLoadingMasterParts()) {
          <div class="parts-loading-state">
            <mat-spinner diameter="30"></mat-spinner>
            <div>Loading parts...</div>
          </div>
        } @else {
          <table class="parts-table">
            <thead>
              <tr>
                <th class="col-select"></th>
                <th class="col-qty">QTY</th>
                <th class="col-description">Part Description</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let part of data.parts; let i = index">
                <td class="col-select">
                  <input type="checkbox" class="part-checkbox" />
                </td>
                <td class="col-qty">
                  <input class="cell-input cell-input-center" type="number" min="0" [(ngModel)]="part.qty" (ngModelChange)="onRowEdit(i)" />
                </td>
                <td class="col-description">
                  <mat-select class="part-select" [(ngModel)]="part.partDescription" (ngModelChange)="onRowEdit(i)" [compareWith]="comparePartDescriptions">
                    <mat-option value="">-- Select Part --</mat-option>
                    <mat-option *ngFor="let masterPart of masterParts()" [value]="masterPart.partDesc">
                      {{ masterPart.partDesc }}
                    </mat-option>
                  </mat-select>
                </td>
              </tr>
            </tbody>
          </table>
        }
      </mat-dialog-content>

      

      <!-- Footer -->
      <mat-dialog-actions class="dialog-footer">
        <div class="footer-right">
          <button class="dialog-btn cancel-btn" (click)="onCancel()">Cancel</button>
          <button class="dialog-btn back-btn" (click)="onBack()">Back</button>
          <button class="dialog-btn next-btn" (click)="onNext()">Next</button>
          <!-- <button class="dialog-btn finish-btn" [disabled]="true">Finish</button> -->
        </div>
      </mat-dialog-actions>
    `,
  styles: [`
    :host {
      display: block;
    }

    h2 {
      width: 700px;
    }

    ::ng-deep .mat-mdc-dialog-container {
      box-shadow: none !important;
    }
    ::ng-deep .cdk-overlay-backdrop {
      background-color: transparent !important;
      background: transparent !important;
      opacity: 1 !important;
      pointer-events: none !important;
    }

    mat-dialog-content {
      width: 700px;
      min-height: 265px;
      max-height: 505px;
    }

    mat-dialog-actions {
      width: 700px;
    }

    /* Body */
    .dialog-body {
      flex: 1;
      padding: 20px 24px;
      overflow-y: auto;
    }

    .parts-loading-state {
      min-height: 220px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #8a4d00;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    }

    ::ng-deep .parts-loading-state .mat-mdc-progress-spinner circle {
      stroke: #ff9800 !important;
    }

    /* Table */
    .parts-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #d1d5db;
      font-size: 13px;
    }

    .parts-table thead {
      background-color: #f3f4f6;
    }

    .parts-table th {
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .parts-table td {
      padding: 4px 6px;
      border: 1px solid #d1d5db;
      color: #374151;
    }

    .cell-input {
      width: 100%;
      border: none;
      background: transparent;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      color: #374151;
      padding: 6px 4px;
      box-sizing: border-box;
      outline: none;
    }

    .cell-input-center {
      text-align: center;
    }

    .cell-input:focus {
      background: #fff9f0;
      border-radius: 3px;
      box-shadow: inset 0 0 0 2px #ff9800;
    }

    .part-select {
      width: 100%;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      color: var(--color-text-primary);
      background: var(--color-bg-input) !important;
    }

    ::ng-deep .part-select .mat-mdc-select-trigger {
      padding: 6px 4px !important;
      background: var(--color-bg-input) !important;
      color: var(--color-text-primary) !important;
    }

    ::ng-deep .part-select .mat-mdc-select-arrow {
      color: #6b7280;
    }

    ::ng-deep .mat-mdc-select-arrow-wrapper {
      height: 24px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      padding-right: 9px;
    }

    /* Dark theme for Angular Material select panel */
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-select-panel,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-select-trigger {
      background: var(--color-bg-input) !important;
      color: var(--color-text-primary) !important;
    }

    ::ng-deep .mat-mdc-option:hover {
      background-color: #f1ece5 !important;
    }

    ::ng-deep .mat-mdc-option:hover .mdc-list-item__primary-text {
      color: #333333 !important;
    }

    .add-row-btn {
      margin-top: 8px;
      height: 30px;
      padding: 0 14px;
      border-radius: 6px;
      border: 1.5px dashed #ff9800;
      background: transparent;
      font-size: 12px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-weight: 500;
      color: #ff9800;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .add-row-btn:hover {
      background: #f1ece5;
    }

    .parts-table tbody tr:hover {
      background-color: #f1ece5;
    }

    .col-select {
      width: 40px;
      text-align: center;
    }

    .col-qty {
      width: 80px;
      text-align: center;
    }

    .col-description {
      flex: 1;
    }

    .part-checkbox {
      accent-color: #ff9800;
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    /* Footer */
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 12px 24px;
      background: white;
      border-top: 1px solid #e5e7eb;
    }

    .footer-right {
      display: flex;
      gap: 8px;
    }

    .dialog-btn {
      height: 32px;
      padding: 0 18px;
      border-radius: 6px;
      border: 1.5px solid #d1d5db;
      background: #ffffff;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .dialog-btn:hover:not([disabled]) {
      border-color: #ff9800;
      color: #ff9800;
      background: #fff3e0;
    }

    .dialog-btn[disabled] {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .cancel-btn {
      border-color: transparent;
      color: #ff9800;
      background: transparent;
    }

    .cancel-btn:hover, .cancel-btn:hover:not([disabled]) {
      background: rgba(25, 118, 210, 0.08) !important;
      color: #ff9800 !important;
      border-color: transparent !important;
    }

    .back-btn {
      border-color: transparent;
      color: #ff9800;
      background: transparent;
    }

    .back-btn:hover:not([disabled]) {
      background: rgba(25, 118, 210, 0.08) !important;
      color: #ff9800 !important;
      border-color: transparent !important;
    }

    .next-btn {
      border-color: #ff9800;
      color: #ffffff;
      background: #ff9800;
    }

    .next-btn:hover {
      background: #f57c00 !important;
      color: #ffffff !important;
    }

    .finish-btn {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .finish-btn:hover, .finish-btn:hover:not([disabled]) {
      opacity: 0.4;
      cursor: not-allowed;
    }

    ::ng-deep .mat-mdc-select-value {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: 10px;
    }
  `]
})
export class PartSelectionDialog implements OnInit {
  selectedParts: Set<number> = new Set();
  masterParts = signal<any[]>([]);
  isLoadingMasterParts = signal(true);

  private static masterPartsCache = new Map<string, { timestamp: number; parts: any[] }>();
  private static readonly CACHE_DURATION_MS = 30 * 60 * 1000;

  // Parts data organized by material category with partId and partNum
  private partsByCategory = {
    cable: [
      { desc: 'CAT6 Cable', partId: 1, partNum: 'CAT6-001' },
      { desc: 'RJ45 Connector', partId: 2, partNum: 'RJ45-001' },
      { desc: 'Cable Tray', partId: 3, partNum: 'TRAY-001' },
      { desc: 'Patch Cord', partId: 4, partNum: 'PATCH-001' },
      { desc: 'Network Cable', partId: 5, partNum: 'NET-001' }
    ],
    equipment: [
      { desc: 'Switch', partId: 6, partNum: 'SW-001' },
      { desc: 'Router', partId: 7, partNum: 'RTR-001' },
      { desc: 'Server', partId: 8, partNum: 'SRV-001' },
      { desc: 'Firewall', partId: 9, partNum: 'FW-001' },
      { desc: 'Access Point', partId: 10, partNum: 'AP-001' }
    ],
    hardware: [
      { desc: 'Bolt M6', partId: 11, partNum: 'BOLT-M6' },
      { desc: 'Nut M6', partId: 12, partNum: 'NUT-M6' },
      { desc: 'Washer', partId: 13, partNum: 'WASH-001' },
      { desc: 'Bracket', partId: 14, partNum: 'BRACK-001' },
      { desc: 'Clamp', partId: 15, partNum: 'CLAMP-001' }
    ],
    power: [
      { desc: 'Power Supply', partId: 16, partNum: 'PSU-001' },
      { desc: 'PDU', partId: 17, partNum: 'PDU-001' },
      { desc: 'UPS', partId: 18, partNum: 'UPS-001' },
      { desc: 'Breaker', partId: 19, partNum: 'BRK-001' },
      { desc: 'Power Cable', partId: 20, partNum: 'PWRCBL-001' }
    ]
  };

  constructor(
    public dialogRef: MatDialogRef<PartSelectionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PartSelectionData,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private workItemService: WorkItemService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('🔄 PartSelectionDialog ngOnInit - projectNum:', this.data.projectNum);
    console.log('📁 Material Category:', this.data.materialCategory);
    console.log('📦 Parts provided:', this.data.parts);
    
    // Initialize parts array first before loading master parts
    if (!this.data.parts || this.data.parts.length === 0) {
      console.log('Initializing with default part row (qty 1)');
      this.data.parts = [{ qty: 1, partDescription: '' }];
    } else {
      this.data.parts = this.data.parts.map((part: any) => {
        const qtyValue = Number(part.qty ?? 0);
        return {
          ...part,
          qty: Number.isFinite(qtyValue) ? qtyValue : 0,
          partDescription: part.partDescription || part.partDesc || ''
        };
      });
      console.log('✅ Parts with descriptions provided:', this.data.parts);
      // Log each part for debugging
      this.data.parts.forEach((part, idx) => {
        console.log(`  Part ${idx}: qty=${part.qty}, description="${part.partDescription}", partId=${part.partId}`);
      });
    }
    
    this.loadMasterParts();
  }

  private getCacheKey(): string {
    const categoryKey = this.data.materialCategory ? String(this.data.materialCategory) : 'all';
    return `${this.data.projectNum}:${categoryKey}`;
  }

  private setMasterParts(parts: any[]): void {
    this.masterParts.set(parts);
    this.verifyPrefilledDescriptions();
    this.isLoadingMasterParts.set(false);
    this.cdr.detectChanges();
  }

  private loadMasterParts(): void {
    const cacheKey = this.getCacheKey();
    const cached = PartSelectionDialog.masterPartsCache.get(cacheKey);
    const isCacheValid = !!cached && (Date.now() - cached.timestamp < PartSelectionDialog.CACHE_DURATION_MS);

    if (isCacheValid && cached) {
      console.log('📦 Using cached master parts for parts-selection dialog');
      this.setMasterParts(cached.parts);
      return;
    }

    this.isLoadingMasterParts.set(true);

    const loadAllParts = () => {
      this.workItemService.getAllMasterParts(this.data.projectNum).subscribe({
        next: (parts) => {
          const normalized = parts || [];
          PartSelectionDialog.masterPartsCache.set(cacheKey, {
            timestamp: Date.now(),
            parts: normalized
          });
          console.log('✅ Master parts loaded:', normalized.length, 'parts');
          this.setMasterParts(normalized);
        },
        error: (err) => {
          console.error('❌ Error loading master parts:', err);
          console.error('Error details:', err.message, err.status);
          this.isLoadingMasterParts.set(false);
        }
      });
    };

    if (this.data.materialCategory) {
      const categoryId = typeof this.data.materialCategory === 'string'
        ? parseInt(this.data.materialCategory, 10)
        : this.data.materialCategory;

      console.log('🔍 Fetching parts for category ID:', categoryId);
      this.workItemService.getPartsByCategory(this.data.projectNum, categoryId).subscribe({
        next: (parts) => {
          const normalized = parts || [];
          PartSelectionDialog.masterPartsCache.set(cacheKey, {
            timestamp: Date.now(),
            parts: normalized
          });
          console.log('✅ Master parts loaded for category:', normalized.length, 'parts');
          this.setMasterParts(normalized);
        },
        error: (err) => {
          console.error('❌ Error loading parts for category:', err);
          loadAllParts();
        }
      });
      return;
    }

    console.log('📋 No category filter - loading all master parts');
    loadAllParts();
  }

  /** Verify that pre-filled part descriptions exist in the master parts list */
  private verifyPrefilledDescriptions(): void {
    console.log('🔍 Verifying pre-filled descriptions against loaded master parts');
    this.data.parts.forEach((part, idx) => {
      if (part.partDescription) {
        const found = this.masterParts().find(m => m.partDesc === part.partDescription);
        if (found) {
          console.log(`✅ Part ${idx}: "${part.partDescription}" found in master parts, partId=${found.partId}`);
          // Ensure partId and partNum are set
          if (!part.partId) {
            part.partId = found.partId;
            part.partNum = found.partNum;
          }
        } else {
          console.warn(`⚠️ Part ${idx}: "${part.partDescription}" NOT found in master parts list!`);
        }
      }
    });
  }

  /** Get available parts from master parts list ordered by description */
  getAvailablePartsForCategory(): string[] {
    return this.masterParts().map(p => p.partDesc).sort();
  }

  /** Compare function for part descriptions in mat-select */
  comparePartDescriptions(a: string, b: string): boolean {
    if (!a || !b) {
      return (!a || a === '') && (!b || b === '');
    }
    return a === b;
  }

  /** Get partId and partNum for a selected part description */
  private getPartMetadata(partDescription: string): { partId?: number; partNum?: string } {
    const masterPart = this.masterParts().find(p => p.partDesc === partDescription);
    if (masterPart) {
      return { partId: masterPart.partId, partNum: masterPart.partNum };
    }
    return {};
  }

  onRowEdit(index: number): void {
    // When a part is selected, populate partId and partNum
    const part = this.data.parts[index];
    if (part.partDescription) {
      const metadata = this.getPartMetadata(part.partDescription);
      part.partId = metadata.partId;
      part.partNum = metadata.partNum;
      console.log(`Part selected at index ${index}: ${part.partDescription}`, part);
    }
    
    // Automatically add a new row if editing the last row
    if (index === this.data.parts.length - 1) {
      this.data.parts.push({ qty: 0, partDescription: '' });
    }
  }

  togglePart(index: number): void {
    if (this.selectedParts.has(index)) {
      this.selectedParts.delete(index);
    } else {
      this.selectedParts.add(index);
    }
  }

  onBack(): void {
    this.dialogRef.close({ action: 'back' });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onNext(): void {
    // Filter out empty rows - only return parts with qty > 0 and partDescription selected
    const filteredParts = this.data.parts.filter(
      part => part.qty > 0 && part.partDescription && part.partId
    );
    
    console.log('onNext - ALL parts:', this.data.parts);
    console.log('onNext - FILTERED parts being returned:', filteredParts);
    console.log('Filtered parts count:', filteredParts.length);
    
    if (filteredParts.length === 0) {
      console.warn('No valid parts selected! Please enter parts with qty > 0 and description');
      return; // Don't proceed if no valid parts
    }
    
    this.dialogRef.close({ action: 'next', selectedParts: filteredParts });
  }
}
