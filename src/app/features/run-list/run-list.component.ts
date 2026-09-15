import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RunListService } from '../../core/services/run-list.service';
import { RunListEntry } from '../../core/models/models';

/**
 * Run List component — converted from VB6 frmRunList.
 * Cable/power run list grid with 18 columns, inline editing.
 * Dropdowns for Category, From Part, To Part, Color, Designation, Cable Type.
 * Toolbar: Up/Down reorder, Copy, RL Notes, RL Wizard, Close.
 */
@Component({
  selector: 'app-run-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatToolbarModule,
    MatTooltipModule, MatSelectModule, MatFormFieldModule, MatInputModule,
    MatSnackBarModule, MatProgressSpinnerModule
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
        <button mat-icon-button class="action-btn" matTooltip="Move Up" [disabled]="!selectedEntry()"
                (click)="moveUp()">
          <mat-icon>arrow_upward</mat-icon>
        </button>
        <button mat-icon-button class="action-btn" matTooltip="Move Down" [disabled]="!selectedEntry()"
                (click)="moveDown()">
          <mat-icon>arrow_downward</mat-icon>
        </button>
        <button mat-icon-button class="action-btn" matTooltip="Copy Run" [disabled]="!selectedEntry()"
                (click)="copyEntry()">
          <mat-icon>content_copy</mat-icon>
        </button>
        <button mat-icon-button class="action-btn" matTooltip="Run List Notes">
          <mat-icon>note</mat-icon>
        </button>
        <button mat-icon-button class="action-btn" matTooltip="Run List Wizard">
          <mat-icon>auto_fix_high</mat-icon>
        </button>
      </div>
      <div class="header-right">
        <span class="page-title-right">Run List</span>
      </div>
    </div>
    <div class="header-divider"></div>

    @if (loading()) {
      <div class="spinner-wrapper"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="run-list-wrapper">
        <table mat-table [dataSource]="entries()" class="full-width run-list-table">

          <ng-container matColumnDef="runSeq">
            <th mat-header-cell *matHeaderCellDef>Num</th>
            <td mat-cell *matCellDef="let row">{{ row.runSeq }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Category</th>
            <td mat-cell *matCellDef="let row">{{ row.categoryDesc || row.runlistCatId }}</td>
          </ng-container>

          <ng-container matColumnDef="color">
            <th mat-header-cell *matHeaderCellDef>Color</th>
            <td mat-cell *matCellDef="let row">{{ row.color }}</td>
          </ng-container>

          <ng-container matColumnDef="length">
            <th mat-header-cell *matHeaderCellDef>Length</th>
            <td mat-cell *matCellDef="let row">{{ row.length }}</td>
          </ng-container>

          <ng-container matColumnDef="numCables">
            <th mat-header-cell *matHeaderCellDef># Cables</th>
            <td mat-cell *matCellDef="let row">{{ row.numCables }}</td>
          </ng-container>

          <ng-container matColumnDef="cableType">
            <th mat-header-cell *matHeaderCellDef>Cable Type</th>
            <td mat-cell *matCellDef="let row">{{ row.cableTypeDesc || row.cableTypeId }}</td>
          </ng-container>

          <ng-container matColumnDef="desig">
            <th mat-header-cell *matHeaderCellDef>Designation</th>
            <td mat-cell *matCellDef="let row">{{ row.desig }}</td>
          </ng-container>

          <ng-container matColumnDef="fromEquipment">
            <th mat-header-cell *matHeaderCellDef>From Equipment</th>
            <td mat-cell *matCellDef="let row">{{ row.fromPartDesc || row.fromPartId }}</td>
          </ng-container>

          <ng-container matColumnDef="fromLoc">
            <th mat-header-cell *matHeaderCellDef>From Location</th>
            <td mat-cell *matCellDef="let row">{{ row.fromLoc }}</td>
          </ng-container>

          <ng-container matColumnDef="panel">
            <th mat-header-cell *matHeaderCellDef>Panel</th>
            <td mat-cell *matCellDef="let row">{{ row.panel }}</td>
          </ng-container>

          <ng-container matColumnDef="circuitBrkrPos">
            <th mat-header-cell *matHeaderCellDef>Crct Brkr Pos</th>
            <td mat-cell *matCellDef="let row">{{ row.circuitBrkrPos }}</td>
          </ng-container>

          <ng-container matColumnDef="toEquipment">
            <th mat-header-cell *matHeaderCellDef>To Equipment</th>
            <td mat-cell *matCellDef="let row">{{ row.toPartDesc || row.toPartId }}</td>
          </ng-container>

          <ng-container matColumnDef="toLoc">
            <th mat-header-cell *matHeaderCellDef>To Location</th>
            <td mat-cell *matCellDef="let row">{{ row.toLoc }}</td>
          </ng-container>

          <ng-container matColumnDef="eqDrain">
            <th mat-header-cell *matHeaderCellDef>EQ Drain</th>
            <td mat-cell *matCellDef="let row">{{ row.eqDrain }}</td>
          </ng-container>

          <ng-container matColumnDef="voltageDrop">
            <th mat-header-cell *matHeaderCellDef>V-Drop</th>
            <td mat-cell *matCellDef="let row">{{ row.voltageDrop }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              [class.selected]="selectedEntry()?.runId === row.runId"
              (click)="selectEntry(row)"></tr>
        </table>
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
      padding: 0 32px 0 16px;
      background-color: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      min-height: 64px;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }

    .back-button {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 14px;
      font-weight: 500;
      gap: 8px;
    }

    .back-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #6b7280;
      transition: color 0.2s;
    }

    .back-button:hover {
      background-color: #f0f4f8;
      color: #ff9800;
    }

    .back-button:hover mat-icon {
      color: #ff9800;
    }

    .header-divider-v {
      width: 1px;
      height: 24px;
      background-color: #e5e7eb;
      margin: 0 8px;
    }

    .action-btn {
      color: #6b7280 !important;
      transition: all 0.2s ease;
    }

    .action-btn:hover:not([disabled]) {
      color: #ff9800 !important;
      background-color: #f0f4f8 !important;
    }

    .header-right {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .page-title-right {
      font-size: 20px;
      font-weight: 400;
      color: #8a4d00;
      margin: 0;
      padding: 0;
      white-space: nowrap;
    }

    .header-divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 0;
      flex-shrink: 0;
    }

    /* ============ Table ============ */
    .spinner-wrapper { display: flex; justify-content: center; padding: 48px; }
    .run-list-wrapper { overflow-x: auto; padding: 16px; flex: 1; }
    .run-list-table { min-width: 1600px; }
    .full-width { width: 100%; }

    ::ng-deep .mat-mdc-header-cell {
      background: #f1ece5 !important;
      font-weight: 600 !important;
      font-size: 11px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.3px !important;
      color: #424242 !important;
      white-space: nowrap !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      border-bottom: 1px solid #e0e0e0 !important;
    }

    ::ng-deep .mat-mdc-cell {
      font-size: 12px !important;
      padding: 4px 8px !important;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
      color: #222 !important;
      border-bottom: 1px solid #e0e0e0 !important;
    }

    tr.selected { background: #f1ece5 !important; }

    tr.mat-mdc-row:hover {
      background: #f1ece5 !important;
      cursor: pointer;
    }

    /* ====== DARK MODE ====== */
    :host-context([data-theme="dark"]) .page-header {
      background-color: #1e1e1e !important;
      border-bottom-color: #424242 !important;
    }
    :host-context([data-theme="dark"]) .back-button {
      color: #90caf9 !important;
    }
    :host-context([data-theme="dark"]) .back-button mat-icon {
      color: #90caf9 !important;
    }
    :host-context([data-theme="dark"]) .back-button:hover {
      background-color: #1a2a4a !important;
      color: #ffffff !important;
    }
    :host-context([data-theme="dark"]) .page-title-right {
      color: #ff9800 !important;
    }
    :host-context([data-theme="dark"]) .header-divider,
    :host-context([data-theme="dark"]) .header-divider-v {
      background-color: #2a5298 !important;
    }
    :host-context([data-theme="dark"]) .action-btn {
      color: #e0e0e0 !important;
    }
    :host-context([data-theme="dark"]) .action-btn:hover:not([disabled]) {
      color: #ff9800 !important;
      background-color: #2a2520 !important;
    }
    :host-context([data-theme="dark"]) .run-list-wrapper {
      background: #121212 !important;
    }
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-header-cell {
      background: #2a1a08 !important;
      color: #ff9800 !important;
      border-bottom-color: #424242 !important;
    }
    :host-context([data-theme="dark"]) ::ng-deep .mat-mdc-cell {
      color: #e0e0e0 !important;
      border-bottom-color: #333 !important;
    }
    :host-context([data-theme="dark"]) tr.mat-mdc-row:hover {
      background: #2a2520 !important;
    }
    :host-context([data-theme="dark"]) tr.selected {
      background: #3d2a10 !important;
    }
  `]
})
export class RunListComponent implements OnInit {
  projectNum = '';

  loading = signal(false);
  entries = signal<RunListEntry[]>([]);
  selectedEntry = signal<RunListEntry | null>(null);

  displayedColumns = [
    'runSeq', 'category', 'color', 'length', 'numCables', 'cableType',
    'desig', 'fromEquipment', 'fromLoc', 'panel', 'circuitBrkrPos',
    'toEquipment', 'toLoc', 'eqDrain', 'voltageDrop'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private runListService: RunListService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.projectNum = this.route.snapshot.paramMap.get('projectNum') || '';
    this.loadRunList();
  }

  loadRunList(): void {
    this.loading.set(true);
    this.runListService.getRunList(this.projectNum).subscribe({
      next: (data) => {
        this.entries.set(data);
        this.selectedEntry.set(null);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Failed to load run list', 'Close', { duration: 4000 });
      }
    });
  }

  selectEntry(entry: RunListEntry): void {
    this.selectedEntry.set(entry);
  }

  moveUp(): void {
    const e = this.selectedEntry();
    if (!e?.runId) return;
    const items = this.entries();
    const idx = items.findIndex(i => i.runId === e.runId);
    if (idx > 0) {
      this.runListService.reorder(this.projectNum, e.runId, items[idx - 1].runId).subscribe({
        next: () => this.loadRunList()
      });
    }
  }

  moveDown(): void {
    const e = this.selectedEntry();
    if (!e?.runId) return;
    const items = this.entries();
    const idx = items.findIndex(i => i.runId === e.runId);
    if (idx >= 0 && idx < items.length - 1) {
      this.runListService.reorder(this.projectNum, e.runId, items[idx + 1].runId).subscribe({
        next: () => this.loadRunList()
      });
    }
  }

  copyEntry(): void {
    const e = this.selectedEntry();
    if (!e?.runId) return;
    this.runListService.copyEntry(this.projectNum, e.runId).subscribe({
      next: () => {
        this.loadRunList();
        this.snackBar.open('Run entry copied', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Copy failed', 'Close', { duration: 4000 })
    });
  }

  goBack(): void {
    this.router.navigate(['/home'], { state: { projectNum: this.projectNum } });
  }
}
