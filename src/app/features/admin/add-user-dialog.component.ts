import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSnackBarModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">Add New User</h2>
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="addUserForm">
        <!-- CUID Field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>CUID (Corporate ID)</mat-label>
          <input 
            matInput 
            formControlName="cuid"
            placeholder="e.g., adXXXXX"
            required>
          <mat-error *ngIf="addUserForm.get('cuid')?.hasError('required')">
            CUID is required
          </mat-error>
          <mat-error *ngIf="addUserForm.get('cuid')?.hasError('minlength')">
            CUID must be at least 3 characters
          </mat-error>
        </mat-form-field>

        <!-- Username Field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username</mat-label>
          <input 
            matInput 
            formControlName="username"
            placeholder="e.g., john.doe"
            required>
          <mat-error *ngIf="addUserForm.get('username')?.hasError('required')">
            Username is required
          </mat-error>
          <mat-error *ngIf="addUserForm.get('username')?.hasError('minlength')">
            Username must be at least 3 characters
          </mat-error>
        </mat-form-field>

        <!-- Roles Section -->
        <div class="roles-section">
          <h3 class="roles-title">User Roles</h3>
          
          <div class="roles-grid">
            <div class="role-item">
              <mat-checkbox 
                formControlName="userAccess"
                class="role-checkbox">
                User Access
              </mat-checkbox>
              <p class="role-description">Basic user access to the system</p>
            </div>

            <div class="role-item">
              <mat-checkbox 
                formControlName="dataAdmin"
                class="role-checkbox">
                Data Admin
              </mat-checkbox>
              <p class="role-description">Administration of data and master records</p>
            </div>

            <div class="role-item">
              <mat-checkbox 
                formControlName="projAdmin"
                class="role-checkbox">
                Project Admin
              </mat-checkbox>
              <p class="role-description">Administration of projects</p>
            </div>

            <div class="role-item">
              <mat-checkbox 
                formControlName="costAdmin"
                class="role-checkbox">
                Cost Admin
              </mat-checkbox>
              <p class="role-description">Cost management and tracking</p>
            </div>

            <div class="role-item">
              <mat-checkbox 
                formControlName="userAdmin"
                class="role-checkbox">
                User Admin
              </mat-checkbox>
              <p class="role-description">User account administration</p>
            </div>
          </div>

          <mat-error class="at-least-one" *ngIf="!hasAtLeastOneRole()">
            At least one role must be selected
          </mat-error>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button 
        mat-stroked-button 
        (click)="onCancel()">
        Cancel
      </button>
      <button 
        mat-raised-button 
        color="primary"
        [disabled]="!isFormValid()"
        (click)="onSave()">
        Add User
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    /* Host container for flex layout */
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* Dialog Title - Brown color from theme */
    .dialog-title {
      margin: 0 0 0.3rem 0;
      color: #8a4d00;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.3px;
      padding-left: 33px;
      padding-top: 0;
      padding-bottom: 0;
      padding-right: 0;
    }

    /* Dialog Content Container */
    .dialog-content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      padding: 0;
      margin: 10px;
      overflow: hidden;
      background: white;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    /* Override Material Dialog Container for wider dialogs */
    ::ng-deep .mat-mdc-dialog-container {
      width: 95vw !important;
      max-width: 1000px !important;
      height: 90vh !important;
    }

    ::ng-deep .mat-mdc-dialog-surface {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }

    /* Material Form Field - Global theme styling (matching user-access) */
    ::ng-deep .dialog-content .mat-mdc-form-field {
      width: 100%;
      height: 50px !important;
      margin-bottom: 6px;
    }

    ::ng-deep .dialog-content .mat-mdc-form-field .mdc-text-field {
      height: 50px !important;
      background-color: #f5f5f5 !important;
    }

    ::ng-deep .dialog-content .mdc-text-field__input {
      color: #222 !important;
      font-size: 13px !important;
    }

    ::ng-deep .dialog-content .mat-mdc-form-field-label {
      color: #ff9800 !important;
      font-size: 12px !important;
    }

    /* Form field outlines - Orange border from theme */
    ::ng-deep .dialog-content .mat-mdc-form-field .mdc-notched-outline__leading,
    ::ng-deep .dialog-content .mat-mdc-form-field .mdc-notched-outline__notch,
    ::ng-deep .dialog-content .mat-mdc-form-field .mdc-notched-outline__trailing {
      border-color: #ff9800 !important;
    }

    /* Form field focused state */
    ::ng-deep .dialog-content .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .dialog-content .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .dialog-content .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #fb8500 !important;
      border-width: 2px !important;
    }

    /* Form field errors */
    ::ng-deep .dialog-content .mat-mdc-form-field-error {
      font-size: 12px !important;
      color: #d32f2f !important;
    }

    /* Roles Section */
    .roles-section {
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 16px;
      background-color: #fafafa;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .roles-title {
      margin: 0 0 12px 0;
      font-size: 11px;
      font-weight: 600;
      color: #424242;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* Two-column grid for roles */
    .roles-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px 20px;
    }

    .role-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 0;
    }

    .role-checkbox {
      font-size: 13px;
      font-weight: 500;
      color: #333;
    }

    /* Material Checkbox - Orange accent */
    ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox {
      display: flex;
    }

    ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox .mdc-checkbox {
      margin-right: 12px;
    }

    ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox .mat-mdc-checkbox-label {
      color: #333;
      font-size: 13px;
    }

    /* Orange checkbox styling */
    ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox.mat-checked .mdc-checkbox__checkmark {
      color: #ff9800 !important;
    }

    ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox.mat-checked .mdc-checkbox__background {
      background-color: #ff9800 !important;
      border-color: #ff9800 !important;
    }

    ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background {
      background-color: #ff9800 !important;
      border-color: #ff9800 !important;
    }

    /* Unchecked checkbox border - Red */
    ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox .mdc-checkbox__background {
      border-color: #b00020 !important;
    }

    /* Red ripple/focus color for checkboxes */
    ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox {
      --mdc-checkbox-unselected-hover-state-layer-color: rgba(176, 0, 32, 0.08) !important;
      --mdc-checkbox-selected-focus-state-layer-color: rgba(176, 0, 32, 0.12) !important;
      --mdc-checkbox-unselected-focus-state-layer-color: rgba(176, 0, 32, 0.12) !important;
      --mdc-theme-primary: #b00020 !important;
    }

    ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox .mdc-checkbox__ripple {
      background-color: rgba(176, 0, 32, 0.08) !important;
    }

    .role-description {
      margin: 0;
      font-size: 12px;
      color: #666;
      margin-left: 32px;
    }

    .at-least-one {
      display: block;
      color: #d32f2f;
      font-size: 12px;
      margin-top: 8px;
      font-weight: 500;
    }

    mat-dialog-content {
      padding: 0;
      margin: 0;
    }

    /* Dialog Actions - Bottom button bar */
    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      gap: 8px;
      flex-shrink: 0;
      margin-top: auto;
    }

    button {
      min-width: 110px;
      font-size: 13px;
      font-weight: 500;
      height: 40px;
    }

    /* Primary button - Orange (#ff9800) */
    mat-dialog-actions button[color="primary"] {
      background: #ff9800 !important;
      color: white !important;
    }

    mat-dialog-actions button[color="primary"]:hover:not(:disabled) {
      background: #fb8500 !important;
    }

    mat-dialog-actions button[color="primary"]:disabled {
      opacity: 0.5 !important;
      cursor: not-allowed !important;
    }

    /* Cancel button - Stroked variant */
    mat-dialog-actions button[mat-stroked-button] {
      color: #666 !important;
      border-color: #ddd !important;
    }

    mat-dialog-actions button[mat-stroked-button]:hover {
      background: #f5f5f5 !important;
    }

    /* ============================================================
       DARK MODE SUPPORT
       ============================================================ */

    :host-context([data-theme="dark"]) .dialog-title {
      color: #ffb74d;
      background: #1a1a1a;
    }

    :host-context([data-theme="dark"]) .dialog-content {
      background: #1a1a1a;
      color: #e0e0e0;
    }

    :host-context([data-theme="dark"]) form {
      color: #e0e0e0;
    }

    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .mdc-text-field {
      background-color: #2a2a2a !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .mdc-text-field__input {
      color: #e0e0e0 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .mat-mdc-form-field-label {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .mat-mdc-form-field .mdc-notched-outline__leading,
    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .mat-mdc-form-field .mdc-notched-outline__notch,
    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .mat-mdc-form-field .mdc-notched-outline__trailing {
      border-color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #ffa726 !important;
      border-width: 2px !important;
    }

    :host-context([data-theme="dark"]) .roles-section {
      border-color: #424242;
      background-color: #424242;
    }

    :host-context([data-theme="dark"]) .roles-title {
      color: #e0e0e0;
    }

    :host-context([data-theme="dark"]) .role-checkbox {
      color: #e0e0e0;
    }

    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox .mat-mdc-checkbox-label {
      color: #e0e0e0 !important;
    }

    /* Orange checkbox styling - Dark Mode */
    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox.mat-checked .mdc-checkbox__checkmark {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox.mat-checked .mdc-checkbox__background {
      background-color: #ffb74d !important;
      border-color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background {
      background-color: #ffb74d !important;
      border-color: #ffb74d !important;
    }

    /* Unchecked checkbox border - Red (dark mode) */
    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox .mdc-checkbox__background {
      border-color: #ff6b6b !important;
    }

    /* Red ripple/focus color for checkboxes (dark mode) */
    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox {
      --mdc-checkbox-unselected-hover-state-layer-color: rgba(255, 107, 107, 0.08) !important;
      --mdc-checkbox-selected-focus-state-layer-color: rgba(255, 107, 107, 0.12) !important;
      --mdc-checkbox-unselected-focus-state-layer-color: rgba(255, 107, 107, 0.12) !important;
      --mdc-theme-primary: #ff6b6b !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .dialog-content .role-checkbox.mat-mdc-checkbox .mdc-checkbox__ripple {
      background-color: rgba(255, 107, 107, 0.08) !important;
    }

    :host-context([data-theme="dark"]) .role-description {
      color: #b0b0b0;
    }

    :host-context([data-theme="dark"]) .at-least-one {
      color: #ff6b6b;
    }

    :host-context([data-theme="dark"]) .dialog-actions {
      border-top-color: #424242;
    }

    :host-context([data-theme="dark"]) mat-dialog-actions button[color="primary"] {
      background: #ffb74d !important;
      color: #222 !important;
    }

    :host-context([data-theme="dark"]) mat-dialog-actions button[color="primary"]:hover:not(:disabled) {
      background: #ffa726 !important;
    }

    :host-context([data-theme="dark"]) mat-dialog-actions button[mat-stroked-button] {
      color: #aaa !important;
      border-color: #424242 !important;
    }

    :host-context([data-theme="dark"]) mat-dialog-actions button[mat-stroked-button]:hover {
      background: #2a2a2a !important;
    }

    :host-context([data-theme="dark"]) mat-dialog-actions {
      border-top-color: #424242;
      background: #1a1a1a;
    }
  `]
})
export class AddUserDialogComponent implements OnInit {
  addUserForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.addUserForm = this.fb.group({
      cuid: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      userAccess: [false],
      dataAdmin: [false],
      projAdmin: [false],
      costAdmin: [false],
      userAdmin: [false]
    });
  }

  hasAtLeastOneRole(): boolean {
    return (
      this.addUserForm.get('userAccess')?.value ||
      this.addUserForm.get('dataAdmin')?.value ||
      this.addUserForm.get('projAdmin')?.value ||
      this.addUserForm.get('costAdmin')?.value ||
      this.addUserForm.get('userAdmin')?.value
    );
  }

  isFormValid(): boolean {
    return this.addUserForm.valid && this.hasAtLeastOneRole();
  }

  onSave(): void {
    if (!this.isFormValid()) {
      if (!this.hasAtLeastOneRole()) {
        this.snackBar.open('At least one role must be selected', 'Close', { duration: 3000 });
      }
      return;
    }

    const formValues = this.addUserForm.value;
    const newUser = {
      cuid: formValues.cuid,
      userName: formValues.username,
      ctlId: formValues.cuid,
      userAccess: formValues.userAccess,
      dataAdmin: formValues.dataAdmin,
      projAdmin: formValues.projAdmin,
      costAdmin: formValues.costAdmin,
      userAdmin: formValues.userAdmin
    };

    this.dialogRef.close(newUser);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
