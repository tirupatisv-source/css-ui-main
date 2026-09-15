import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportDataService } from '../../core/services/report-data.service';
import { Project } from '../../core/models/models';

/**
 * Converted from VB6: rptTitlePage report.
 * Displays the project title page with customer info, project details and issue date.
 */
@Component({
  selector: 'app-title-page',
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

    @if (loading()) {
      <div class="loading-overlay">
        <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
        <p>Loading Title Page...</p>
      </div>
    } @else if (error()) {
      <div class="error-state no-print">
        <mat-icon>error_outline</mat-icon>
        <p>{{ error() }}</p>
        <button mat-stroked-button (click)="loadData()">Retry</button>
      </div>
    } @else if (project()) {
      <!-- Printable Report Area -->
      <div class="report-page" id="title-page-report">

        <!-- ── Cover Section ── -->
        <div class="cover-section">
          <div class="logo-area">
            <img [src]="logoPath" alt="Lumen" class="report-logo" />
          </div>

          <h1 class="document-title">DC Power &amp; Infrastructure<br>Project Manual</h1>

          <p class="for-label"><em>For</em></p>

          <p class="customer-name">{{ project()!.customer }}</p>
        </div>

        <!-- ── Details Section ── -->
        <div class="details-section">

          <div class="details-grid">

            <div class="detail-row">
              <span class="detail-label">Project Number:</span>
              <span class="detail-value">{{ project()!.projectNum }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Work Order:</span>
              <span class="detail-value">{{ project()!.workOrder || '' }}</span>
            </div>

            <div class="detail-row detail-row-gap">
              <span class="detail-label">Clarify Case Number:</span>
              <span class="detail-value">{{ project()!.clarifyCaseId || '' }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value address-block">
                @if (project()!.addr1) { <span>{{ project()!.addr1 }}</span> }
                @if (project()!.addr2) { <span>{{ project()!.addr2 }}</span> }
                <span>{{ cityStateZip() }}</span>
                @if (project()!.country) { <span>{{ project()!.country }}</span> }
              </span>
            </div>

            @if (project()!.earthquakeZone) {
              <div class="detail-row detail-row-gap">
                <span class="detail-label">Earthquake Zone:</span>
                <span class="detail-value">{{ project()!.earthquakeZone }}</span>
              </div>
            }

            @if (project()!.dateOfIssue) {
              <div class="detail-row">
                <span class="detail-label">Date of Issue:</span>
                <span class="detail-value">{{ formatDate(project()!.dateOfIssue) }}</span>
              </div>
            }

          </div>
        </div>

      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }

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

    /* ── Report page ───────────────────────────────────────────── */
    .report-page {
      max-width: 760px;
      margin: 32px auto;
      padding: 0 48px 64px;
      background: #fff;
      font-family: Arial, sans-serif;
    }

    /* ── Cover section ─────────────────────────────────────────── */
    .cover-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 48px;
      padding-bottom: 48px;
      border-bottom: 1px solid #ccc;
      margin-bottom: 48px;
    }
    .logo-area { margin-bottom: 48px; }
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
    .document-title {
      font-size: 32px;
      font-weight: 800;
      color: #000;
      text-align: center;
      line-height: 1.25;
      margin: 0 0 32px;
    }
    .for-label {
      font-size: 16px;
      font-style: italic;
      font-weight: 600;
      color: #333;
      margin: 0 0 16px;
    }
    .customer-name {
      font-size: 26px;
      font-weight: 700;
      color: #000;
      text-align: center;
      margin: 0;
    }

    /* ── Details section ───────────────────────────────────────── */
    .details-section { padding: 0 8px; display: flex; flex-direction: column; align-items: center; }
    .details-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }
    .detail-row {
      display: flex;
      align-items: flex-start;
      gap: 0;
      width: 480px;
    }
    .detail-row-gap { margin-top: 12px; }
    .detail-label {
      flex: 0 0 220px;
      font-size: 16px;
      font-weight: 700;
      color: #000;
    }
    .detail-value {
      flex: 1;
      font-size: 16px;
      font-weight: 700;
      color: #000;
    }
    .address-block {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    /* ── States ────────────────────────────────────────────────── */
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
    :host-context([data-theme="dark"]) .report-page { background: #1e1e1e !important; }
    :host-context([data-theme="dark"]) .document-title { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .for-label { color: #bbb !important; }
    :host-context([data-theme="dark"]) .customer-name { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .cover-section { border-bottom-color: #424242 !important; }
    :host-context([data-theme="dark"]) .detail-label { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .detail-value { color: #e0e0e0 !important; }

    /* ── Print styles ──────────────────────────────────────────── */
    @media print {
      .no-print { display: none !important; }
      .report-page { margin: 0; padding: 0 48px 48px; max-width: 100%; }
      .cover-section { page-break-after: always; }
    }
  `]
})
export class TitlePageComponent implements OnInit {
  projectNum = '';
  logoPath = '';
  project = signal<Project | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reportDataService = inject(ReportDataService);

  ngOnInit(): void {
    this.projectNum = this.route.snapshot.paramMap.get('projectNum') || '';
    const isLocalhost = window.location.hostname === 'localhost';
    this.logoPath = isLocalhost ? 'assets/lumen.svg' : '/assets/lumen.svg';
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reportDataService.getTitlePageData(this.projectNum).subscribe({
      next: (data) => {
        this.project.set(data.project);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load title page data. Please try again.');
        this.loading.set(false);
      }
    });
  }

  cityStateZip(): string {
    const p = this.project();
    if (!p) return '';
    const parts: string[] = [];
    if (p.city) parts.push(p.city);
    if (p.stateOrProv) parts.push(p.stateOrProv);
    const cityState = parts.join(', ');
    return p.zip ? `${cityState} ${p.zip}`.trim() : cityState;
  }

  formatDate(raw: string): string {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  printReport(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/projects', this.projectNum, 'reports']);
  }
}
