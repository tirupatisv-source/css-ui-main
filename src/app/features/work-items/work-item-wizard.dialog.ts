import { Component, Inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
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
    CommonModule, FormsModule,
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
            <mat-select class="wizard-select" [(ngModel)]="workItemOperation" disableOptionCentering>
              <mat-option value="">-- Select --</mat-option>
              <mat-option value="install">Add</mat-option>
              <mat-option value="modify">Info only</mat-option>
              <mat-option value="relocate">Modify (bom)</mat-option>
              <mat-option value="remove">Remove</mat-option>
            </mat-select>
          </div>
          <!-- Material Category -->
          <div class="field-block" style="margin-top: 0; margin-left: 32px; margin-bottom: -5px;">
            <label class="field-label">Material Category</label>
            <mat-select class="wizard-select" [(ngModel)]="materialCategory" disableOptionCentering panelClass="material-category-panel-class">
              <mat-option value="">-- Select --</mat-option>
              <mat-option value="cable">Cable</mat-option>
              <mat-option value="equipment">Equipment</mat-option>
              <mat-option value="hardware">Hardware</mat-option>
              <mat-option value="power">Power</mat-option>
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
        <button class="wizard-btn next-btn" (click)="onNext()">Next</button>
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
export class WorkItemWizardDialog {
  workItemOperation = '';
  materialCategory = '';
  selectParts = 'lineup';
  itemChoice = 'materialCategory';
  selectedParts: any[] = [];
  selectedLineups: any[] = [];
  nodesText = '';
  lastDialog: 'by-lineup' | 'part-selection' | null = null;
  dialogPosition: any;

  constructor(
    public dialogRef: MatDialogRef<WorkItemWizardDialog>,
    @Inject(MAT_DIALOG_DATA) public data: WorkItemWizardData,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) {
    // Pre-fill fields in edit mode
    if (data.isEditMode && data.workItem) {
      console.log('WorkItemWizardDialog - Edit mode, workItem:', data.workItem);
      // Map workOpId to value for select
      const opIdToValue: Record<number, string> = {
        1: 'install',
        2: 'modify',
        3: 'relocate',
        4: 'remove'
      };
      this.workItemOperation = opIdToValue[data.workItem.workOpId] || '';
      this.materialCategory = data.workItem.category || '';
      console.log('WorkItemWizardDialog - Initialized: operation =', this.workItemOperation, ', category =', this.materialCategory);
    }
  }

  ngOnInit(): void {
    this.captureDialogPosition();
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

  onNext(): void {
    // Removed mandatory check for Work Item Operation and Material Category

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
      : [{ qty: 1, partDescription: '' }];
    
    if (this.data.isEditMode && this.data.workItem && this.data.workItem.parts && this.data.workItem.parts.length > 0 && (!this.selectedParts || this.selectedParts.length === 0)) {
      console.log('onSelectPartsByQuantity - Edit mode, transforming parts:', this.data.workItem.parts);
      // Transform ProjectPart array to Part format with partDescription from masterPart
      parts = this.data.workItem.parts.map((projPart: any) => ({
        qty: projPart.qty || 1,
        partDescription: projPart.masterPart?.partDesc || ''
      }));
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
      console.log('PartSelectionDialog afterClosed - result:', result);
      console.log('Result action:', result?.action);
      if (result?.action === 'back') {
        // Show current dialog when going back
        this.showCurrentDialog();
      } else if (result?.action === 'next') {
        console.log('PartSelectionDialog result - action is next:', result);
        console.log('selectedParts from dialog:', result.selectedParts);
        this.selectedParts = result.selectedParts;
        console.log('selectedParts set to:', this.selectedParts);
        console.log('this.selectedParts now:', this.selectedParts);
        // Open next dialog after a tick to ensure previous is fully closed
        setTimeout(() => this.onSelectAssociatedNodes(), 0);
      } else if (result?.action === 'cancel') {
        this.dialogRef.close({ action: 'cancel' });
      } else {
        console.log('PartSelectionDialog - unexpected action or no result');
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
        this.showAdditionConfirmation();
      } else if (result?.action === 'back') {
        // Go back to AssociatedNodesDialog
        this.onSelectAssociatedNodes();
      } else if (result?.action === 'cancel') {
        this.dialogRef.close({ action: 'cancel' });
      } else if (result?.selectedParts || result?.selectedLineups) {
        // Defensive: if any dialog closes with selectedParts, pass them through
        this.dialogRef.close({
          action: result?.action,
          workItemOperation: this.workItemOperation,
          materialCategory: this.materialCategory,
          selectParts: this.selectParts,
          itemChoice: this.itemChoice,
          nodesText: this.nodesText,
          selectedParts: this.selectedParts,
          selectedLineups: this.selectedLineups
        });
      }
    });
  }

  private showAdditionConfirmation(): void {
    // Hide current dialog before opening next
    this.hideCurrentDialog();

    console.log('showAdditionConfirmation - this.selectedParts:', this.selectedParts);
    console.log('showAdditionConfirmation - selectedLineups:', this.selectedLineups);

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
        console.log('About to close with - selectedParts:', this.selectedParts);
        this.dialogRef.close({ 
          action: 'complete', 
          workItemOperation: this.workItemOperation, 
          materialCategory: this.materialCategory, 
          selectParts: this.selectParts, 
          itemChoice: this.itemChoice, 
          nodesText: this.nodesText,
          selectedParts: this.selectedParts,
          selectedLineups: this.selectedLineups
        });
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
