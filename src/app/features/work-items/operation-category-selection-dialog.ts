import { Component, Inject, ElementRef, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { forkJoin } from 'rxjs';
import { PartSelectionDialog } from './part-selection-dialog';
import { ByLineupDialog } from './lineup-selection-dialog';
import { AssociatedNodesDialog } from './associated-notes-entry-dialog';
import { WorkItemCompletionDialog } from './work-item-wizard-completion-dialog';
import { WorkItemAdditionDialog } from './work-item-addition-dialog';

export interface WorkItemWizardData {
  projectNum: string;
  stackDepth?: number;
  isEditMode?: boolean;
  workItem?: any;
  dialogPosition?: any;
}

@Component({
  selector: 'app-work-item-wizard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, HttpClientModule,
    MatDialogModule, MatButtonModule, MatRadioModule,
    MatSelectModule, MatOptionModule, MatFormFieldModule, MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title style="color: #8a4d00; font-weight: 600;">Operation/Category Selection ({{ data.projectNum }})</h2>
    <p style="font-size: 14px; color: #6b7280; margin: -15px 27px 0;">
      Select the work item operation, material category, or vendor of items to be added, and the method <br>of selection.
    </p>
    <p *ngIf="data.isEditMode" style="font-size: 13px; color: red; background-color: #fef3c7; margin: 6px 15px 0; padding: 1px 3px; border-radius: 3px;">
      <strong>Warning:</strong> Changing the material category, parts selection type will remove all selected parts on the next screen.
    </p>

    <!-- Body -->
    <mat-dialog-content class="wizard-body" style="min-height: 130px;">
      <div class="wizard-columns">
        <div class="wizard-left">
          <!-- Work Item Operation -->
          <div class="field-block" style="margin-bottom: 0; margin-left: 32px;">
            <label class="field-label">Work Item Operation</label>
            <mat-select class="wizard-select" [(ngModel)]="workItemOperation" disableOptionCentering [compareWith]="compareValues">
              <mat-option [value]="''">-- Select --</mat-option>
              <mat-option *ngFor="let op of workItemOperations" [value]="op.workOpId">
                {{op.workOpDesc}}
              </mat-option>
            </mat-select>
          </div>
          <!-- Material Category -->
          <div class="field-block" style="margin-top: 0; margin-left: 32px; margin-bottom: -5px;">
            <label class="field-label">Material Category</label>
            <mat-select class="wizard-select" [(ngModel)]="materialCategory" disableOptionCentering panelClass="material-category-panel-class" [compareWith]="compareValues">
              <mat-option [value]="''">-- Select --</mat-option>
              <mat-option *ngFor="let cat of materialCategories" [value]="cat.catId">
                {{cat.category}}
              </mat-option>
            </mat-select>
          </div>
        </div>
        <div class="vertical-divider"></div>
        <div class="wizard-right">
          <div class="field-block" style="margin-top: 4px; margin-bottom: 0; padding-bottom: 0;">
            <label class="field-label">Item Choice</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="itemChoice" value="materialCategory" [(ngModel)]="itemChoice" />
                <span>Material Category</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="itemChoice" value="vendor" [(ngModel)]="itemChoice" />
                <span>Vendor</span>
              </label>
            </div>
          </div>
          <div class="field-block" style="margin-top: 0; margin-bottom: 0; padding-bottom: 0;">
            <label class="field-label" style="margin-top: 0; margin-bottom: 0;">Select Parts</label>
            <div class="radio-group" style="margin-bottom: 0; padding-bottom: 0;">
              <label class="radio-option">
                <input type="radio" name="selectParts" value="lineup" [(ngModel)]="selectParts" />
                <span>By Lineup</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="selectParts" value="quantity" [(ngModel)]="selectParts" />
                <span>By Quantity</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <!-- Footer -->
    <mat-dialog-actions class="wizard-footer">
      <div class="footer-right">
        <button class="wizard-btn cancel-btn" (click)="onCancel()">Cancel</button>
        <button class="wizard-btn back-btn" (click)="onBack()">Back</button>
        <button class="wizard-btn next-btn" (click)="onNext()" [disabled]="data.isEditMode && isLoadingParts">Next</button>
      </div>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
    }

    h2 {
      width: 600px;
    }

    mat-dialog-content {
      width: 550px;
      min-height: 500px;
      max-height: 700px;
      /* Increased height for add functionality */
    }

    mat-dialog-actions {
      width: 700px;
    }

    /* Body */
    .wizard-body {
      display: flex;
      flex: 1;
      padding: 0;
      margin: 0;
      min-height: 0;
    }

    .wizard-columns {
      display: flex;
      flex-direction: row;
      width: 100%;
      min-height: 0;
    }

    .wizard-left {
      flex: 0 0 340px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-right: 24px;
      min-height: 0;
    }

    .wizard-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding-left: 24px;
      min-height: 0;
      padding-bottom: 17px;
    }

    .vertical-divider {
      width: 1px;
      background-color: #e5e7eb;
      align-self: stretch;
      margin: 0 0;
      min-height: 0;
    }

    /* Fields */
    .field-block {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 15px;
    }

    .field-block > .field-label {
      display: block;
      margin-top: 10px;
    }

    .field-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #374151;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #374151;
      cursor: pointer;
    }

    .radio-option input[type="radio"] {
      accent-color: #ff9800;
      width: 16px;
      height: 16px;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      border: 2px solid #bdbdbd;
      border-radius: 50%;
      background: #fff;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      background-position: center;
      transition: border-color 0.18s;
    }

    .radio-option input[type="radio"]:checked {
      border: 2px solid #ff9800;
      background: radial-gradient(circle, #ff9800 30%, #ff9800 45%, transparent 45%);
    }

    /* Footer */
    .wizard-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 3px 23px;
      background: white;
      border-top: 1px solid #e5e7eb;
    }

    .footer-right {
      display: flex;
      gap: 8px;
    }

    .wizard-btn {
      height: 36px;
      padding: 0 20px;
      border-radius: 6px;
      border: none;
      background: #ffffff;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.18s ease;
    }

    .wizard-btn:hover:not([disabled]) {
      border-color: #ff9800;
      color: #ff9800;
      background: #fff3e0;
    }

    .wizard-btn[disabled] {
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

    .back-btn:hover, .back-btn:hover:not([disabled]) {
      background: rgba(25, 118, 210, 0.08) !important;
      color: #ff9800 !important;
      border-color: transparent !important;
    }

    .next-btn {
      background: #ff9800;
      color: #ffffff;
      border: none;
    }

    .next-btn:hover {
      background: #f57c00 !important;
      color: #ffffff !important;
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

    .wizard-select {
      height: 29px;
      min-height: 29px;
      background: var(--color-bg-input) !important;
      color: var(--color-text-primary) !important;
      border-radius: 6px;
      appearance: none;
      -webkit-appearance: none;
      font-size: 13px;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      cursor: pointer;
      transition: border-color 0.18s ease, box-shadow 0.18s ease;
      width: 98%;
      accent-color: var(--color-bg-input);
      padding-top: 0;
      padding-bottom: 0;
      box-sizing: border-box;
    }

    ::ng-deep .wizard-select .mat-mdc-select-trigger {
      border: 1px solid #a9a7a3 !important;
      border-radius: 6px !important;
      box-sizing: border-box !important;
      min-height: 29px;
      height: 29px;
      background: var(--color-bg-input) !important;
    }

    .wizard-select:hover {
      border-color: #ff9800;
    }

    .wizard-select:focus {
      outline: none;
      border-color: #faf9f6;
      box-shadow: #ff9800;
    }

    ::ng-deep .mat-mdc-option:hover, ::ng-deep .mat-mdc-option.mat-mdc-option-active {
      background: #f1ece5 !important;
      color: #333333 !important;
    }

    ::ng-deep .mat-mdc-select-panel {
      margin-top: 8px !important;
    }

    ::ng-deep .material-category-panel-class {
      margin-top: 8px !important;
      transform: translateY(0) !important;
    }

    ::ng-deep .mat-mdc-option {
      font-size: 12px !important;
      height: 25px !important;
      line-height: 25px !important;
    }

    ::ng-deep .mat-mdc-select-value {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-left: 10px;
    }

    ::ng-deep .mat-mdc-select-arrow-wrapper {
      height: 24px;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      padding-right: 9px;
    }
  `]
})
export class WorkItemWizardDialog implements OnInit, AfterViewInit {
  workItemOperation: number | string = '';
  materialCategory: number | string = '';
  selectParts = 'lineup';
  itemChoice = 'materialCategory';
  selectedParts: any[] = [];
  selectedLineups: any[] = [];
  nodesText = '';
  lastDialog: 'by-lineup' | 'part-selection' | null = null;
  dialogPosition: any;
  materialCategories: any[] = [];
  workItemOperations: any[] = [];
  private previousWorkOpId: number | string = '';
  private previousCategoryId: number | string = '';
  isLoadingParts = false; // Track if parts are being loaded for edit mode

  // Static cache for operations and categories to avoid repeated API calls
  private static cachedOperations: any[] | null = null;
  private static cachedCategories: any[] | null = null;
  private static cacheTimestamp: number = 0;
  private static CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache duration

  constructor(
    public dialogRef: MatDialogRef<WorkItemWizardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WorkItemWizardData,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    // Always reset selection state for a fresh dialog instance.
    this.workItemOperation = '';
    this.materialCategory = '';
    this.previousWorkOpId = '';
    this.previousCategoryId = '';

    // Store previous operation value for edit mode
    if (data.isEditMode && data.workItem) {
      console.log('WorkItemWizardDialog - Edit mode, workItem:', data.workItem);
      this.previousWorkOpId = data.workItem.workOpId || '';
      console.log('✅ Storing previous operation:', this.previousWorkOpId);

      // IMPORTANT: do not prefill category from workItem-level fields,
      // because that can carry stale values between edit flows.
      // Category must be derived from current work-item parts only.
      console.log('ℹ️ Category will be derived from current work item parts only');
    }
  }

  ngOnInit(): void {
    this.captureDialogPosition();
    console.log('🚀 ngOnInit() - Edit mode:', this.data.isEditMode);
    console.log('🚀 ngOnInit() - workItem:', this.data.workItem);
    console.log('🚀 ngOnInit() - previousCategoryId at start:', this.previousCategoryId);
    
    // If edit mode, load parts FIRST, then load dropdowns and apply prefill
    if (this.data.isEditMode && this.data.workItem?.workItemId) {
      console.log('📦 Edit mode detected, loading parts first...');
      this.loadExistingParts().then(() => {
        console.log('📦 Parts loaded, now loading dropdowns...');
        console.log('📦 previousCategoryId after parts:', this.previousCategoryId);
        // After parts are loaded, load dropdowns and apply prefill
        this.loadDropdownsAndPrefill();
      });
    } else {
      // For new items, just load dropdowns
      console.log('✨ New item mode, loading dropdowns...');
      this.loadDropdownsAndPrefill();
    }
  }

  ngAfterViewInit(): void {
    // After view is fully rendered, force-set the Material Category value
    // This ensures the mat-select elements exist before we try to set values
    console.log('👀 ngAfterViewInit() - View is now rendered');
    console.log('👀 materialCategory value:', this.materialCategory);
    console.log('👀 workItemOperation value:', this.workItemOperation);
    console.log('👀 materialCategories available:', this.materialCategories.length);
    
    // Force a final change detection to ensure mat-select picks up the values
    setTimeout(() => {
      console.log('🔄 Final change detection in ngAfterViewInit');
      this.cdr.detectChanges();
      
      // Verify the final state
      console.log('✅ FINAL STATE:');
      console.log('   materialCategory:', this.materialCategory, 'type:', typeof this.materialCategory);
      console.log('   workItemOperation:', this.workItemOperation, 'type:', typeof this.workItemOperation);
    }, 100);
  }

  /**
   * Load existing parts from the database for edit mode
   * Returns a promise that resolves when parts are fully loaded
   */
  private loadExistingParts(): Promise<void> {
    return new Promise((resolve) => {
      // Check if parts are already available (e.g., coming back from part-selection dialog)
      if (this.data.workItem?.parts && this.data.workItem.parts.length > 0) {
        console.log('✅ Parts already in workItem.parts, skipping API call');
        console.log('Parts:', this.data.workItem.parts);
        this.extractCategoryFromParts(this.data.workItem.parts);
        resolve();
        return;
      }
      
      this.isLoadingParts = true;
      this.http.get<any[]>(`${environment.apiUrl}/api/projects/${this.data.projectNum}/work-items/${this.data.workItem.workItemId}/parts`)
        .subscribe({
          next: (parts) => {
            console.log('✅ Loaded existing parts for edit via API:', parts);
            console.log('Part count:', parts?.length);
            if (parts && parts.length > 0) {
              console.log('First part structure:', parts[0]);
              console.log('First part keys:', Object.keys(parts[0]));
            }
            
            // Store parts in workItem data for use in part-selection-dialog
            if (!this.data.workItem) {
              this.data.workItem = {};
            }
            this.data.workItem.parts = parts;
            
            // Extract Material Category from the first part
            this.extractCategoryFromParts(parts);
            
            this.isLoadingParts = false;
            this.cdr.detectChanges();
            resolve(); // Resolve the promise
          },
          error: (err) => {
            console.error('❌ Error loading existing parts:', err);
            this.isLoadingParts = false;
            this.cdr.detectChanges();
            resolve(); // Still resolve to allow dropdowns to load
          }
        });
    });
  }

  /**
   * Extract Material Category ID from parts array
   * Tries multiple paths to find the category field
   */
  private extractCategoryFromParts(parts: any[]): void {
    if (!parts || parts.length === 0) {
      console.warn('⚠️ No parts to extract category from');
      this.previousCategoryId = '';
      this.materialCategory = '';
      return;
    }

    let categoryId: any = null;
    
    // Try nested masterPart structure
    if (parts[0].masterPart?.catId !== undefined && parts[0].masterPart?.catId !== null) {
      categoryId = parts[0].masterPart.catId;
      console.log('✅ Found category in masterPart.catId:', categoryId);
    } 
    // Try direct catId field
    else if (parts[0].catId !== undefined && parts[0].catId !== null) {
      categoryId = parts[0].catId;
      console.log('✅ Found category in direct catId:', categoryId);
    }
    // Try category field
    else if (parts[0].category !== undefined && parts[0].category !== null) {
      categoryId = parts[0].category;
      console.log('✅ Found category in category field:', categoryId);
    }
    // Try masterPart with category field
    else if (parts[0].masterPart?.category !== undefined && parts[0].masterPart?.category !== null) {
      categoryId = parts[0].masterPart.category;
      console.log('✅ Found category in masterPart.category:', categoryId);
    }
    else {
      console.warn('⚠️ Could not find category in part:', parts[0]);
    }
    
    if (categoryId !== undefined && categoryId !== null) {
      this.previousCategoryId = categoryId;
      console.log('✅✅✅ EXTRACTED CATEGORY:', this.previousCategoryId, 'type:', typeof this.previousCategoryId);
    } else {
      console.warn('⚠️ categoryId is null/undefined');
      this.previousCategoryId = '';
      this.materialCategory = '';
    }
  }

  private loadDropdownsAndPrefill(): void {
    const now = Date.now();
    
    // Check if cache is still valid
    if (WorkItemWizardDialog.cachedOperations && WorkItemWizardDialog.cachedCategories && 
        (now - WorkItemWizardDialog.cacheTimestamp < WorkItemWizardDialog.CACHE_DURATION_MS)) {
      
      console.log('📦 Using cached operations and categories');
      this.materialCategories = WorkItemWizardDialog.cachedCategories;
      this.workItemOperations = WorkItemWizardDialog.cachedOperations;
      console.log('📦 Cache - materialCategories:', this.materialCategories);
      console.log('📦 Cache - previousCategoryId:', this.previousCategoryId);
      this.applyPreFill();
      // Use setTimeout to ensure DOM is updated before change detection
      setTimeout(() => {
        this.cdr.detectChanges();
        console.log('🔄 Change detection forced (cached)');
      }, 0);
      return;
    }
    
    // Use forkJoin to wait for both HTTP calls to complete
    forkJoin({
      categories: this.http.get<any[]>(`${environment.apiUrl}/api/admin/material-categories`),
      operations: this.http.get<any[]>(`${environment.apiUrl}/api/admin/work-operations`)
    }).subscribe({
      next: (result) => {
        // Cache the results for future dialogs
        WorkItemWizardDialog.cachedOperations = result.operations;
        WorkItemWizardDialog.cachedCategories = result.categories;
        WorkItemWizardDialog.cacheTimestamp = now;
        
        this.materialCategories = result.categories;
        this.workItemOperations = result.operations;
        
        console.log('✅ Dropdowns loaded and cached - operations:', this.workItemOperations.length, ', categories:', this.materialCategories.length);
        console.log('✅ Available categories:', this.materialCategories.map((c: any) => ({ catId: c.catId, category: c.category })));
        console.log('✅ previousCategoryId to set:', this.previousCategoryId);
        
        this.applyPreFill();
        
        // Use setTimeout to ensure DOM updates after pre-fill
        setTimeout(() => {
          console.log('🔄 Forcing change detection...');
          console.log('   materialCategory value now:', this.materialCategory);
          console.log('   workItemOperation value now:', this.workItemOperation);
          this.cdr.detectChanges();
          
          // Verify the values were set
          setTimeout(() => {
            console.log('✅ After change detection:');
            console.log('   materialCategory:', this.materialCategory);
            console.log('   workItemOperation:', this.workItemOperation);
          }, 50);
        }, 0);
      },
      error: (err) => {
        console.error('❌ Error loading dropdowns:', err);
        this.materialCategories = [];
        this.workItemOperations = [];
      }
    });
  }

  /**
   * Apply pre-filled values after dropdowns are loaded
   * For edit mode: pre-fill the operation (workOpId) and Material Category (catId from parts)
   */
  private applyPreFill(): void {
    console.log('🔄 applyPreFill() called');
    console.log('  previousWorkOpId:', this.previousWorkOpId);
    console.log('  previousCategoryId:', this.previousCategoryId);
    console.log('  materialCategories count:', this.materialCategories.length);
    
    if (this.previousWorkOpId !== undefined && this.previousWorkOpId !== null && this.previousWorkOpId !== '') {
      // Convert to number if it's a numeric ID
      this.workItemOperation = typeof this.previousWorkOpId === 'string' && !isNaN(Number(this.previousWorkOpId))
        ? Number(this.previousWorkOpId)
        : this.previousWorkOpId;
      console.log('✅ Pre-filled operation:', this.workItemOperation, 'type:', typeof this.workItemOperation);
    }
    
    // Pre-fill Material Category if we extracted it from existing parts
    // Use explicit checks to handle category ID of 0
    if (this.previousCategoryId !== undefined && this.previousCategoryId !== null && this.previousCategoryId !== '') {
      const newValue = typeof this.previousCategoryId === 'string' && !isNaN(Number(this.previousCategoryId))
        ? Number(this.previousCategoryId)
        : this.previousCategoryId;
      
      console.log('🔥 SETTING materialCategory to:', newValue, 'type:', typeof newValue);
      this.materialCategory = newValue;
      
      console.log('✅ Pre-filled material category:', this.materialCategory, 'type:', typeof this.materialCategory);
      console.log('  Available categories:', this.materialCategories.map((c: any) => `${c.catId}(${typeof c.catId}): ${c.category}`));
      
      // Find if the category exists in the dropdown
      const found = this.materialCategories.find((c: any) => Number(c.catId) === Number(newValue));
      if (found) {
        console.log('✅✅ Category found in dropdown:', found);
      } else {
        console.warn('⚠️ Category NOT found in dropdown! Looking for:', newValue);
        this.materialCategory = '';
      }
    } else {
      console.log('⚠️  previousCategoryId not set, skipping pre-fill');
      this.materialCategory = '';
    }
  }

  private captureDialogPosition(): void {
    // Capture this dialog's position for passing to next dialog
    const pane = this.elementRef.nativeElement.closest('.cdk-overlay-pane');
    if (pane) {
      setTimeout(() => {
        const rect = pane.getBoundingClientRect();
        this.dialogPosition = { left: `${rect.left}px`, top: `${rect.top}px` };
      }, 100);
    }
  }

  private getNextDialogPosition(): { left?: string; top?: string } {
    // Use this dialog's captured position to keep all dialogs aligned at the same spot
    if (this.dialogPosition) {
      return this.dialogPosition;
    }
    // Use the position passed from the previous dialog
    if (this.data.dialogPosition) {
      return this.data.dialogPosition;
    }
    // Fallback to calculating current position if not provided
    const pane = this.elementRef.nativeElement.closest('.cdk-overlay-pane');
    if (pane) {
      const rect = pane.getBoundingClientRect();
      return { left: `${rect.left}px`, top: `${rect.top}px` };
    }
    return {};
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onBack(): void {
    this.dialogRef.close({ action: 'back' });
  }

  /** Compare function for mat-select to properly match numeric values */
  compareValues(a: any, b: any): boolean {
    // Handle empty values
    if (a === '' || a === null) return b === '' || b === null;
    if (b === '' || b === null) return a === '' || a === null;
    
    // Compare as numbers if both are numeric
    if (typeof a === 'number' || typeof b === 'number') {
      return Number(a) === Number(b);
    }
    
    return a === b;
  }

  onNext(): void {
    // Log current values for debugging
    console.log('onNext - workItemOperation:', this.workItemOperation, 'type:', typeof this.workItemOperation);
    console.log('onNext - materialCategory:', this.materialCategory, 'type:', typeof this.materialCategory);
    
    if (this.selectParts === 'lineup') {
      this.onSelectByLineup();
    } else {
      this.onSelectPartsByQuantity();
    }
  }

  private onSelectByLineup(): void {
    this.lastDialog = 'by-lineup';
    // Use previously selected lineups if available, otherwise use fresh data
    let lineupBays = this.selectedLineups && this.selectedLineups.length > 0
      ? this.selectedLineups
      : [
          { lineup: '', startBay: '', endBay: '', qty: 0, partDescription: '' },
          { lineup: '', startBay: '', endBay: '', qty: 0, partDescription: '' },
          { lineup: '', startBay: '', endBay: '', qty: 0, partDescription: '' }
        ];

    if (this.data.isEditMode && this.data.workItem && this.data.workItem.lineups && this.data.workItem.lineups.length > 0 && (!this.selectedLineups || this.selectedLineups.length === 0)) {
      lineupBays = this.data.workItem.lineups.map((lineup: any) => ({
        ...lineup,
        qty: 0,
        partDescription: ''
      }));
    }

    // Hide current dialog before opening next
    this.hideCurrentDialog();

    const ref = this.dialog.open(ByLineupDialog, {
      data: { projectNum: this.data.projectNum, lineupBays, dialogPosition: this.dialogPosition },
      disableClose: true,
      autoFocus: false,
      position: this.getNextDialogPosition(),
      backdropClass: 'stacked-wizard-backdrop'
    });
    ref.afterClosed().subscribe(result => {
      if (result?.action === 'next') {
        this.selectedLineups = result.lineupData || [];
        this.onSelectAssociatedNodes();
      } else if (result?.action === 'back') {
        // Show current dialog when going back
        this.showCurrentDialog();
      } else if (result?.action === 'cancel') {
        this.dialogRef.close({ action: 'cancel' });
      }
    });
  }

  private onSelectPartsByQuantity(): void {
    this.lastDialog = 'part-selection';
    // Use previously selected parts if available, otherwise use fresh data
    let parts = this.selectedParts && this.selectedParts.length > 0 
      ? this.selectedParts 
      : [{ qty: 1, partDescription: '', partId: undefined }];
    
    if (this.data.isEditMode && this.data.workItem && this.data.workItem.parts && this.data.workItem.parts.length > 0 && (!this.selectedParts || this.selectedParts.length === 0)) {
      console.log('onSelectPartsByQuantity - Edit mode, transforming parts:', this.data.workItem.parts);
      // Transform ProjectPart payload to dialog row format.
      // Supports both flat DTO shape (partDesc/partNum/qty) and nested shape (masterPart.*).
      parts = this.data.workItem.parts.map((projPart: any) => {
        const qtyValue = Number(projPart.qty ?? 0);
        const transformedPart = {
          qty: Number.isFinite(qtyValue) ? qtyValue : 0,
          partDescription: projPart.partDesc || projPart.masterPart?.partDesc || '',
          partId: projPart.partId,
          partNum: projPart.partNum || projPart.masterPart?.partNum || ''
        };
        console.log('✅ Transformed part:', transformedPart);
        return transformedPart;
      });
      console.log('onSelectPartsByQuantity - Transformed parts:', parts);
    }

    // Hide current dialog before opening next
    this.hideCurrentDialog();

    const ref = this.dialog.open(PartSelectionDialog, {
      data: { projectNum: this.data.projectNum, parts, materialCategory: this.materialCategory, dialogPosition: this.dialogPosition },
      disableClose: true,
      autoFocus: false,
      position: this.getNextDialogPosition(),
      backdropClass: 'stacked-wizard-backdrop'
    });
    ref.afterClosed().subscribe(result => {
      if (result?.action === 'back') {
        // Show current dialog when going back
        this.showCurrentDialog();
      } else if (result?.action === 'next') {
        this.selectedParts = result.selectedParts;
        // Open next dialog after a tick to ensure previous is fully closed
        setTimeout(() => this.onSelectAssociatedNodes(), 0);
      } else if (result?.action === 'cancel') {
        this.dialogRef.close({ action: 'cancel' });
      }
    });
  }

  private onSelectAssociatedNodes(): void {
    // Hide current dialog before opening next
    this.hideCurrentDialog();

    // Use previously entered notes if available, otherwise check edit mode
    let nodesText = this.nodesText || '';
    if (!nodesText && this.data.isEditMode && this.data.workItem) {
      // workItemText stores the associated notes
      nodesText = this.data.workItem.workItemText || '';
      console.log('onSelectAssociatedNodes - Edit mode, nodesText:', nodesText);
    }

    const ref = this.dialog.open(AssociatedNodesDialog, {
      data: { projectNum: this.data.projectNum, dialogPosition: this.dialogPosition, nodesText },
      disableClose: true,
      autoFocus: false,
      position: this.getNextDialogPosition(),
      backdropClass: 'stacked-wizard-backdrop'
    });
    ref.afterClosed().subscribe(result => {
      if (result?.action === 'finish') {
        // Store the notes text from the dialog
        this.nodesText = result?.nodesText || '';
        // Show the completion dialog before the addition confirmation
        this.showCompletion();
      } else if (result?.action === 'back') {
        // Go back to the correct previous dialog
        if (this.lastDialog === 'part-selection') {
          this.onSelectPartsByQuantity();
        } else {
          this.onSelectByLineup();
        }
      } else if (result?.action === 'cancel') {
        this.dialogRef.close({ action: 'cancel' });
      }
    });
  }

  private showCompletion(): void {
    // Hide current dialog before opening next
    this.hideCurrentDialog();

    const ref = this.dialog.open(WorkItemCompletionDialog, {
      data: { projectNum: this.data.projectNum, dialogPosition: this.dialogPosition },
      disableClose: true,
      autoFocus: false,
      position: this.getNextDialogPosition(),
      backdropClass: 'stacked-wizard-backdrop'
    });
    ref.afterClosed().subscribe(result => {
      if (result?.action === 'finish') {
        // Always go directly to Work Item Addition after completion.
        this.showAdditionConfirmation();
      } else if (result?.action === 'back') {
        // Go back to AssociatedNodesDialog
        this.onSelectAssociatedNodes();
      } else if (result?.action === 'cancel') {
        this.dialogRef.close({ action: 'cancel' });
      }
    });
  }

  private showAdditionConfirmation(): void {
    // Hide current dialog before opening next
    this.hideCurrentDialog();

    const ref = this.dialog.open(WorkItemAdditionDialog, {
      data: { message: 'Work Item and its associated parts has been added.', dialogPosition: this.dialogPosition },
      disableClose: true,
      autoFocus: false,
      position: this.getNextDialogPosition(),
      backdropClass: 'stacked-wizard-backdrop'
    });
    ref.afterClosed().subscribe(result => {
      if (result?.action === 'cancel') {
        this.dialogRef.close({ action: 'cancel' });
      } else {
        this.dialogRef.close({ action: 'complete', workItemOperation: this.workItemOperation, materialCategory: this.materialCategory, selectParts: this.selectParts, itemChoice: this.itemChoice, nodesText: this.nodesText });
      }
    });
  }

  /** Hide current dialog container for smooth transitions */
  private hideCurrentDialog(): void {
    const pane = this.elementRef.nativeElement.closest('.cdk-overlay-pane');
    if (pane) {
      pane.style.display = 'none';
    }
  }

  /** Show current dialog container when returning from next dialog */
  private showCurrentDialog(): void {
    const pane = this.elementRef.nativeElement.closest('.cdk-overlay-pane');
    if (pane) {
      pane.style.display = '';
    }
  }
}
