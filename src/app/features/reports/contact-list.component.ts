import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportDataService } from '../../core/services/report-data.service';
import { ProjectContact } from '../../core/models/models';

/**
 * Converted from VB6: rptContactLst report (DataMember: ProjContact)
 * Displays a formatted list of all contacts associated with a project.
 * Fields: TITLE, Name (First+Last), ADDR_1, ADDR_2, CityStateZip, COUNTRY, PHONE, FAX, EMAIL
 */
@Component({
  selector: 'app-contact-list',
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
        <p>Loading Contact List...</p>
      </div>
    } @else if (error()) {
      <div class="error-state no-print">
        <mat-icon>error_outline</mat-icon>
        <p>{{ error() }}</p>
        <button mat-stroked-button (click)="loadData()">Retry</button>
      </div>
    } @else {
      <!-- Printable Report Area -->
      <div class="report-page" id="contact-list-report">

        <!-- Report Header -->
        <div class="report-header">
          <div class="logo-area">
            <img [src]="logoPath" alt="Lumen" class="report-logo" />
          </div>
          <h1 class="report-title">List Of Contacts</h1>
          <div class="header-rule"></div>
        </div>

        <!-- Contact Cards -->
        @if (contacts().length === 0) {
          <div class="no-contacts">
            <mat-icon class="no-print">person_off</mat-icon>
            <p>No contacts found for this project.</p>
          </div>
        } @else {
          <div class="contacts-section">
            @for (contact of contacts(); track contact.projectContactId) {
              <div class="contact-row">
                <!-- Left: Title/Role -->
                <div class="contact-title-col">
                  <span class="contact-title">{{ contact.title || '—' }}</span>
                </div>
                <!-- Right: Contact details -->
                <div class="contact-details-col">
                  <div class="contact-name">{{ fullName(contact) }}</div>
                  @if (contact.addr1) {
                    <div class="contact-addr">{{ contact.addr1 }}</div>
                  }
                  @if (contact.addr2) {
                    <div class="contact-addr">{{ contact.addr2 }}</div>
                  }
                  @if (cityStateZip(contact)) {
                    <div class="contact-addr">{{ cityStateZip(contact) }}</div>
                  }
                  @if (contact.country) {
                    <div class="contact-addr">{{ contact.country }}</div>
                  }
                  @if (contact.phone) {
                    <div class="contact-comm">
                      <span class="comm-label">Phone:</span>
                      <span>{{ contact.phone }}</span>
                    </div>
                  }
                  @if (contact.fax) {
                    <div class="contact-comm">
                      <span class="comm-label">Fax:</span>
                      <span>{{ contact.fax }}</span>
                    </div>
                  }
                  @if (contact.email) {
                    <div class="contact-comm">
                      <span class="comm-label">Email:</span>
                      <span class="contact-email">{{ contact.email }}</span>
                    </div>
                  }
                </div>
              </div>
              <div class="contact-divider"></div>
            }
          </div>
        }
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
      max-width: 900px;
      margin: 32px auto;
      padding: 0 32px 48px;
      background: #fff;
      font-family: Arial, sans-serif;
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
      font-size: 20px;
      font-weight: 700;
      color: #1a1a2e;
      text-align: center;
      margin: 0 0 16px;
      letter-spacing: 0.01em;
    }
    .header-rule {
      border: none;
      border-top: 2px solid #333;
      margin: 0;
    }

    /* ── Contact rows ──────────────────────────────────────────── */
    .contacts-section { margin-top: 8px; }
    .contact-row {
      display: flex;
      gap: 24px;
      padding: 16px 0 8px;
      align-items: flex-start;
    }
    .contact-title-col {
      flex: 0 0 160px;
      padding-top: 2px;
    }
    .contact-title {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1.4;
      display: block;
      word-break: break-word;
    }
    .contact-details-col { flex: 1; min-width: 0; }
    .contact-name {
      font-size: 13px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .contact-addr {
      font-size: 12px;
      color: #333;
      line-height: 1.5;
    }
    .contact-comm {
      font-size: 12px;
      color: #333;
      display: flex;
      gap: 6px;
      line-height: 1.5;
    }
    .comm-label { font-weight: 600; color: #555; }
    .contact-email { word-break: break-all; }
    .contact-divider {
      border: none;
      border-top: 1px solid #ddd;
      margin: 0;
    }

    /* ── States ────────────────────────────────────────────────── */
    .no-contacts {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 0;
      color: #888;
      gap: 8px;
    }
    .no-contacts mat-icon { font-size: 48px; width: 48px; height: 48px; }
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
    :host-context([data-theme="dark"]) .report-title { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .report-project-num { color: #aaa !important; }
    :host-context([data-theme="dark"]) .header-rule { border-top-color: #555 !important; }
    :host-context([data-theme="dark"]) .contact-title { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .contact-name { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .contact-addr { color: #bbb !important; }
    :host-context([data-theme="dark"]) .contact-comm { color: #bbb !important; }
    :host-context([data-theme="dark"]) .comm-label { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .contact-divider { border-top-color: #424242 !important; }

    /* ── Print styles ──────────────────────────────────────────── */
    @media print {
      .no-print { display: none !important; }
      .report-page { margin: 0; padding: 0 24px 32px; max-width: 100%; }
      .report-title { font-size: 18px; }
      .contact-row { page-break-inside: avoid; }
    }
  `]
})
export class ContactListComponent implements OnInit {
  projectNum = '';
  logoPath = '';
  contacts = signal<ProjectContact[]>([]);
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
    this.reportDataService.getContactListData(this.projectNum).subscribe({
      next: (data) => {
        this.contacts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load contact list. Please try again.');
        this.loading.set(false);
      }
    });
  }

  fullName(contact: ProjectContact): string {
    return [contact.firstName, contact.lastName].filter(Boolean).join(' ');
  }

  cityStateZip(contact: ProjectContact): string {
    const parts: string[] = [];
    if (contact.city) parts.push(contact.city);
    if (contact.state) parts.push(contact.state);
    const cityState = parts.join(', ');
    return contact.zip ? `${cityState} ${contact.zip}`.trim() : cityState;
  }

  printReport(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/projects', this.projectNum, 'reports']);
  }
}
