import { Component, Inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DialogKeyboardNavDirective } from '../directives/dialog-keyboard-nav.directive';

export interface DialogOption {
  label: string;
  value: any;
  color?: string;
  icon?: string;
}

export interface ConfirmDialogData {
  title: string;
  message: string;
  okLabel?: string;
  cancelLabel?: string;
  okColor?: string;
  showCancel?: boolean;
  dialogType?: 'confirm' | 'format-selection' | 'options';  // Default: 'confirm'
  options?: DialogOption[];  // For 'options' and 'format-selection' types
  iconClass?: string;  // CSS class for icon styling
}

/**
 * Generic dialog component for confirmations, format selection, and multi-option choices.
 * Replaces: ConfirmDialogComponent, FormatSelectionDialogComponent
 * 
 * Usage:
 * - Confirm: { title, message, okLabel, cancelLabel }
 * - Format: { title, message, dialogType: 'format-selection', options: [{label: 'Excel', value: 'excel'}, ...] }
 * - Options: { title, message, dialogType: 'options', options: [{label: '...', value: ...}, ...] }
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, DialogKeyboardNavDirective],
  template: `
    <div appDialogKeyboardNav (keydown)="onDialogKeydown($event)" class="dialog-container" [ngClass]="'type-' + (data.dialogType || 'confirm')">>
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <mat-dialog-content>
        <div class="content-wrapper" [ngClass]="{ 'with-icon': data.dialogType === 'format-selection' }">
          <mat-icon *ngIf="data.dialogType === 'format-selection'" class="warning-icon">warning_amber</mat-icon>
          <p class="message" [innerHTML]="sanitizedMessage"></p>
        </div>
      </mat-dialog-content>

      <!-- Standard confirm buttons -->
      <mat-dialog-actions *ngIf="!data.options || data.options.length === 0" align="end" class="dialog-actions">
        <button 
          *ngIf="data.showCancel !== false" 
          mat-stroked-button
          class="cancel-btn"
          tabindex="0"
          (click)="cancel()">
          {{ data.cancelLabel || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          [color]="data.okColor || 'warn'" 
          [class.confirm-btn]="true"
          [class.confirm-btn-primary]="data.okColor === 'primary'"
          tabindex="0"
          (click)="confirm()">
          {{ data.okLabel || 'OK' }}
        </button>
      </mat-dialog-actions>

      <!-- Multi-option buttons -->
      <mat-dialog-actions *ngIf="data.options && data.options.length > 0" align="end" class="dialog-actions options-actions">
        <button 
          *ngFor="let option of data.options"
          mat-raised-button
          [color]="option.color"
          [class.option-btn]="true"
          [class.option-btn-primary]="option.color === 'primary'"
          [class.option-btn-default]="!option.color"
          tabindex="0"
          (click)="selectOption(option.value)">
          <mat-icon *ngIf="option.icon" class="option-icon">{{ option.icon }}</mat-icon>
          {{ option.label }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container { 
      padding: 0; 
    }

    .type-confirm {
      min-width: 400px;
    }

    .type-format-selection {
      min-width: 380px;
    }

    .type-options {
      min-width: 380px;
    }

    mat-dialog-content { 
      padding: 0 24px 24px; 
    }

    .content-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .content-wrapper.with-icon {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      gap: 16px;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 32px;
      width: 32px;
      height: 32px;
      flex-shrink: 0;
      margin: 0 auto;
    }

    .message { 
      margin: 8px 0; 
      color: #374151;
      word-break: break-word;
    }

    .content-wrapper.with-icon .message {
      font-size: 1.1rem;
      text-align: center;
    }

    .dialog-actions {
      padding: 16px 8px;
      gap: 8px;
    }

    .dialog-actions.options-actions {
      flex-wrap: wrap;
      justify-content: center;
    }

    .cancel-btn {
      min-width: 80px;
    }

    .confirm-btn {
      min-width: 80px;
    }

    .confirm-btn-primary {
      background-color: #ff9800 !important;
      color: white !important;
    }

    .confirm-btn-primary:hover:not(:disabled) {
      background-color: #fb8500 !important;
    }

    .option-btn {
      min-width: 100px;
      flex: 0 1 auto;
      font-weight: 500;
    }

    .option-btn-primary {
      background-color: #ff9800 !important;
      color: white !important;
    }

    .option-btn-primary:hover:not(:disabled) {
      background-color: #fb8500 !important;
    }

    .option-btn-default {
      background-color: white !important;
      color: #ff9800 !important;
      border: 1px solid #e0e0e0 !important;
    }

    .option-btn-default:hover:not(:disabled) {
      background-color: #f5f5f5 !important;
      color: #1565c0 !important;
      border-color: #ff9800 !important;
    }

    .option-icon {
      margin-right: 8px;
    }
  `]
})
export class ConfirmDialogComponent {
  sanitizedMessage: SafeHtml;

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private sanitizer: DomSanitizer
  ) {
    // Sanitize HTML in message to allow <strong>, <br>, etc.
    this.sanitizedMessage = this.sanitizer.bypassSecurityTrustHtml(data.message);
  }

  onDialogKeydown(event: KeyboardEvent): void {
    // Alt+Y: Confirm/OK
    if (event.altKey && event.key.toLowerCase() === 'y') {
      event.preventDefault();
      this.confirm();
      return;
    }

    // Alt+N: Cancel
    if (event.altKey && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      this.cancel();
      return;
    }

    // Escape: Cancel
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancel();
      return;
    }

    // Arrow keys: Navigate between buttons
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const buttons = Array.from(document.querySelectorAll('.dialog-actions button')) as HTMLButtonElement[];
      const activeButton = document.activeElement as HTMLButtonElement;
      const currentIndex = buttons.indexOf(activeButton);
      
      if (event.key === 'ArrowRight') {
        const nextIndex = (currentIndex + 1) % buttons.length;
        buttons[nextIndex]?.focus();
      } else {
        const prevIndex = currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
        buttons[prevIndex]?.focus();
      }
    }
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  selectOption(value: any): void {
    this.dialogRef.close(value);
  }
}
