import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface PartEditData {
  isEdit: boolean;
  part?: {
    qty: number;
    partNum: string;
    partDesc: string;
    projPartId?: number;
    partId?: number;
  };
}

@Component({
  selector: 'app-part-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Primary Part' : 'Add Primary Part' }}</h2>
      
      <div mat-dialog-content class="content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Part Number</mat-label>
          <input matInput [(ngModel)]="formData.partNum" placeholder="e.g., PN-12345">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <input matInput [(ngModel)]="formData.partDesc" placeholder="Part description">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Quantity</mat-label>
          <input matInput type="number" [(ngModel)]="formData.qty" placeholder="0" min="0">
        </mat-form-field>
      </div>

      <div mat-dialog-actions class="actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">Cancel</button>
        <button mat-raised-button (click)="onSave()" class="save-btn" [disabled]="!isFormValid()">
          <mat-icon>save</mat-icon>
          {{ data.isEdit ? 'Update' : 'Add' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 20px;
      min-width: 300px;
    }

    h2 {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #222;
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    .full-width {
      width: 100%;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .cancel-btn {
      color: #666;
    }

    .save-btn {
      background: #ff9800 !important;
      color: white !important;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .save-btn:disabled {
      background: #ccc !important;
      color: #999 !important;
    }
  `]
})
export class PartEditDialog implements OnInit {
  formData = {
    qty: 0,
    partNum: '',
    partDesc: ''
  };

  constructor(
    public dialogRef: MatDialogRef<PartEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: PartEditData
  ) {}

  ngOnInit(): void {
    if (this.data.isEdit && this.data.part) {
      this.formData = {
        qty: this.data.part.qty,
        partNum: this.data.part.partNum,
        partDesc: this.data.part.partDesc
      };
    }
  }

  isFormValid(): boolean {
    return this.formData.qty > 0 && this.formData.partNum.trim().length > 0;
  }

  onSave(): void {
    if (this.isFormValid()) {
      this.dialogRef.close(this.formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
