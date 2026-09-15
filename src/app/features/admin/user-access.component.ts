import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '@core/services/admin.service';
import { UserSecurity } from '@core/models/models';
import { AddUserDialogComponent } from './add-user-dialog.component';

@Component({
  selector: 'app-admin-user-access',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="admin-container">
      <div *ngIf="isLoading" class="loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading users...</p>
      </div>

      <div *ngIf="!isLoading" class="access-form-section">
        <div class="form-card">
          <!-- Scrollable Content -->
          <div class="scrollable-content">
            <!-- Search Section -->
            <div class="search-section">
              <div class="search-controls">
                <mat-form-field appearance="outline" class="search-type-field">
                  <mat-label>Search By</mat-label>
                  <mat-select [formControl]="searchTypeControl">
                    <mat-option value="cuid">CUID</mat-option>
                    <mat-option value="username">Username</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="search-input-field">
                  <mat-label>Enter {{ searchTypeControl.value === 'username' ? 'Username' : 'CUID' }}</mat-label>
                  <input matInput [formControl]="searchValueControl" 
                    (keyup.enter)="performSearch()">
                </mat-form-field>

                <button mat-raised-button color="primary" (click)="performSearch()" class="search-btn">
                  <mat-icon>search</mat-icon>
                  <span>Search</span>
                </button>

                <button *ngIf="searchPerformed" mat-button (click)="clearSearch()" class="clear-btn">
                  Clear
                </button>
              </div>

              <div *ngIf="searchPerformed && searchResults.length === 0" class="no-results">
                No users found matching your search
              </div>
            </div>

            <!-- Initial Message (when no search performed) -->
            <div *ngIf="!searchPerformed" class="no-data">
              <mat-icon>search</mat-icon>
              <p>Use the search box above to find and manage users</p>
            </div>

            <!-- User Details Section (After Search) -->
            <div *ngIf="searchPerformed && searchResults.length > 0" class="user-details-section">
              <!-- User Selection Dropdown (if multiple results) -->
              <div *ngIf="searchResults.length > 1" class="user-selection-dropdown">
                <mat-form-field appearance="outline" class="user-select-field">
                  <mat-label>Select User</mat-label>
                  <mat-select [(ngModel)]="selectedUserIndex" (selectionChange)="onUserSelected($event)">
                    <mat-option *ngFor="let user of searchResults; let i = index" [value]="i">
                      {{ user.userName }} ({{ user.ctlId }})
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Username and CUID Fields -->
              <div class="user-info-fields">
                <mat-form-field appearance="outline" class="info-field">
                  <mat-label>Username</mat-label>
                  <input matInput [value]="selectedUser?.userName" readonly>
                </mat-form-field>

                <mat-form-field appearance="outline" class="info-field">
                  <mat-label>CUID</mat-label>
                  <input matInput [value]="selectedUser?.ctlId" readonly>
                </mat-form-field>
              </div>

              <!-- Role Checkboxes -->
              <div class="roles-section">
                <h3 class="roles-title">User Roles</h3>
                <div class="roles-container">
                  <div class="role-checkbox">
                    <mat-checkbox 
                      [formControl]="userAccessControl"
                      [disabled]="!isEditMode"
                      class="role-cb">
                      User Access
                    </mat-checkbox>
                  </div>
                  <div class="role-checkbox">
                    <mat-checkbox 
                      [formControl]="dataAdminControl"
                      [disabled]="!isEditMode"
                      class="role-cb">
                      Data Admin
                    </mat-checkbox>
                  </div>
                  <div class="role-checkbox">
                    <mat-checkbox 
                      [formControl]="projAdminControl"
                      [disabled]="!isEditMode"
                      class="role-cb">
                      Project Admin
                    </mat-checkbox>
                  </div>
                  <div class="role-checkbox">
                    <mat-checkbox 
                      [formControl]="costAdminControl"
                      [disabled]="!isEditMode"
                      class="role-cb">
                      Cost Admin
                    </mat-checkbox>
                  </div>
                  <div class="role-checkbox">
                    <mat-checkbox 
                      [formControl]="userAdminControl"
                      [disabled]="!isEditMode"
                      class="role-cb">
                      User Admin
                    </mat-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons (Fixed Footer) -->
          <div class="button-group">
            <!-- Add New User Button (Hidden during edit) -->
            <button 
              *ngIf="!isEditMode"
              mat-raised-button 
              color="primary"
              (click)="addNewUser()"
              class="action-btn add-btn">
              <mat-icon>person_add</mat-icon>
              <span>Add User</span>
            </button>
            <!-- Edit/Delete Buttons (View Mode) -->
            <button 
              *ngIf="searchPerformed && searchResults.length > 0 && !isEditMode"
              mat-raised-button 
              color="primary"
              (click)="enableEdit()"
              class="action-btn edit-btn">
              <mat-icon>edit</mat-icon>
              <span>Edit</span>
            </button>
            <button 
              *ngIf="searchPerformed && searchResults.length > 0 && !isEditMode"
              mat-button 
              (click)="deleteUser()"
              class="action-btn delete-btn">
              <mat-icon>delete</mat-icon>
              <span>Delete</span>
            </button>

            <!-- Save/Cancel Buttons (Edit Mode) -->
            <button 
              *ngIf="isEditMode"
              mat-raised-button 
              color="primary"
              (click)="saveChanges()"
              class="action-btn save-btn">
              <mat-icon>save</mat-icon>
              <span>Save</span>
            </button>
            <button 
              *ngIf="isEditMode"
              mat-button 
              (click)="cancelEdit()"
              class="action-btn cancel-btn">
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
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

    .access-form-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0;
      min-height: 0;
      height: 100%;
    }

    .form-card {
      background: transparent;
      border-radius: 0;
      padding: 0;
      box-shadow: none;
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }

    .scrollable-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }

    .form-group {
      padding: 18px;
    }

    .search-section {
      padding: 18px;
      border-bottom: 1px solid #e0e0e0;
    }

    .search-controls {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: nowrap;
      width: 100%;
    }

    .search-type-field {
      flex: 0 0 150px;
      min-width: 150px;
    }

    ::ng-deep .search-type-field.mat-mdc-form-field {
      height: 50px !important;
    }

    .search-input-field {
      flex: 1;
      min-width: 200px;
    }

    ::ng-deep .search-input-field.mat-mdc-form-field {
      height: 50px !important;
    }

    .search-btn {
      background: #ff9800 !important;
      color: white !important;
      font-weight: 500;
      flex-shrink: 0;
    }

    .search-btn:hover {
      background: #fb8500 !important;
    }

    .clear-btn {
      color: #666 !important;
      flex-shrink: 0;
    }

    .search-results {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .result-row {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 4px;
      border-left: 3px solid #ff9800;
    }

    .result-username {
      flex: 1;
      font-weight: 500;
      color: #222;
      font-size: 13px;
    }

    .result-cuid {
      font-family: monospace;
      font-weight: 500;
      color: #ff9800;
      font-size: 12px;
      padding: 4px 8px;
      background: white;
      border-radius: 2px;
      border: 1px solid #ff9800;
    }

    .no-results {
      margin-top: 12px;
      padding: 12px;
      background: #fff3e0;
      border-left: 3px solid #ff9800;
      color: #e65100;
      font-size: 12px;
      border-radius: 2px;
    }

    .user-details-section {
      padding: 18px;
    }

    .user-selection-dropdown {
      margin-bottom: 18px;
    }

    .user-select-field {
      width: 100%;
    }

    ::ng-deep .user-select-field.mat-mdc-form-field {
      height: 50px !important;
    }

    ::ng-deep .user-select-field.mat-mdc-form-field .mdc-text-field {
      height: 50px !important;
      background-color: #f5f5f5 !important;
    }

    .user-info-fields {
      display: flex;
      gap: 14px;
      margin-bottom: 18px;
      flex-wrap: nowrap;
      width: 100%;
    }

    .info-field {
      flex: 1;
      min-width: 200px;
    }

    ::ng-deep .info-field.mat-mdc-form-field {
      height: 50px !important;
    }

    ::ng-deep .info-field.mat-mdc-form-field .mdc-text-field {
      height: 50px !important;
    }

    ::ng-deep .info-field.mat-mdc-form-field .mdc-text-field__input {
      background-color: #f5f5f5 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .info-field.mat-mdc-form-field .mdc-text-field__input {
      background-color: #2a2a2a !important;
    }

    .user-select-field {
      width: 100%;
      max-width: 400px;
    }

    .cuid-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f5f5f5;
      border-radius: 4px;
      white-space: nowrap;
    }

    .cuid-label {
      font-weight: 600;
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .cuid-value {
      font-family: monospace;
      font-size: 13px;
      font-weight: 500;
      color: #222;
    }

    .roles-section {
      padding: 0 18px 18px 18px;
    }

    .roles-title {
      margin: 0 0 16px 0;
      font-size: 11px;
      font-weight: 600;
      color: #424242;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .roles-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .role-checkbox {
      display: flex;
      align-items: center;
    }

    .role-cb {
      font-size: 13px;
      font-weight: 500;
    }

    ::ng-deep .role-cb.mat-mdc-checkbox {
      display: flex;
    }

    ::ng-deep .role-cb.mat-mdc-checkbox .mdc-checkbox {
      margin-right: 12px;
    }

    ::ng-deep .role-cb.mat-mdc-checkbox.mat-disabled {
      opacity: 0.5;
      pointer-events: none !important;
      cursor: not-allowed !important;
    }

    ::ng-deep .role-cb.mat-mdc-checkbox.mat-disabled .mdc-checkbox {
      opacity: 0.6;
      pointer-events: none !important;
    }

    ::ng-deep .role-cb.mat-mdc-checkbox.mat-disabled .mat-mdc-checkbox-label {
      cursor: not-allowed !important;
      opacity: 0.6;
      pointer-events: none !important;
    }

    ::ng-deep .role-cb.mat-mdc-checkbox.mat-disabled .mdc-checkbox__native-control {
      cursor: not-allowed !important;
      pointer-events: none !important;
    }

    ::ng-deep .role-cb.mat-mdc-checkbox .mat-mdc-checkbox-label {
      color: #333;
      font-size: 13px;
    }

    /* Orange checkbox styling */
    ::ng-deep .role-cb.mat-mdc-checkbox.mat-checked .mdc-checkbox__checkmark {
      color: #ff9800 !important;
    }

    ::ng-deep .role-cb.mat-mdc-checkbox.mat-checked .mdc-checkbox__background {
      background-color: #ff9800 !important;
      border-color: #ff9800 !important;
    }

    ::ng-deep .role-cb.mat-mdc-checkbox .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background {
      background-color: #ff9800 !important;
      border-color: #ff9800 !important;
    }

    /* Unchecked checkbox border - Red */
    ::ng-deep .role-cb.mat-mdc-checkbox .mdc-checkbox__background {
      border-color: #b00020 !important;
    }

    /* Red ripple/focus color for checkboxes */
    ::ng-deep .role-cb.mat-mdc-checkbox {
      --mdc-checkbox-unselected-hover-state-layer-color: rgba(176, 0, 32, 0.08) !important;
      --mdc-checkbox-selected-focus-state-layer-color: rgba(176, 0, 32, 0.12) !important;
      --mdc-checkbox-unselected-focus-state-layer-color: rgba(176, 0, 32, 0.12) !important;
      --mdc-theme-primary: #b00020 !important;
    }

    ::ng-deep .role-cb.mat-mdc-checkbox .mdc-checkbox__ripple {
      background-color: rgba(176, 0, 32, 0.08) !important;
    }

    .button-group {
      display: flex;
      gap: 12px;
      padding: 18px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      border-top: 1px solid #e0e0e0;
      background: white;
      flex-shrink: 0;
      min-height: auto;
      position: sticky;
      bottom: 0;
      z-index: 100;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      min-width: 120px;
    }

    .action-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .edit-btn, .save-btn, .add-btn {
      background: #ff9800 !important;
      color: white !important;
    }

    .edit-btn:hover, .save-btn:hover, .add-btn:hover {
      background: #fb8500 !important;
    }

    .cancel-btn {
      color: #666 !important;
    }

    .delete-btn {
      color: #d32f2f !important;
    }

    .no-data {
      text-align: center;
      padding: 60px 40px;
      color: #999;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.5;
      margin-bottom: 12px;
    }

    /* Dark Mode */
    :host-context([data-theme="dark"]) .form-card {
      background: transparent !important;
    }

    :host-context([data-theme="dark"]) .scrollable-content {
      background: transparent !important;
    }

    :host-context([data-theme="dark"]) .no-data {
      color: #777 !important;
    }

    :host-context([data-theme="dark"]) .no-data mat-icon {
      color: #666 !important;
    }

    :host-context([data-theme="dark"]) .cuid-display {
      background: #2a2a2a !important;
      border: 1px solid #424242;
    }

    :host-context([data-theme="dark"]) .cuid-label {
      color: #aaa !important;
    }

    :host-context([data-theme="dark"]) .cuid-value {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) .search-section {
      border-bottom-color: #424242 !important;
    }

    :host-context([data-theme="dark"]) .result-row {
      background: #2a2a2a !important;
      border-left-color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) .result-username {
      color: #e0e0e0 !important;
    }

    :host-context([data-theme="dark"]) .result-cuid {
      background: #1a1a1a !important;
      color: #ffb74d !important;
      border-color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) .no-results {
      background: #3e2723 !important;
      border-left-color: #ffb74d !important;
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) .search-btn {
      background: #ffb74d !important;
      color: #222 !important;
    }

    :host-context([data-theme="dark"]) .search-btn:hover {
      background: #ffa726 !important;
    }

    :host-context([data-theme="dark"]) .roles-section {
      border-top-color: transparent !important;
    }

    :host-context([data-theme="dark"]) .roles-title {
      color: #e0e0e0 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .role-cb.mat-mdc-checkbox .mat-mdc-checkbox-label {
      color: #e0e0e0 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .role-cb.mat-mdc-checkbox.mat-checked .mdc-checkbox__checkmark {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .role-cb.mat-mdc-checkbox.mat-checked .mdc-checkbox__background {
      background-color: #ffb74d !important;
      border-color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .role-cb.mat-mdc-checkbox .mdc-checkbox__native-control:checked ~ .mdc-checkbox__background {
      background-color: #ffb74d !important;
      border-color: #ffb74d !important;
    }

    /* Unchecked checkbox border - Red (dark mode) */
    :host-context([data-theme="dark"]) ::ng-deep .role-cb.mat-mdc-checkbox .mdc-checkbox__background {
      border-color: #ff6b6b !important;
    }

    /* Red ripple/focus color for checkboxes (dark mode) */
    :host-context([data-theme="dark"]) ::ng-deep .role-cb.mat-mdc-checkbox {
      --mdc-checkbox-unselected-hover-state-layer-color: rgba(255, 107, 107, 0.08) !important;
      --mdc-checkbox-selected-focus-state-layer-color: rgba(255, 107, 107, 0.12) !important;
      --mdc-checkbox-unselected-focus-state-layer-color: rgba(255, 107, 107, 0.12) !important;
      --mdc-theme-primary: #ff6b6b !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .role-cb.mat-mdc-checkbox .mdc-checkbox__ripple {
      background-color: rgba(255, 107, 107, 0.08) !important;
    }

    :host-context([data-theme="dark"]) .button-group {
      background: #1a1a1a !important;
      border-top-color: #424242 !important;
    }

    :host-context([data-theme="dark"]) .edit-btn, 
    :host-context([data-theme="dark"]) .save-btn, 
    :host-context([data-theme="dark"]) .add-btn {
      background: #ffb74d !important;
      color: #222 !important;
    }

    :host-context([data-theme="dark"]) .edit-btn:hover, 
    :host-context([data-theme="dark"]) .save-btn:hover, 
    :host-context([data-theme="dark"]) .add-btn:hover {
      background: #ffa726 !important;
    }

    :host-context([data-theme="dark"]) .cancel-btn {
      color: #aaa !important;
    }

    :host-context([data-theme="dark"]) .clear-btn {
      color: #aaa !important;
    }

    :host-context([data-theme="dark"]) .user-details-section {
      background: transparent !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .info-field.mat-mdc-text-field {
      background-color: #2a2a2a !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .user-select-field.mat-mdc-form-field .mdc-text-field {
      background-color: #2a2a2a !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .user-select-field.mat-mdc-form-field .mdc-text-field__input {
      background-color: #2a2a2a !important;
    }

    ::ng-deep .mat-mdc-form-field-label {
      color: #666 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-form-field-label {
      color: #aaa !important;
    }

    ::ng-deep .mdc-text-field__input {
      color: #222 !important;
      font-size: 13px !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mdc-text-field__input {
      color: #e0e0e0 !important;
    }

    /* Light mode - match project-selector styling */
    ::ng-deep .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__leading {
      border-top: 1px solid #d1d5db !important;
      border-bottom: 1px solid #d1d5db !important;
      border-left: 1px solid #d1d5db !important;
      background-clip: padding-box !important;
      box-shadow: none !important;
      min-width: 12px !important;
      width: 12px !important;
      border-radius: 4px 0 0 4px !important;
      height: 100%;
    }

    ::ng-deep .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-bottom: 1px solid #d1d5db !important;
      border-left: none !important;
      border-right: none !important;
    }

    ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__trailing {
      border-top: 1px solid #d1d5db !important;
      border-bottom: 1px solid #d1d5db !important;
      border-right: 1px solid #d1d5db !important;
      border-radius: 0 4px 4px 0 !important;
    }

    /* Dark mode - match project-selector styling */
    :host-context([data-theme="dark"]) ::ng-deep .mdc-notched-outline__leading,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__leading {
      border-top: 1px solid #424242 !important;
      border-bottom: 1px solid #424242 !important;
      border-left: 1px solid #424242 !important;
      background-clip: padding-box !important;
      box-shadow: none !important;
      min-width: 12px !important;
      width: 12px !important;
      border-radius: 4px 0 0 4px !important;
      height: 100%;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mdc-notched-outline__notch,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-bottom: 1px solid #424242 !important;
      border-left: none !important;
      border-right: none !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__trailing {
      border-top: 1px solid #424242 !important;
      border-bottom: 1px solid #424242 !important;
      border-right: 1px solid #424242 !important;
      border-radius: 0 4px 4px 0 !important;
    }

    /* Mat-Select and Mat-Option Styling - Match app.component menu theme */
    ::ng-deep .mat-mdc-select-panel {
      border-radius: 8px !important;
      margin-top: 8px !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
      overflow: hidden !important;
    }

    ::ng-deep .mat-mdc-option {
      color: #333333 !important;
      font-weight: 500;
      font-size: 14px !important;
      height: 48px !important;
      transition: all 200ms ease !important;
    }

    ::ng-deep .mat-mdc-option:hover {
      background: rgba(255, 152, 0, 0.08) !important;
    }

    ::ng-deep .mat-mdc-option.mat-selected,
    ::ng-deep .mat-mdc-option.mdc-list-item--selected,
    ::ng-deep .mat-mdc-option[aria-selected="true"] {
      background: rgba(255, 152, 0, 0.12) !important;
    }

    ::ng-deep .mat-mdc-option.mat-selected .mdc-list-item__primary-text,
    ::ng-deep .mat-mdc-option[aria-selected="true"] .mdc-list-item__primary-text {
      color: #ff7043 !important;
      font-weight: 600 !important;
    }

    ::ng-deep .mat-mdc-option:hover .mdc-list-item__primary-text {
      color: #ff7043 !important;
    }

    /* Orange checkmark/tick icon for selected options */
    ::ng-deep .mat-mdc-option.mat-selected .mdc-list-item__graphic,
    ::ng-deep .mat-mdc-option[aria-selected="true"] .mdc-list-item__graphic {
      color: #ff9800 !important;
    }

    ::ng-deep .mdc-list-item__graphic .mat-icon {
      color: #ff9800 !important;
    }

    /* Override Material CSS variables for mat-pseudo-checkbox color */
    ::ng-deep .mat-mdc-option.mat-selected .mat-pseudo-checkbox {
      --mat-pseudo-checkbox-minimal-selected-checkmark-color: #ff9800 !important;
    }

    ::ng-deep .mat-mdc-option {
      --mat-option-selected-state-label-text-color: #ff7043 !important;
      --mat-sys-on-secondary-container: #ff9800 !important;
    }

    /* Material checkbox styling for mat-option selected state */
    ::ng-deep .mat-mdc-option.mat-selected .mdc-checkbox__checkmark,
    ::ng-deep .mat-mdc-option[aria-selected="true"] .mdc-checkbox__checkmark {
      color: #ff9800 !important;
    }

    ::ng-deep .mat-mdc-option.mat-selected .mdc-checkbox__background,
    ::ng-deep .mat-mdc-option[aria-selected="true"] .mdc-checkbox__background {
      border-color: #ff9800 !important;
      background-color: #ff9800 !important;
      fill: #ff9800 !important;
    }

    ::ng-deep .mat-mdc-option.mat-selected .mat-mdc-checkbox-frame,
    ::ng-deep .mat-mdc-option[aria-selected="true"] .mat-mdc-checkbox-frame {
      border-color: #ff9800 !important;
    }

    /* Override default Material blue checkbox color */
    ::ng-deep .mat-mdc-option.mat-selected .mdc-checkbox,
    ::ng-deep .mat-mdc-option[aria-selected="true"] .mdc-checkbox {
      --mdc-theme-primary: #ff9800 !important;
    }

    /* SVG path elements for checkbox icon */
    ::ng-deep .mat-mdc-option.mat-selected .mat-mdc-checkbox-ripple svg,
    ::ng-deep .mat-mdc-option[aria-selected="true"] .mat-mdc-checkbox-ripple svg {
      color: #ff9800 !important;
    }

    ::ng-deep .mat-mdc-option.mat-selected .mat-icon,
    ::ng-deep .mat-mdc-option[aria-selected="true"] .mat-icon {
      color: #ff9800 !important;
    }

    /* Dark mode mat-select */
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mat-selected .mat-pseudo-checkbox {
      --mat-pseudo-checkbox-minimal-selected-checkmark-color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option {
      --mat-option-selected-state-label-text-color: #ffb74d !important;
      --mat-sys-on-secondary-container: #ffb74d !important;
    }

    /* Dark mode mat-select */
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-select-panel {
      background: #262626 !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45) !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option {
      color: #e0e0e0 !important;
      background: #262626 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option:hover {
      background: rgba(255, 152, 0, 0.2) !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mat-selected,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mdc-list-item--selected,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option[aria-selected="true"] {
      background: rgba(255, 152, 0, 0.25) !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mat-selected .mdc-list-item__primary-text,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option[aria-selected="true"] .mdc-list-item__primary-text {
      color: #ffb74d !important;
      font-weight: 600 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option:hover .mdc-list-item__primary-text {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mat-selected .mdc-list-item__graphic,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option[aria-selected="true"] .mdc-list-item__graphic {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mdc-list-item__graphic .mat-icon {
      color: #ffb74d !important;
    }

    /* Material checkbox styling for mat-option selected state in dark mode */
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mat-selected .mdc-checkbox__checkmark,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option[aria-selected="true"] .mdc-checkbox__checkmark {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mat-selected .mdc-checkbox__background,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option[aria-selected="true"] .mdc-checkbox__background {
      border-color: #ffb74d !important;
      background-color: #ffb74d !important;
      fill: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mat-selected .mat-mdc-checkbox-frame,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option[aria-selected="true"] .mat-mdc-checkbox-frame {
      border-color: #ffb74d !important;
    }

    /* Override default Material blue checkbox color in dark mode */
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mat-selected .mdc-checkbox,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option[aria-selected="true"] .mdc-checkbox {
      --mdc-theme-primary: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mat-selected .mat-mdc-checkbox-ripple svg,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option[aria-selected="true"] .mat-mdc-checkbox-ripple svg {
      color: #ffb74d !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option.mat-selected .mat-icon,
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-option[aria-selected="true"] .mat-icon {
      color: #ffb74d !important;
    }

    /* Mat-Select field styling */
    ::ng-deep .search-type-field.mat-mdc-form-field .mat-mdc-text-field::after {
      border-bottom-color: #ff9800 !important;
    }

    ::ng-deep .search-type-field.mat-mdc-form-field.mat-focused .mat-mdc-select-arrow {
      color: #ff9800 !important;
    }

    :host-context([data-theme="dark"]) ::ng-deep .search-type-field.mat-mdc-form-field.mat-focused .mat-mdc-select-arrow {
      color: #ffb74d !important;
    }
  `]
})
export class UserAccessComponent implements OnInit {
  @Output() paginationChange = new EventEmitter<{ totalItems: number; pageSize: number; pageIndex: number }>();

  isLoading = false;
  isEditMode = false;
  allUsers: UserSecurity[] = [];
  selectedUser: UserSecurity | null = null;
  selectedUserIndex = 0;
  originalUser: UserSecurity | null = null;
  searchResults: UserSecurity[] = [];
  searchPerformed = false;

  // Form controls for search
  searchTypeControl = new FormBuilder().control('cuid');
  searchValueControl = new FormBuilder().control('');

  // Form controls for each role
  userAccessControl = new FormBuilder().control(false);
  dataAdminControl = new FormBuilder().control(false);
  projAdminControl = new FormBuilder().control(false);
  costAdminControl = new FormBuilder().control(false);
  userAdminControl = new FormBuilder().control(false);

  constructor(
    private snackBar: MatSnackBar,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Component initializes, but doesn't load all users
    // Users are searched on-demand
  }

  performSearch(): void {
    const searchValue = this.searchValueControl.value?.trim();
    const searchType = this.searchTypeControl.value;

    if (!searchValue) {
      this.snackBar.open('Please enter a search value', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    // Search for users (backend should handle partial matches and case-insensitivity)
    if (searchType === 'username') {
      // Search by username - backend will handle "contains" search
      this.adminService.searchUsersByUsername(searchValue).subscribe({
        next: (users: UserSecurity[]) => {
          if (users && users.length > 0) {
            this.searchResults = users;
            this.selectedUserIndex = 0;
            this.selectedUser = users[0];
            this.originalUser = { ...users[0] };
            this.searchPerformed = true;
            // Disable form controls by default
            this.disableRoleControls();
            this.loadUserRoles();
            this.snackBar.open(`Found ${users.length} user(s)`, 'Close', { duration: 2000 });
          } else {
            this.searchResults = [];
            this.selectedUser = null;
            this.searchPerformed = true;
            this.snackBar.open('No users found matching your search', 'Close', { duration: 3000 });
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Search failed:', error);
          this.searchResults = [];
          this.selectedUser = null;
          this.searchPerformed = true;
          this.snackBar.open('Search failed: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 3000 });
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    } else if (searchType === 'cuid') {
      // Search by CUID - case-insensitive, exact match
      this.adminService.searchUsersByCuid(searchValue).subscribe({
        next: (users: UserSecurity[]) => {
          if (users && users.length > 0) {
            this.searchResults = users;
            this.selectedUserIndex = 0;
            this.selectedUser = users[0];
            this.originalUser = { ...users[0] };
            this.searchPerformed = true;
            // Disable form controls by default
            this.disableRoleControls();
            this.loadUserRoles();
            this.snackBar.open(`Found ${users.length} user(s)`, 'Close', { duration: 2000 });
          } else {
            this.searchResults = [];
            this.selectedUser = null;
            this.searchPerformed = true;
            this.snackBar.open('No users found matching your search', 'Close', { duration: 3000 });
          }
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Search failed:', error);
          this.searchResults = [];
          this.selectedUser = null;
          this.searchPerformed = true;
          this.snackBar.open('Search failed: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 3000 });
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  clearSearch(): void {
    this.searchValueControl.reset();
    this.searchTypeControl.setValue('username');
    this.searchResults = [];
    this.searchPerformed = false;
    this.selectedUser = null;
    this.selectedUserIndex = 0;
    this.originalUser = null;
    this.isEditMode = false;
    // Reset form controls
    this.disableRoleControls();
    this.cdr.markForCheck();
  }

  disableRoleControls(): void {
    this.userAccessControl.disable();
    this.dataAdminControl.disable();
    this.projAdminControl.disable();
    this.costAdminControl.disable();
    this.userAdminControl.disable();
  }

  enableRoleControls(): void {
    this.userAccessControl.enable();
    this.dataAdminControl.enable();
    this.projAdminControl.enable();
    this.costAdminControl.enable();
    this.userAdminControl.enable();
  }

  onUserSelected(event: any): void {
    const selectedIndex = this.selectedUserIndex;
    if (selectedIndex >= 0 && selectedIndex < this.searchResults.length) {
      this.selectedUser = this.searchResults[selectedIndex];
      this.originalUser = { ...this.searchResults[selectedIndex] };
      this.isEditMode = false;
      this.disableRoleControls();
      this.loadUserRoles();
      this.cdr.markForCheck();
    }
  }

  loadUserRoles(): void {
    if (!this.selectedUser) return;
    
    this.userAccessControl.setValue(this.selectedUser.userAccess, { emitEvent: false });
    this.dataAdminControl.setValue(this.selectedUser.dataAdmin, { emitEvent: false });
    this.projAdminControl.setValue(this.selectedUser.projAdmin, { emitEvent: false });
    this.costAdminControl.setValue(this.selectedUser.costAdmin, { emitEvent: false });
    this.userAdminControl.setValue(this.selectedUser.userAdmin, { emitEvent: false });
    this.cdr.markForCheck();
  }

  addNewUser(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '500px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User clicked Save in the dialog
        this.isLoading = true;
        this.adminService.saveUser(result).subscribe({
          next: (newUser: UserSecurity) => {
            this.isLoading = false;
            this.snackBar.open('User added successfully', 'Close', { duration: 3000 });
            // Load the new user in the form
            this.selectedUser = newUser;
            this.selectedUserIndex = 0;
            this.originalUser = { ...newUser };
            this.searchResults = [newUser];
            this.searchPerformed = true;
            this.disableRoleControls();
            this.loadUserRoles();
            this.cdr.markForCheck();
          },
          error: (error) => {
            console.error('Failed to add user:', error);
            this.isLoading = false;
            this.snackBar.open('Failed to add user: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  enableEdit(): void {
    this.isEditMode = true;
    // Enable form controls
    this.enableRoleControls();
    this.cdr.markForCheck();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    // Disable form controls
    this.disableRoleControls();
    this.cdr.markForCheck();
    // Reload original values to reset form controls
    this.loadUserRoles();
  }

  saveChanges(): void {
    if (!this.selectedUser) return;

    // Update selected user with form control values
    this.selectedUser.userAccess = this.userAccessControl.value ?? false;
    this.selectedUser.dataAdmin = this.dataAdminControl.value ?? false;
    this.selectedUser.projAdmin = this.projAdminControl.value ?? false;
    this.selectedUser.costAdmin = this.costAdminControl.value ?? false;
    this.selectedUser.userAdmin = this.userAdminControl.value ?? false;

    // Call backend to save changes
    this.isLoading = true;
    this.adminService.saveUser(this.selectedUser).subscribe({
      next: (updatedUser: UserSecurity) => {
        this.selectedUser = updatedUser;
        this.originalUser = { ...updatedUser };
        this.isEditMode = false;
        this.isLoading = false;
        // Disable form controls
        this.disableRoleControls();
        this.loadUserRoles();
        this.snackBar.open('User roles updated successfully', 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to save user:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to save user roles', 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      }
    });
  }

  deleteUser(): void {
    if (!this.selectedUser) return;

    const confirmed = confirm(`Are you sure you want to delete user "${this.selectedUser.userName}"?`);
    if (!confirmed) return;

    this.isLoading = true;
    this.adminService.deleteUser(this.selectedUser.userName).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearSearch();
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to delete user:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
        this.cdr.markForCheck();
      }
    });
  }
}

