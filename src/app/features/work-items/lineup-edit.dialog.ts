import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface LineupEditData {
  isEdit: boolean;
  lineup?: {
    lineup: string;
    startBay: string;
    endBay: string;
    itemLineupId?: number;
  };
}

@Component({
  selector: 'app-lineup-edit-dialog',
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
      <h2 mat-dialog-title>{{ data.isEdit ? 'Edit Lineup/Bay' : 'Add Lineup/Bay' }}</h2>
      
      <div mat-dialog-content class="content">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Lineup</mat-label>
          <input matInput [(ngModel)]="formData.lineup" placeholder="e.g., A, B, C">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Start Bay</mat-label>
          <input matInput [(ngModel)]="formData.startBay" placeholder="e.g., Bay 1">
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>End Bay</mat-label>
          <input matInput [(ngModel)]="formData.endBay" placeholder="e.g., Bay 10">
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
export class LineupEditDialog implements OnInit {
  formData = {
    lineup: '',
    startBay: '',
    endBay: ''
  };

  constructor(
    public dialogRef: MatDialogRef<LineupEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: LineupEditData
  ) {}

  ngOnInit(): void {
    if (this.data.isEdit && this.data.lineup) {
      this.formData = {
        lineup: this.data.lineup.lineup,
        startBay: this.data.lineup.startBay,
        endBay: this.data.lineup.endBay
      };
    }
  }

  isFormValid(): boolean {
    return this.formData.lineup.trim().length > 0 && 
           this.formData.startBay.trim().length > 0 && 
           this.formData.endBay.trim().length > 0;
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
