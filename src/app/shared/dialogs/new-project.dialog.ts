import { Component, Inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { DialogKeyboardNavDirective } from '../directives/dialog-keyboard-nav.directive';

/**
 * New project dialog — converted from VB6 frmNewProject.
 */
@Component({
  selector: 'app-new-project-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatSnackBarModule,
    DialogKeyboardNavDirective
  ],
  template: `
    <div appDialogKeyboardNav (keydown)="onDialogKeydown($event)">
      <h2 mat-dialog-title>New Project</h2>
      <mat-dialog-content class="no-scroll">
        <mat-form-field appearance="outline" class="full-width search-field">
          <mat-label>Project Number</mat-label>
          <input matInput [(ngModel)]="project.projectNum" required maxlength="40" 
                 (keydown.enter)="create()" />
        </mat-form-field>

        @if (error()) {
          <p class="error-text">{{ error() }}</p>
        }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close tabindex="0">Cancel</button>
        <button mat-raised-button color="primary" [disabled]="!project.projectNum"
                (click)="create()" tabindex="0">Create</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 16px; }
    .search-field { margin-top: 12px; }
    .no-scroll { overflow: visible !important; max-height: none !important; }
    .error-text { color: #e53935; font-weight: 500; }
    
    /* Enhanced orange border styling for search field */
    .search-field ::ng-deep .mdc-notched-outline__leading,
    .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__leading {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-left: 2px solid #ff9800 !important;
      background-clip: padding-box !important;
      box-shadow: none !important;
      min-width: 12px !important;
      width: 12px !important;
      border-radius: 4px 0 0 4px !important;
      height: 100%;
    }
    
    .search-field ::ng-deep .mdc-notched-outline__notch,
    .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-left: none !important;
      border-right: none !important;
    }

    /* When the label floats, remove notch top border to avoid line crossing label text */
    .search-field ::ng-deep .mdc-notched-outline--notched .mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-notched-outline--notched .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-top: none !important;
    }
    
    /* Hide top border in notch when field is focused, has content, or both */
    .search-field ::ng-deep .mdc-text-field--focused .mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-text-field--filled .mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-text-field--focused.mdc-text-field--filled .mdc-notched-outline__notch {
      border-top: none !important;
    }
    
    /* Additional specificity for mat-mdc-notch-piece */
    .search-field ::ng-deep .mdc-text-field--focused .mat-mdc-notch-piece.mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-text-field--filled .mat-mdc-notch-piece.mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-text-field--focused.mdc-text-field--filled .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-top: none !important;
    }
    
    .search-field ::ng-deep .mdc-notched-outline__trailing,
    .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__trailing {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-right: 2px solid #ff9800 !important;
      border-radius: 0 4px 4px 0 !important;
    }
    
    .search-field ::ng-deep input.mat-mdc-input-element {
      padding-left: 10px !important;
      border-radius: 4px !important;
    }
    
    .search-field ::ng-deep .mdc-line-ripple {
      display: none !important;
    }
    
    /* Dark mode support */
    :host-context([data-theme="dark"]) .search-field ::ng-deep .mdc-notched-outline__leading,
    :host-context([data-theme="dark"]) .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__leading {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-left: 2px solid #ff9800 !important;
    }
    
    :host-context([data-theme="dark"]) .search-field ::ng-deep .mdc-notched-outline__notch,
    :host-context([data-theme="dark"]) .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
    }

    :host-context([data-theme="dark"]) .search-field ::ng-deep .mdc-notched-outline--notched .mdc-notched-outline__notch,
    :host-context([data-theme="dark"]) .search-field ::ng-deep .mdc-notched-outline--notched .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-top: none !important;
    }
    
    :host-context([data-theme="dark"]) .search-field ::ng-deep .mdc-notched-outline__trailing,
    :host-context([data-theme="dark"]) .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__trailing {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-right: 2px solid #ff9800 !important;
    }
  `]
})
export class NewProjectDialog {
  project: Partial<Project> = { partGroupId: 1, floorHeight: 18.00 };
  error = signal('');

  constructor(
    private projectService: ProjectService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<NewProjectDialog>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onDialogKeydown(event: KeyboardEvent): void {
    // Alt+N: Create new project (when in dialog)
    if (event.altKey && event.key.toLowerCase() === 'n' && this.project.projectNum) {
      event.preventDefault();
      this.create();
      return;
    }

    // Alt+C: Cancel/Close dialog
    if (event.altKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      this.dialogRef.close();
      return;
    }

    // Escape: Close dialog
    if (event.key === 'Escape') {
      event.preventDefault();
      this.dialogRef.close();
      return;
    }
  }

  create(): void {
    this.error.set('');
    const userName = this.authService.getCurrentUserName();
    this.projectService.createProject(this.project.projectNum || '', userName).subscribe({
      next: (created) => {
        const updatedProject: Project = {
          ...created,
          customer: this.project.customer || created.customer,
          partGroupId: this.project.partGroupId || created.partGroupId,
          floorHeight: typeof this.project.floorHeight === 'number' ? this.project.floorHeight : 18
        };

        this.projectService.updateProject(updatedProject).subscribe({
          next: (saved) => {
            this.dialogRef.close(saved);
            this.snackBar.open('Project created', 'Close', { duration: 2000 });
          },
          error: () => {
            // Fallback to created record if optional update fails.
            this.dialogRef.close(created);
            this.snackBar.open('Project created (some fields may need review)', 'Close', { duration: 3000 });
          }
        });
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to create project');
      }
    });
  }
}
