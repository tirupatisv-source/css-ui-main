import { Component, OnInit, ChangeDetectorRef, Optional, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import { AdminService } from '../../core/services/admin.service';
import { EarthquakeZone, MasterPart, MaterialCategory } from '../../core/models/models';

interface AssocRow {
  compPartId?: number;
  assocPartId: number;
  qty: number;
  partDesc: string;
  orderParm: string;
  partNum: string;
}

@Component({
  selector: 'app-admin-part-association',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    MatTableModule, MatProgressSpinnerModule, MatTooltipModule, MatSnackBarModule
  ],
  template: `
    <div class="nav-header secondary-nav-header">
      <button mat-button class="back-btn nav-item back-button" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon><span>Back to Admin</span>
      </button>
      <h1 class="page-title">Part Association</h1>
    </div>

    <div class="shell" *ngIf="!loading; else spinnerTpl">

      <!-- ── Top controls ── -->
      <div class="top-band">
        <div class="top-left">

          <div class="ctrl-row">
            <label class="ctrl-lbl">Material Category:</label>
            <mat-form-field appearance="outline" class="ctrl-field">
              <mat-select [(ngModel)]="selCompCatId" (selectionChange)="onCompCatChange()" panelClass="simple-drp">
                <mat-option *ngFor="let c of materialCategories" [value]="c.catId">{{ c.category }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="ctrl-row">
            <label class="ctrl-lbl">Component to Associate Parts With:</label>
            <mat-form-field appearance="outline" class="ctrl-field comp-field">
              <mat-select #compSelect [(ngModel)]="selCompId" (selectionChange)="onCompChange(); compSelect.close()" panelClass="comp-drp">
                <mat-select-trigger>{{ selPartDesc(selCompId) }}</mat-select-trigger>
                <mat-option *ngIf="partsLoading" class="comp-loading-opt" disabled>
                  <div class="drp-loading">
                    <mat-spinner diameter="24"></mat-spinner>
                    <span class="drp-loading-txt">Loading...</span>
                  </div>
                </mat-option>
                <ng-container *ngIf="!partsLoading">
                  <mat-option class="comp-hdr" disabled value="">
                    <div class="drp-row">
                      <span class="c1">Description</span>
                      <span class="c2">Ordering Parameter</span>
                      <span class="c3">Part #</span>
                    </div>
                  </mat-option>
                  <mat-option *ngFor="let p of compOptions" [value]="p.partId">
                    <div class="drp-row">
                      <span class="c1">{{ p.partDesc }}</span>
                      <span class="c2">{{ p.orderParm || '-' }}</span>
                      <span class="c3">{{ p.partNum || '-' }}</span>
                    </div>
                  </mat-option>
                </ng-container>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="ctrl-row">
            <label class="ctrl-lbl">Zone:</label>
            <mat-form-field appearance="outline" class="ctrl-field zone-field">
              <mat-select [(ngModel)]="selZoneId" (selectionChange)="onZoneChange()" panelClass="simple-drp">
                <mat-option *ngFor="let z of zones" [value]="z.eqId">{{ z.eqType }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

        </div>

        <fieldset class="copy-box">
          <legend>Copy Associated Parts From:</legend>

          <mat-form-field appearance="outline" class="ctrl-field copy-comp-field">
            <mat-select #copyCompSelect [(ngModel)]="copyCompId" panelClass="copy-comp-drp" (selectionChange)="onCopySourceChange(); copyCompSelect.close()">
              <mat-select-trigger>{{ selPartDesc(copyCompId) }}</mat-select-trigger>
              <mat-option *ngIf="partsLoading" class="comp-loading-opt" disabled>
                <div class="drp-loading">
                  <mat-spinner diameter="24"></mat-spinner>
                  <span class="drp-loading-txt">Loading...</span>
                </div>
              </mat-option>
              <ng-container *ngIf="!partsLoading">
                <mat-option class="comp-hdr" disabled value="">
                  <div class="drp-row">
                    <span class="c1">Description</span>
                    <span class="c2">Ordering Parameter</span>
                    <span class="c3">Part #</span>
                  </div>
                </mat-option>
                <mat-option *ngFor="let p of compOptions" [value]="p.partId">
                  <div class="drp-row">
                    <span class="c1">{{ p.partDesc }}</span>
                    <span class="c2">{{ p.orderParm || '-' }}</span>
                    <span class="c3">{{ p.partNum || '-' }}</span>
                  </div>
                </mat-option>
              </ng-container>
            </mat-select>
          </mat-form-field>
          <div class="copy-zone-row">
            <span class="copy-zone-lbl">Zone:</span>
            <mat-form-field appearance="outline" class="ctrl-field copy-zone-field">
              <mat-select [(ngModel)]="copyZoneId" panelClass="simple-drp" (selectionChange)="onCopySourceChange()">
                <mat-option *ngFor="let z of zones" [value]="z.eqId">{{ z.eqType }}</mat-option>
              </mat-select>
            </mat-form-field>

            <button class="copy-btn" (click)="onCopyClick()" [disabled]="!copyCompId || !copyZoneId || copyLoading">
              <mat-icon *ngIf="copyLoading" class="spin-icon">sync</mat-icon>
              <mat-icon *ngIf="!copyLoading">content_copy</mat-icon>
              Copy
            </button>
          </div>
        </fieldset>
      </div>

      <!-- ── Main tables ── -->
      <div class="main-area">

        <!-- Left panel: Available Parts -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title-lbl">Material Category:</span>
            <mat-form-field appearance="outline" class="panel-cat-field">
              <mat-select [(ngModel)]="selAvailCatId" (selectionChange)="onAvailCatChange()" panelClass="simple-drp">
                <mat-option *ngFor="let c of materialCategories" [value]="c.catId">{{ c.category }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="tbl-scroll">
            <table mat-table [dataSource]="availParts" class="data-table">
              <ng-container matColumnDef="partDesc">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let r">{{ r.partDesc }}</td>
              </ng-container>
              <ng-container matColumnDef="orderParm">
                <th mat-header-cell *matHeaderCellDef>Ordering Parameter</th>
                <td mat-cell *matCellDef="let r">{{ r.orderParm || '' }}</td>
              </ng-container>
              <ng-container matColumnDef="partNum">
                <th mat-header-cell *matHeaderCellDef>Part Number</th>
                <td mat-cell *matCellDef="let r">{{ r.partNum || '' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="availCols"></tr>
              <tr mat-row *matRowDef="let r; columns: availCols"
                  [class.sel]="selAvailId === r.partId"
                  (click)="selAvailId = r.partId"></tr>
              <tr *matNoDataRow><td [attr.colspan]="3" class="no-data">No parts for selected category</td></tr>
            </table>
          </div>
        </div>

        <!-- Center: Arrow buttons -->
        <div class="arrows">
          <button class="arr-btn" (click)="addSelected()" [disabled]="!selAvailId || !selCompId" matTooltip="Add selected to Associated Parts">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <button class="arr-btn" (click)="removeSelected()" [disabled]="!selAssocId" matTooltip="Remove selected from Associated Parts">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button class="arr-btn" (click)="removeAll()" [disabled]="!assocParts.length" matTooltip="Remove all associated parts">
            <mat-icon>delete</mat-icon>
          </button>
        </div>

        <!-- Right panel: Associated Parts -->
        <div class="panel">
          <div class="panel-head assoc-head">
            <span class="panel-title-lbl">Associated Parts:</span>
          </div>
          <div class="tbl-scroll assoc-scroll">
            <table mat-table [dataSource]="assocParts" class="data-table">

              <ng-container matColumnDef="qty">
                <th mat-header-cell *matHeaderCellDef class="qty-hdr">Qty</th>
                <td mat-cell *matCellDef="let r" class="qty-cell">
                  <input *ngIf="editId === r.assocPartId; else qtyText"
                         class="qty-inp" type="number" min="0" step="0.01"
                         [(ngModel)]="r.qty" (click)="$event.stopPropagation()">
                  <ng-template #qtyText>{{ r.qty | number:'1.2-2' }}</ng-template>
                </td>
              </ng-container>

              <ng-container matColumnDef="partDesc">
                <th mat-header-cell *matHeaderCellDef>Associated Part</th>
                <td mat-cell *matCellDef="let r">{{ r.partDesc }}</td>
              </ng-container>

              <ng-container matColumnDef="orderParm">
                <th mat-header-cell *matHeaderCellDef>Ordering Parameter</th>
                <td mat-cell *matCellDef="let r">{{ r.orderParm || '' }}</td>
              </ng-container>

              <ng-container matColumnDef="partNum">
                <th mat-header-cell *matHeaderCellDef>Part Number</th>
                <td mat-cell *matCellDef="let r">{{ r.partNum || '' }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="assocCols"></tr>
              <tr mat-row *matRowDef="let r; columns: assocCols"
                  [class.sel]="selAssocId === r.assocPartId"
                  (click)="onAssocClick(r)"
                  (dblclick)="onAssocDbl(r)"></tr>
              <tr *matNoDataRow><td [attr.colspan]="4" class="no-data">
                {{ selCompId && selZoneId ? 'No associated parts' : 'Select Component and Zone' }}
              </td></tr>
            </table>
            <div class="table-overlay" *ngIf="assocLoading">
              <mat-spinner diameter="36"></mat-spinner>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Footer ── -->
      <div class="footer">
        <button class="foot-btn" (click)="save()" [disabled]="isSaving || !canSave()">
          <mat-icon *ngIf="isSaving" class="spin-icon">sync</mat-icon>Save
        </button>
        <button class="foot-btn cancel" (click)="cancel()" [disabled]="isSaving">Cancel</button>
      </div>

    </div>

    <!-- Copy confirm dialog -->
    <div class="dlg-backdrop" *ngIf="showCopyDlg" (click)="cancelCopy()">
      <div class="dlg-box" (click)="$event.stopPropagation()">
        <div class="dlg-title">Copy Associations</div>
        <div class="dlg-body" [innerText]="copyDlgText"></div>
        <div class="dlg-actions">
          @if (copyDlgPartCount === 0) {
            <button class="dlg-btn close" (click)="cancelCopy()">Close</button>
          } @else {
            <button class="dlg-btn yes" (click)="confirmCopy()">Yes</button>
            <button class="dlg-btn no"  (click)="cancelCopy()">No</button>
          }
        </div>
      </div>
    </div>

    <ng-template #spinnerTpl>
      <div class="full-spin">
        <mat-spinner diameter="48"></mat-spinner>
        <p class="spinner-text">Loading parts...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display:flex; flex-direction:column; height:100%; width:100%; overflow:hidden; background:#fff; }

    /* ── Nav header ── */
    .nav-header { display:flex; align-items:center; justify-content:space-between; padding:10px 20px; background:#fff; border-bottom:1px solid #e0e0e0; flex-shrink:0; margin-left:11px; }
    /* Match specificity of global button[mat-button]:not([color]) selector */
    button[mat-button].back-btn { color:#6b7280 !important; --mat-text-button-hover-state-layer-opacity: 0; --mat-text-button-focus-state-layer-opacity: 0; --mat-text-button-pressed-state-layer-opacity: 0; }
    button[mat-button].back-btn mat-icon { color:#6b7280 !important; }
    button[mat-button].back-btn:hover { color:#ff9800 !important; }
    button[mat-button].back-btn:hover mat-icon { color:#ff9800 !important; }
    
    .back-btn { display:flex; align-items:center; gap:8px; padding:8px 16px; border:none; background:transparent; color:#6b7280 !important; cursor:pointer; font-size:14px; font-weight:500; border-radius:8px; font-family:'Segoe UI',sans-serif; transition:all 0.2s ease; }
    .back-btn mat-icon { font-size:20px; width:20px; height:20px; color:#6b7280 !important; transition:color 0.2s; }
    .back-btn:hover { background:#f0f4f8 !important; color:#ff9800 !important; }
    .back-btn:hover mat-icon { color:#ff9800 !important; }
    .back-btn:active { background:#fff3e0 !important; color:#ff9800 !important; box-shadow:0 0 0 1.5px #ff9800 !important; }
    .back-btn:active mat-icon { color:#ff9800 !important; }
    .page-title { margin:0 0 0 auto; font-size:20px; font-weight:500; color:#8a4d00; margin-right:5px; }

    /* ── Shell ── */
    .shell { display:flex; flex-direction:column; flex:1; min-height:0; overflow:hidden; gap:0; padding-left:20px; padding-right:20px; padding-bottom:10px; padding-top: 10px; }

    /* ── Top band ── */
    .top-band { display:grid; grid-template-columns:1fr auto; gap:12px; padding:6px 20px 6px; border-bottom:1px solid #e5e7eb; flex-shrink:0; align-items:start; }
    .top-left { display:flex; flex-direction:column; gap:5px; }

    .ctrl-row { display:grid; grid-template-columns:235px 1fr; align-items:center; gap:8px; min-height:34px; }
    .ctrl-lbl { font-size:12px; font-weight:600; color:#374151; white-space:nowrap; }
    .ctrl-field { width:79%; max-width:340px; }
    .ctrl-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display:none; }
    .ctrl-field ::ng-deep .mat-mdc-text-field-wrapper { padding:0 8px; }
    .ctrl-field ::ng-deep .mat-mdc-form-field-flex { min-height:32px; max-height:32px; display:flex; align-items:center; }
    .ctrl-field ::ng-deep .mat-mdc-select-trigger { font-size:12px; height:32px; line-height:32px; display:flex; align-items:center; }
    .ctrl-field ::ng-deep .mat-mdc-select-arrow-wrapper { transform: scale(0.95); margin-right:4px; }
    .ctrl-field ::ng-deep .mdc-notched-outline__leading, 
    .ctrl-field ::ng-deep .mdc-notched-outline__notch,
    .ctrl-field ::ng-deep .mdc-notched-outline__trailing { border-color:#d1d5db; }
    .comp-field { min-width:240px; }
    .zone-field { max-width:340px; flex:0 0 auto; }

    /* ── Copy box ── */
    .copy-box { border:1px solid #d1d5db; border-radius:8px; padding:6px 10px 8px; margin:0 10px 0 -56px; min-width:530px; display:flex; flex-direction:column; gap:8px; align-self:flex-start; margin-top: -7px;}
    .copy-box legend { font-size:11px; font-weight:600; color:#374151; padding:0 4px; margin-bottom:2px; }
    .copy-comp-field { width:100%; max-width:none; }
    .copy-comp-field ::ng-deep .mat-mdc-form-field-flex { min-height:32px; max-height:32px; }
    .copy-comp-field ::ng-deep .mat-mdc-select-trigger { font-size:11px; height:32px; }
    .copy-comp-field ::ng-deep .mat-mdc-select:hover .mat-mdc-text-field-wrapper { background:#f1ece5 !important; }
    .copy-zone-row { display:flex; align-items:center; gap:8px; justify-content:space-between; flex:1; }
    .copy-zone-lbl { font-size:12px; font-weight:600; color:#374151; white-space:nowrap; }
    .copy-zone-field { width:140px; max-width:140px; }
    .copy-zone-field ::ng-deep .mat-mdc-select-trigger { font-size:11px; }
    .copy-zone-field ::ng-deep .mat-mdc-select:hover .mat-mdc-text-field-wrapper { background:#f1ece5 !important; }
    .copy-btn { align-self:center; margin-top:0; margin-left:auto; background:#ff9800; color:#fff; border:none; border-radius:4px; padding:0 10px; font-size:11px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:3px; height:28px; min-height:28px; font-family:'Segoe UI',sans-serif; }
    .copy-btn mat-icon { font-size:16px; width:16px; height:16px; }
    .copy-btn:hover:not(:disabled) { background:#e68900; }
    .copy-btn:disabled { background:#e0e0e0; color:#9ca3af; cursor:not-allowed; }

    /* ── Main area ── */
    .main-area { flex:1; min-height:0; display:grid; grid-template-columns:1fr 52px 1fr; gap:10px; padding:16px 20px 0; overflow:hidden; }
    .panel { display:flex; flex-direction:column; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; min-height:0; }

    .panel-head { display:flex; align-items:center; gap:8px; padding:5px 8px; border-bottom:1px solid #e5e7eb; flex-shrink:0; background:#fafafa; }
    .assoc-head { justify-content:space-between; }
    .panel-title-lbl { font-size:12px; font-weight:700; color:#8a4d00; white-space:nowrap; }
    .inline-spin { flex-shrink:0; }

    .panel-cat-field { flex:1; max-width:180px; }
    .panel-cat-field ::ng-deep .mat-mdc-form-field-subscript-wrapper { display:none; }
    .panel-cat-field ::ng-deep .mat-mdc-form-field-flex { min-height:32px; max-height:32px; display:flex; align-items:center; }
    .panel-cat-field ::ng-deep .mat-mdc-text-field-wrapper { padding:0 8px; }
    .panel-cat-field ::ng-deep .mat-mdc-select-trigger { font-size:12px; height:32px; line-height:32px; display:flex; align-items:center; }
    .panel-cat-field ::ng-deep .mat-mdc-select-arrow-wrapper { transform: scale(0.95); margin-right:4px; }
    .panel-cat-field ::ng-deep .mdc-notched-outline__leading,
    .panel-cat-field ::ng-deep .mdc-notched-outline__notch,
    .panel-cat-field ::ng-deep .mdc-notched-outline__trailing { border-color:#d1d5db; }
    .panel-cat-field ::ng-deep .mat-mdc-select:hover .mat-mdc-text-field-wrapper { background:#f1ece5 !important; }

    .tbl-scroll { flex:1; min-height:0; overflow:auto; }
    .assoc-scroll { position: relative; }

    .table-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.58);
      z-index: 2;
      pointer-events: none;
    }

    /* ── Data table ── */
    .data-table { width:100%; }
    .data-table th.mat-mdc-header-cell { position:sticky; top:0; z-index:1; background:#f5f5f5; color:#8a4d00; font-size:12px; font-weight:700; padding:7px 8px; border-bottom:2px solid #ff9800; white-space:nowrap; }
    .data-table td.mat-mdc-cell { font-size:12px; padding:6px 8px; border-bottom:1px solid #f0f0f0; color:#374151; }
    .data-table tr.mat-mdc-row:hover td { background:#f1ece5; }
    .data-table tr.sel td { background:#ffe8cc !important; }
    .qty-hdr { width:62px; min-width:62px; text-align:right; }
    .qty-cell { text-align:right; padding-right:10px !important; }
    .qty-inp { width:62px; border:1px solid #ff9800; border-radius:3px; padding:3px 4px; font-size:12px; color:#374151; text-align:right; outline:none; background:#fffbf5; }
    .no-data { text-align:center; color:#9ca3af; font-style:italic; padding:20px; font-size:12px; }

    /* ── Arrows column ── */
    .arrows { display:flex; flex-direction:column; justify-content:center; align-items:center; gap:8px; }
    .arr-btn { width:40px; height:40px; min-width:40px; border-radius:6px; border:none; background:#ff9800; color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 6px rgba(255,152,0,.25); transition:background .15s; }
    .arr-btn mat-icon { font-size:22px; width:22px; height:22px; }
    .arr-btn:hover:not(:disabled) { background:#e68900; }
    .arr-btn:disabled { background:#e0e0e0; color:#9ca3af; box-shadow:none; cursor:not-allowed; }

    /* ── Footer ── */
    .footer { display:flex; justify-content:flex-end; gap:8px; padding:8px 14px 8px; border-top:1px solid #e5e7eb; flex-shrink:0; }
    .foot-btn { background:#ff9800; color:#fff; border:none; border-radius:4px; padding:6px 16px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Segoe UI',sans-serif; display:flex; align-items:center; gap:4px; }
    .foot-btn:hover:not(:disabled) { background:#e68900; }
    .foot-btn:disabled { background:#d1d5db; color:#9ca3af; cursor:not-allowed; }
    .foot-btn.cancel { background:#d1d5db; color:#374151; }
    .foot-btn.cancel:hover:not(:disabled) { background:#bfc4cc; }

    /* ── Copy confirm dialog ── */
    .dlg-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:9999; display:flex; align-items:center; justify-content:center; }
    .dlg-box { background:#fff; border-radius:8px; padding:20px 24px; min-width:320px; max-width:460px; box-shadow:0 8px 24px rgba(0,0,0,.2); }
    .dlg-title { font-size:15px; font-weight:700; color:#374151; margin-bottom:12px; }
    .dlg-body { font-size:13px; color:#4b5563; white-space:pre-line; margin-bottom:18px; line-height:1.6; }
    .dlg-actions { display:flex; gap:10px; justify-content:flex-end; }
    .dlg-btn { padding:5px 18px; border:none; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer; font-family:'Segoe UI',sans-serif; }
    .dlg-btn.yes { background:#ff9800; color:#fff; }
    .dlg-btn.yes:hover { background:#e68900; }
    .dlg-btn.no { background:#d1d5db; color:#374151; }
    .dlg-btn.no:hover { background:#bfc4cc; }
    .dlg-btn.close { background:#ff9800; color:#fff; }
    .dlg-btn.close:hover { background:#e68900; }

    /* ── Full screen spinner ── */
    .full-spin { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; }
    .spinner-text { margin:0; font-size:16px; color:#6b7280; font-weight:500; font-family:'Segoe UI','Roboto','Arial',sans-serif; }
    .spin-icon { animation:spin .8s linear infinite; font-size:16px; width:16px; height:16px; }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

    /* ── Component dropdown panel ── */
    :host ::ng-deep .comp-drp { min-width:700px !important; max-width:780px !important; margin-left:0 !important; overflow-x:hidden !important; overflow-y:auto !important; }
    :host ::ng-deep .copy-comp-drp { min-width:640px !important; max-width:720px !important; margin-left:-80px !important; overflow-x:auto !important; overflow-y:auto !important; }
    :host ::ng-deep .copy-comp-drp .mdc-list {
      width: max-content !important;
      min-width: 100% !important;
      overflow-x: auto !important;
      overflow-y: auto !important;
    }
    :host ::ng-deep .copy-comp-drp::-webkit-scrollbar,
    :host ::ng-deep .copy-comp-drp .mdc-list::-webkit-scrollbar { height:10px; }
    :host ::ng-deep .copy-comp-drp::-webkit-scrollbar-thumb,
    :host ::ng-deep .copy-comp-drp .mdc-list::-webkit-scrollbar-thumb { background:#b6bbc4; border-radius:8px; }
    :host ::ng-deep .copy-comp-drp::-webkit-scrollbar-track,
    :host ::ng-deep .copy-comp-drp .mdc-list::-webkit-scrollbar-track { background:#eef0f4; }

    :host ::ng-deep .comp-drp .mat-mdc-option,
    :host ::ng-deep .copy-comp-drp .mat-mdc-option { min-height:36px; padding:0 12px; font-size:12px !important; display:flex; align-items:flex-start; }
    :host ::ng-deep .copy-comp-drp .mat-mdc-option { width:max-content !important; min-width:100% !important; }
    :host ::ng-deep .comp-drp .mat-mdc-option.comp-hdr,
    :host ::ng-deep .copy-comp-drp .mat-mdc-option.comp-hdr { background:#f5f5f5 !important; font-weight:700 !important; color:#111111 !important; pointer-events:none; border-bottom:1px solid #e5e7eb; }
    :host ::ng-deep .comp-drp .mat-mdc-option.comp-hdr .c1,
    :host ::ng-deep .comp-drp .mat-mdc-option.comp-hdr .c2,
    :host ::ng-deep .comp-drp .mat-mdc-option.comp-hdr .c3,
    :host ::ng-deep .copy-comp-drp .mat-mdc-option.comp-hdr .c1,
    :host ::ng-deep .copy-comp-drp .mat-mdc-option.comp-hdr .c2,
    :host ::ng-deep .copy-comp-drp .mat-mdc-option.comp-hdr .c3 { color:#111111 !important; font-weight:700 !important; }
    :host ::ng-deep .comp-drp .comp-loading-opt,
    :host ::ng-deep .copy-comp-drp .comp-loading-opt { min-height:120px; pointer-events:none; }
    :host ::ng-deep .comp-drp .comp-loading-opt .mdc-list-item__primary-text,
    :host ::ng-deep .copy-comp-drp .comp-loading-opt .mdc-list-item__primary-text { width:100%; display:flex; justify-content:center; }
    :host ::ng-deep .comp-drp .drp-loading,
    :host ::ng-deep .copy-comp-drp .drp-loading { width:100%; min-height:90px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; }
    :host ::ng-deep .comp-drp .drp-loading-txt,
    :host ::ng-deep .copy-comp-drp .drp-loading-txt { font-size:12px; color:#374151; font-weight:600; }
    :host ::ng-deep .comp-drp .mat-mdc-option:hover:not(.mdc-list-item--disabled),
    :host ::ng-deep .copy-comp-drp .mat-mdc-option:hover:not(.mdc-list-item--disabled) { background:#f1ece5 !important; }
    :host ::ng-deep .comp-drp .mat-mdc-option.mat-selected,
    :host ::ng-deep .copy-comp-drp .mat-mdc-option.mat-selected { background:#ffe8cc !important; }
    :host ::ng-deep .comp-drp .mat-pseudo-checkbox,
    :host ::ng-deep .copy-comp-drp .mat-pseudo-checkbox { display:none !important; }
    :host ::ng-deep .comp-drp .drp-row,
    :host ::ng-deep .copy-comp-drp .drp-row {
      width: 100%;
      min-width: 700px;
      display: grid;
      grid-template-columns: 360px 190px 140px;
      gap: 8px;
      align-items: start;
      padding: 0;
    }
    :host ::ng-deep .copy-comp-drp .drp-row { width:max-content; min-width: 860px; }
    :host ::ng-deep .comp-drp .c1,
    :host ::ng-deep .copy-comp-drp .c1 {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      line-height: 1.25;
      max-height: 2.5em;
      padding-left: 0;
    }
    :host ::ng-deep .comp-drp .c2,
    :host ::ng-deep .copy-comp-drp .c2 { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#4b5563; padding-left:0; }
    :host ::ng-deep .comp-drp .c3,
    :host ::ng-deep .copy-comp-drp .c3 { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#4b5563; font-family:monospace; text-align:left; padding-left:0; }

    /* ── Simple dropdown style parity with master parts search dropdown ── */
    :host ::ng-deep .simple-drp .mat-mdc-option {
      font-size: 13px !important;
      color: #374151 !important;
      min-height: 36px !important;
    }
    :host ::ng-deep .simple-drp .mat-mdc-option:hover:not(.mdc-list-item--disabled),
    :host ::ng-deep .simple-drp .mat-mdc-option.mat-mdc-option-active.mdc-list-item,
    :host ::ng-deep .simple-drp .mat-mdc-option.mat-selected {
      background-color: #f1ece5 !important;
      color: #374151 !important;
    }
  `]
})
export class PartAssociationComponent implements OnInit {
  @ViewChild('compSelect') compSelectRef?: MatSelect;
  @ViewChild('copyCompSelect') copyCompSelectRef?: MatSelect;
  @ViewChildren(MatSelect) allSelects?: QueryList<MatSelect>;

  loading = true;
  assocLoading = false;
  partsLoading = false;
  copyLoading = false;
  isSaving = false;

  materialCategories: MaterialCategory[] = [];
  zones: EarthquakeZone[] = [];
  private allParts: MasterPart[] = [];
  private partById = new Map<number, MasterPart>();
  private copySourceCache = new Map<string, AssocRow[]>();
  private copySourceInFlight = new Set<string>();

  /* top controls - all null by default (empty) */
  selCompCatId: number | null = null;
  selCompId: number | null = null;
  selZoneId: number | null = null;

  /* copy from */
  copyCompId: number | null = null;
  copyZoneId: number | null = null;

  /* left panel */
  selAvailCatId: number | null = null;

  /* derived lists */
  compOptions: MasterPart[] = [];
  availParts: MasterPart[] = [];
  assocParts: AssocRow[] = [];
  private origAssocParts: AssocRow[] = [];

  /* selection */
  selAvailId: number | null = null;
  selAssocId: number | null = null;
  editId: number | null = null;

  /* copy dialog */
  showCopyDlg = false;
  copyDlgText = '';
  copyDlgPartCount = 0;  // Track part count for conditional button display
  private pendingCopy: AssocRow[] = [];

  readonly availCols = ['partDesc', 'orderParm', 'partNum'];
  readonly assocCols = ['qty', 'partDesc', 'orderParm', 'partNum'];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Optional() private dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    // Start parts loading immediately so dropdown data appears sooner.
    this.loadParts();

    // Phase 1: load categories+zones quickly, show UI
    forkJoin({
      cats: this.adminService.getMaterialCategories(),
      zones: this.adminService.getEarthquakeZones()
    }).subscribe({
      next: ({ cats, zones }) => {
        this.materialCategories = (cats ?? []).sort((a, b) => a.category.localeCompare(b.category));
        this.zones = (zones ?? []).sort((a, b) => a.eqType.localeCompare(b.eqType));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load categories / zones', 'Close', { duration: 3500 });
      }
    });
  }

  private loadParts(): void {
    this.partsLoading = true;
    this.adminService.getParts().subscribe({
      next: (parts) => {
        this.allParts = (parts ?? []).sort((a, b) => (a.partDesc ?? '').localeCompare(b.partDesc ?? ''));
        this.partById.clear();
        this.allParts.forEach(p => this.partById.set(p.partId, p));
        this.refreshCompOptions();
        this.refreshAvailParts();
        this.partsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.partsLoading = false;
        this.snackBar.open('Failed to load parts list', 'Close', { duration: 3000 });
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const insidePanel = !!target.closest('.mat-mdc-select-panel');
    const insideTrigger = !!target.closest('.mat-mdc-select-trigger');
    if (insidePanel || insideTrigger) return;

    this.allSelects?.forEach(select => {
      if (select.panelOpen) select.close();
    });
  }

  goBack(): void {
    this.dialogRef?.close();
    this.router.navigate(['/admin']);
  }

  selPartDesc(partId: number | null): string {
    if (!partId) return '';
    return this.partById.get(partId)?.partDesc ?? String(partId);
  }

  /* ── Top controls events ── */

  onCompCatChange(): void {
    this.selCompId = null;
    this.assocParts = [];
    this.origAssocParts = [];
    this.refreshCompOptions();
    this.refreshAvailParts();
  }

  onCompChange(): void {
    if (this.selZoneId !== null) this.loadAssociations();
    this.refreshAvailParts();
  }

  onZoneChange(): void {
    this.loadAssociations();
  }

  onAvailCatChange(): void {
    this.refreshAvailParts();
  }

  onCopySourceChange(): void {
    this.prefetchCopySource();
  }

  private prefetchCopySource(): void {
    if (!this.copyCompId || !this.copyZoneId) return;
    const cacheKey = `${this.copyCompId}-${this.copyZoneId}`;
    if (this.copySourceCache.has(cacheKey) || this.copySourceInFlight.has(cacheKey)) return;

    this.copySourceInFlight.add(cacheKey);
    this.adminService.getComponentParts(this.copyCompId, this.copyZoneId).subscribe({
      next: (rows) => {
        const mapped = (rows ?? []).map(r => this.toRow(r));
        this.copySourceCache.set(cacheKey, mapped.map(r => ({ ...r })));
        this.copySourceInFlight.delete(cacheKey);
      },
      error: () => {
        this.copySourceInFlight.delete(cacheKey);
      }
    });
  }

  private refreshCompOptions(): void {
    const catId = this.selCompCatId;
    this.compOptions = this.allParts
      .filter(p => p.active && (catId == null || p.categoryId === catId))
      .sort((a, b) => (a.partDesc ?? '').localeCompare(b.partDesc ?? ''));
  }

  private refreshAvailParts(): void {
    const catId = this.selAvailCatId;
    if (catId == null) {
      this.availParts = [];
      this.selAvailId = null;
      return;
    }

    // Legacy behavior: keep all category parts visible on the left,
    // even if already present in the associated-parts table.
    this.availParts = this.allParts
      .filter(p => p.active && !p.kit)
      .filter(p => p.categoryId === catId)
      .filter(p => p.partId !== this.selCompId)
      .sort((a, b) => (a.partDesc ?? '').localeCompare(b.partDesc ?? ''));
    if (this.selAvailId && !this.availParts.some(p => p.partId === this.selAvailId)) {
      this.selAvailId = null;
    }
  }

  private toRow(raw: any): AssocRow {
    const p = this.partById.get(Number(raw.assocPartId));
    return {
      compPartId: raw.compPartId ?? raw.compPartId,
      assocPartId: Number(raw.assocPartId),
      qty: Number(raw.qty ?? 0),
      partDesc: p?.partDesc ?? raw.associatedPartDesc ?? '',
      orderParm: p?.orderParm ?? '',
      partNum: p?.partNum ?? ''
    };
  }

  private loadAssociations(): void {
    if (!this.selCompId || !this.selZoneId) {
      this.assocParts = [];
      this.origAssocParts = [];
      this.refreshAvailParts();
      return;
    }
    this.assocLoading = true;
    this.adminService.getComponentParts(this.selCompId, this.selZoneId).subscribe({
      next: (rows) => {
        const mapped = (rows ?? []).map(r => this.toRow(r));
        this.assocParts = mapped;
        this.origAssocParts = mapped.map(r => ({ ...r }));
        this.selAssocId = null;
        this.editId = null;
        this.refreshAvailParts();
        this.assocLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.assocLoading = false;
        this.snackBar.open('Failed to load associations', 'Close', { duration: 3000 });
      }
    });
  }

  /* ── Arrow actions ── */

  addSelected(): void {
    if (!this.selAvailId || !this.selCompId) return;
    const p = this.partById.get(this.selAvailId);
    if (!p) return;

    const alreadyAssociated = this.assocParts.some(r => r.assocPartId === p.partId);
    if (alreadyAssociated) {
      this.snackBar.open('Selected part is already in associated parts', 'Close', { duration: 2200 });
      return;
    }

    this.assocParts = [...this.assocParts, { assocPartId: p.partId, qty: 1, partDesc: p.partDesc ?? '', orderParm: p.orderParm ?? '', partNum: p.partNum ?? '' }];
    this.selAssocId = p.partId;
    this.selAvailId = null;
    this.refreshAvailParts();
  }

  removeSelected(): void {
    if (!this.selAssocId) return;
    this.assocParts = this.assocParts.filter(r => r.assocPartId !== this.selAssocId);
    this.selAssocId = null;
    this.editId = null;
    this.refreshAvailParts();
  }

  removeAll(): void {
    this.assocParts = [];
    this.selAssocId = null;
    this.editId = null;
    this.refreshAvailParts();
  }

  onAssocClick(row: AssocRow): void {
    this.selAssocId = row.assocPartId;
  }

  onAssocDbl(row: AssocRow): void {
    this.selAssocId = row.assocPartId;
    this.editId = row.assocPartId;
  }

  /* ── Copy ── */

  onCopyClick(): void {
    if (!this.copyCompId || !this.copyZoneId) {
      this.snackBar.open('Select a component and zone to copy from', 'Close', { duration: 2500 });
      return;
    }
    if (this.copyCompId === this.selCompId && this.copyZoneId === this.selZoneId) {
      this.snackBar.open('Cannot copy from the same component/zone', 'Close', { duration: 2500 });
      return;
    }

    const cacheKey = `${this.copyCompId}-${this.copyZoneId}`;
    const cachedRows = this.copySourceCache.get(cacheKey);
    if (cachedRows) {
      this.pendingCopy = cachedRows.map(r => ({ ...r }));
      this.openCopyConfirmDialog(cachedRows.length);
      return;
    }

    this.copyLoading = true;
    this.adminService.getComponentParts(this.copyCompId, this.copyZoneId).subscribe({
      next: (rows) => {
        this.copyLoading = false;
        if (!rows?.length) {
          const compDesc = this.selPartDesc(this.copyCompId);
          const zoneDesc = this.zones.find(z => z.eqId === this.copyZoneId)?.eqType ?? '';
          this.snackBar.open(`No parts associated with "${compDesc}" for Zone "${zoneDesc}"`, 'Close', { duration: 3500 });
          return;
        }
        const mapped = rows.map(r => this.toRow(r));
        this.copySourceCache.set(cacheKey, mapped.map(r => ({ ...r })));
        this.pendingCopy = mapped;
        this.openCopyConfirmDialog(rows.length);
      },
      error: () => { this.copyLoading = false; this.snackBar.open('Failed to load copy source', 'Close', { duration: 3000 }); }
    });
  }

  private openCopyConfirmDialog(partCount: number): void {
    const compDesc = this.selPartDesc(this.copyCompId);
    const zoneDesc = this.zones.find(z => z.eqId === this.copyZoneId)?.eqType ?? '';
    
    this.copyDlgPartCount = partCount;
    
    if (partCount === 0) {
      // When 0 parts, show a simple message without the copy prompt
      this.copyDlgText = `Selected Part: ${compDesc}\nZone: ${zoneDesc}\n\nNo additional associated parts to copy.`;
    } else {
      // When there are parts, show the copy prompt
      this.copyDlgText = `Selected Part: ${compDesc}\nZone: ${zoneDesc}\nAssociated Parts Count: ${partCount}\n\nDo you want to copy?`;
    }
    
    this.showCopyDlg = true;
    // Force immediate display with change detection
    this.cdr.detectChanges();
  }

  confirmCopy(): void {
    const existing = new Set(this.assocParts.map(r => r.assocPartId));
    let dups = 0;
    const rowsToAdd: AssocRow[] = [];
    for (const row of this.pendingCopy) {
      if (existing.has(row.assocPartId)) {
        dups++;
        continue;
      }
      existing.add(row.assocPartId);
      rowsToAdd.push({ ...row, compPartId: undefined });
    }
    if (rowsToAdd.length) this.assocParts = [...this.assocParts, ...rowsToAdd];
    if (dups > 0) this.snackBar.open(`${dups} duplicate part(s) were not copied`, 'Close', { duration: 3000 });
    this.refreshAvailParts();
    this.showCopyDlg = false;
    this.pendingCopy = [];
  }

  cancelCopy(): void {
    this.showCopyDlg = false;
    this.pendingCopy = [];
  }

  /* ── Save / Cancel ── */

  canSave(): boolean { return !!this.selCompId && !!this.selZoneId; }

  save(): void {
    if (!this.selCompId || !this.selZoneId) {
      this.snackBar.open('Select Component and Zone before saving', 'Close', { duration: 3000 });
      return;
    }
    const origByAssoc = new Map<number, AssocRow>();
    this.origAssocParts.forEach(r => origByAssoc.set(r.assocPartId, r));
    const curByAssoc = new Map<number, AssocRow>();
    this.assocParts.forEach(r => curByAssoc.set(r.assocPartId, r));
    const ops: Observable<unknown>[] = [];
    this.assocParts.forEach(row => {
      const orig = origByAssoc.get(row.assocPartId);
      if (!orig) {
        ops.push(this.adminService.createComponentPart({ partId: this.selCompId as number, assocPartId: row.assocPartId, qty: row.qty, eqId: this.selZoneId as number }));
      } else if (Math.abs(row.qty - orig.qty) > 0.00001) {
        ops.push(this.adminService.updateComponentPart(orig.compPartId as number, { partId: this.selCompId as number, assocPartId: row.assocPartId, qty: row.qty, eqId: this.selZoneId as number }));
      }
    });
    this.origAssocParts.forEach(orig => {
      if (!curByAssoc.has(orig.assocPartId)) ops.push(this.adminService.deleteComponentPart(orig.compPartId as number));
    });
    if (!ops.length) { this.snackBar.open('No changes to save', 'Close', { duration: 2200 }); return; }
    this.isSaving = true;
    forkJoin(ops).subscribe({
      next: () => { this.isSaving = false; this.snackBar.open('Saved successfully', 'Close', { duration: 3000 }); this.loadAssociations(); },
      error: (err) => { this.isSaving = false; this.snackBar.open(err?.error?.message || 'Save failed', 'Close', { duration: 3500 }); }
    });
  }

  cancel(): void { this.loadAssociations(); }
}
