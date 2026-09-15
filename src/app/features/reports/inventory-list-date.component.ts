import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportDataService } from '../../core/services/report-data.service';
import { InventoryDateViewData, InventoryDateItem } from '../../core/models/models';

/**
 * Converted from VB6: rptInventoryDate report.
 * Displays a formatted inventory list for a project, sorted by vendor then part number.
 * Columns: Item | Vendor | Part Number | SAP Item Id | Description | Quantity | UOM | Date
 */
@Component({
  selector: 'app-inventory-list-date',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <!-- Navigation Header (hidden on print) -->
    <div class="nav-header no-print">
      <button mat-button class="back-link" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        <span>Back to Reports: {{ projectNum }}</span>
      </button>
      <div class="header-actions">
        <button mat-stroked-button class="print-btn" (click)="printReport()" [disabled]="loading()">
          <mat-icon>print</mat-icon>
          Print
        </button>
      </div>
    </div>

    <div class="content-area">
      @if (loading()) {
        <div class="loading-overlay">
          <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
          <p>Loading Inventory List...</p>
        </div>
      } @else if (error()) {
        <div class="error-state no-print">
          <mat-icon>error_outline</mat-icon>
          <p>{{ error() }}</p>
          <button mat-stroked-button (click)="loadData()">Retry</button>
        </div>
      } @else {
        <!-- Printable Report Area -->
        <div class="report-page" id="inventory-list-date-report">

        <!-- Report Header -->
        <div class="report-header">
          <div class="logo-area">
            <img [src]="logoPath" alt="Lumen" class="report-logo" />
          </div>
          <h1 class="report-title">Inventory List (Date Rec'd)</h1>
          <div class="header-rule"></div>
        </div>

        <!-- Project Info Block -->
        <div class="project-info">
          <div class="info-row">
            <span class="info-label">Location:</span>
            <span class="info-value">{{ locationStr() }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Project Number:</span>
            <span class="info-value">{{ viewData()?.project?.projectNum }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date of Issue:</span>
            <span class="info-value">{{ dateOfIssue() }}</span>
          </div>
        </div>

        <!-- Inventory Table -->
        @if (viewData()?.items?.length === 0) {
          <div class="no-items">
            <mat-icon class="no-print">inventory_2</mat-icon>
            <p>No inventory items found for this project.</p>
          </div>
        } @else {
          <table class="inventory-table">
            <thead>
              <tr>
                <th class="col-item">Item</th>
                <th class="col-vendor">Vendor</th>
                <th class="col-partnum">Part Number</th>
                <th class="col-sapid">SAP Item Id</th>
                <th class="col-desc">Description</th>
                <th class="col-qty">Quantity</th>
                <th class="col-uom">UOM</th>
                <th class="col-date">Date</th>
              </tr>
            </thead>
            <tbody>
              @for (item of viewData()!.items; track item.itemNum) {
                <tr>
                  <td class="col-item">{{ item.itemNum }}</td>
                  <td class="col-vendor">{{ item.vendor }}</td>
                  <td class="col-partnum">{{ item.partNum }}</td>
                  <td class="col-sapid">{{ item.sapItemId }}</td>
                  <td class="col-desc">{{ item.description }}</td>
                  <td class="col-qty">{{ formatQty(item.quantity) }}</td>
                  <td class="col-uom">{{ item.uom }}</td>
                  <td class="col-date">{{ item.dateReceived || '' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }

          <!-- Report Footer -->
          <div class="report-footer">
            <span class="footer-date">{{ todayLong() }}</span>
            <span class="footer-pages">1 of 1</span>
          </div>

        </div>
      }
    </div>
  `,  
  styles: [`
    /* ── Navigation header ─────────────────────────────────────── */
    .nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 32px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
    }
    .back-link {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #374151;
      cursor: pointer;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 14px;
      font-weight: 500;
      gap: 8px;
    }
    .back-link:hover { background-color: #f0f4f8; color: #ff9800; }
    .back-link mat-icon { font-size: 20px; width: 20px; height: 20px; color: #6b7280; transition: color 0.2s; }
    .back-link:hover mat-icon { color: #ff9800; }
    .header-actions { display: flex; gap: 8px; }
    .print-btn { color: #374151; }
    .print-btn mat-icon { margin-right: 4px; font-size: 18px; width: 18px; height: 18px; }

    /* ── Scrollable content area ───────────────────────────────── */
    .content-area {
      height: calc(100vh - 57px);
      overflow-y: auto;
      background: #f0f2f5;
      padding: 32px 24px 48px;
    }

    /* ── Report page (paper card) ──────────────────────────────── */
    .report-page {
      max-width: 960px;
      margin: 0 auto;
      padding: 40px 48px 48px;
      background: #fff;
      font-family: Arial, sans-serif;
      box-shadow: 0 1px 4px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08);
    }

    /* ── Report header ─────────────────────────────────────────── */
    .report-header { margin-bottom: 24px; text-align: center; padding-top: 32px; }
    .logo-area { margin-bottom: 12px; }
    .report-logo {
      height: 36px;
      width: auto;
      display: block;
      margin: 0 auto;
      filter:
        drop-shadow(1px 1px 0px rgba(0,0,0,0.25))
        drop-shadow(2px 2px 0px rgba(0,0,0,0.15))
        drop-shadow(3px 3px 4px rgba(0,0,0,0.12));
      transform: perspective(300px) rotateX(6deg);
      transform-origin: center bottom;
    }
    .report-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
      text-align: center;
      margin: 10px 0 8px;
    }
    .header-rule {
      border: none;
      border-top: 2px solid #333;
      margin: 0;
    }

    /* ── Project info block ────────────────────────────────────── */
    .project-info {
      margin: 16px 0 12px;
    }
    .info-row {
      display: flex;
      gap: 8px;
      font-size: 13px;
      line-height: 1.8;
    }
    .info-label {
      font-weight: 700;
      min-width: 130px;
      color: #1a1a2e;
    }
    .info-value { color: #333; }

    /* ── Inventory table ───────────────────────────────────────── */
    .inventory-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-top: 4px;
    }
    .inventory-table thead tr {
      border-bottom: 2px solid #333;
    }
    .inventory-table th {
      font-size: 12px;
      font-weight: 700;
      color: #1a1a2e;
      padding: 6px 6px 6px 4px;
      text-align: left;
      white-space: nowrap;
    }
    .inventory-table td {
      padding: 4px 6px 4px 4px;
      vertical-align: top;
      color: #333;
      border-bottom: none;
      line-height: 1.4;
    }
    .inventory-table tbody tr:nth-child(even) { background: transparent; }

    /* Column widths — use .inventory-table prefix for specificity over th/td base rules */
    .inventory-table .col-item    { width: 42px;  min-width: 42px;  text-align: right; padding-right: 14px; }
    .inventory-table .col-vendor  { width: 130px; min-width: 100px; }
    .inventory-table .col-partnum { width: 130px; min-width: 100px; word-break: break-word; }
    .inventory-table .col-sapid   { width: 90px;  min-width: 70px;  }
    .inventory-table .col-desc    { min-width: 180px; }
    .inventory-table .col-qty     { width: 72px;  min-width: 56px;  text-align: right; padding-right: 12px; }
    .inventory-table .col-uom     { width: 68px;  min-width: 52px;  }
    .inventory-table .col-date    { width: 68px;  min-width: 52px;  }

    /* ── Report footer ─────────────────────────────────────────── */
    .report-footer {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
      padding-top: 4px;
      font-size: 11px;
      font-style: italic;
      color: #555;
      border-top: none;
    }

    /* ── States ────────────────────────────────────────────────── */
    .no-items {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
      color: #888;
      gap: 8px;
    }
    .no-items mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      gap: 16px;
      color: #666;
    }
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 64px 0;
      gap: 12px;
      color: #c62828;
    }
    .error-state mat-icon { font-size: 40px; width: 40px; height: 40px; }

    /* ── Dark theme ────────────────────────────────────────────── */
    :host-context([data-theme="dark"]) .nav-header { background: #1e1e1e !important; border-bottom-color: #424242 !important; }
    :host-context([data-theme="dark"]) .back-link { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .back-link mat-icon { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .back-link:hover { background-color: #1a2a4a !important; }
    :host-context([data-theme="dark"]) .content-area { background: #121212 !important; }
    :host-context([data-theme="dark"]) .report-page { background: #1e1e1e !important; box-shadow: 0 1px 4px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3) !important; }
    :host-context([data-theme="dark"]) .report-logo { filter: invert(1) brightness(2) !important; }
    :host-context([data-theme="dark"]) .report-title { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .header-rule { border-top-color: #555 !important; }
    :host-context([data-theme="dark"]) .info-label { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .info-value { color: #bbb !important; }
    :host-context([data-theme="dark"]) .inventory-table th { color: #e0e0e0 !important; border-bottom-color: #555 !important; }
    :host-context([data-theme="dark"]) .inventory-table td { color: #bbb !important; }
    :host-context([data-theme="dark"]) .report-footer { color: #888 !important; }

    /* ── Print styles ──────────────────────────────────────────── */
    @media print {
      .no-print { display: none !important; }
      .content-area { height: auto !important; overflow: visible !important; background: #fff !important; padding: 0 !important; }
      .report-page { margin: 0; padding: 0 24px 32px; max-width: 100%; box-shadow: none !important; }
      .report-logo { height: 36px; }
      .report-title { font-size: 16px; }
      .inventory-table { font-size: 11px; }
      .inventory-table thead tr { border-bottom: 1.5px solid #000; }
      .inventory-table tbody tr { page-break-inside: avoid; }
    }
  `]
})
export class InventoryListDateComponent implements OnInit {
  projectNum = '';
  viewData = signal<InventoryDateViewData | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  logoPath = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportDataService = inject(ReportDataService);

  ngOnInit(): void {
    this.projectNum = this.route.snapshot.paramMap.get('projectNum') || '';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    this.logoPath = isLocalhost ? 'assets/lumen.svg' : '/assets/lumen.svg';
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reportDataService.getInventoryDateData(this.projectNum).subscribe({
      next: (data) => {
        this.viewData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load inventory list. Please try again.');
        this.loading.set(false);
      }
    });
  }

  locationStr(): string {
    const p = this.viewData()?.project;
    if (!p) return '';
    const parts: string[] = [];
    if (p.city) parts.push(p.city);
    if (p.stateOrProv) parts.push(p.stateOrProv);
    return parts.join(', ');
  }

  dateOfIssue(): string {
    const d = this.viewData()?.project?.dateOfIssue;
    if (!d) return '';
    const date = new Date(d);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  formatQty(qty: number): string {
    return Number.isInteger(qty) ? qty.toString() : qty.toString();
  }

  todayLong(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  printReport(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/projects', this.projectNum, 'reports']);
  }
}
