import { Component, OnInit, signal, inject, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BOMDialogComponent } from '../../shared/dialogs/bom-dialog.component';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog.component';

interface ReportOption {
  key: string;
  label: string;
  icon: string;
  tooltip?: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTooltipModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDialogModule
  ],
  template: `
    <div class="secondary-nav-header">
      <button mat-button class="back-link" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        <span>Back to Project: {{ projectNum }}</span>
      </button>
      <h1 class="page-title-right">Reports Menu</h1>
    </div>

    <main class="content-area">
      <section class="menu-section">
        <div class="tile-grid">
          @for (report of reports; track report.key) {
            <div class="report-tile" (click)="handleAction(report.key)" [matTooltip]="report.tooltip" matTooltipPosition="below">
              <div class="tile-content">
                <mat-icon class="report-icon">{{ report.icon }}</mat-icon>
                <span class="report-label">{{ report.label }}</span>
              </div>
            </div>
          }
        </div>
      </section>
    </main>

    @if (generating()) {
      <div class="loading-overlay blur-active">
        <div class="loading-content">
          <mat-progress-spinner mode="indeterminate" diameter="80"></mat-progress-spinner>
          <p class="loading-text">
            <mat-icon class="download-icon">cloud_download</mat-icon>
            Downloading... Please wait
          </p>
        </div>
      </div>
    }
  `,
  styles: [`
    .secondary-nav-header {
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
      transition: all 0.2s ease;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 14px;
      font-weight: 500;
      gap: 8px;
    }
    .back-link:hover { background-color: #f0f4f8; color: #ff9800; }
    .back-link mat-icon { font-size: 20px; width: 20px; height: 20px; color: #6b7280; transition: color 0.2s; }
    .back-link:hover mat-icon { color: #ff9800; }
    .back-link span { margin-top: 0; }
    .page-title-right { font-size: 20px; font-weight: 400; color: #8a4d00; margin: 0; }
    .content-area { padding: 10px 40px; background: #fcfcfc; height: calc(100vh - 120px); overflow-y: auto; }
    .tile-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 48px; }
    @media (max-width: 1200px) { .tile-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 900px) { .tile-grid { grid-template-columns: repeat(2, 1fr); } }
    .report-tile {
      background: #fff;
      border: 1px solid #e0e4e8;
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      cursor: pointer;
      min-height: 60px;
      transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
    }
    .report-tile:hover { border-color: #ff9800; background: rgba(255, 152, 0, 0.03); box-shadow: 0 10px 24px rgba(255, 152, 0, 0.14); transform: translateY(-2px) scale(1.03); }
    .report-tile:active { background: rgba(255, 152, 0, 0.16); box-shadow: inset 0 4px 12px rgba(15, 23, 42, 0.22); transform: translateY(1px) scale(0.94); border-color: #e65100; }
    .tile-content { display: flex; align-items: center; gap: 16px; flex: 1; }
    .report-icon { color: #546e7a; font-size: 24px; }
    .report-label { font-size: 14px; color: #2c3e50; font-weight: 500; }
    .loading-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(255,255,255,0.8); display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 1000;
      backdrop-filter: blur(6px); transition: all 0.3s ease-in-out;
    }
    .loading-overlay.blur-active {
      backdrop-filter: blur(6px); background: rgba(255,255,255,0.8);
    }
    .loading-content {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px;
      padding: 40px; background: rgba(255,255,255,0.95); border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12), 0 0 2px rgba(0,0,0,0.08); 
      backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.05);
    }
    .loading-text {
      font-size: 16px; color: #6b7280; font-weight: 500; margin: 0;
      display: flex; align-items: center; gap: 8px; text-align: center; white-space: nowrap;
    }
    .download-icon {
      font-size: 22px; width: 22px; height: 22px; color: #ff9800;
      animation: pulse-download 2s ease-in-out infinite;
    }
    @keyframes pulse-download {
      0%, 100% { opacity: 1; transform: translateY(0); }
      50% { opacity: 0.7; transform: translateY(-4px); }
    }
    :host-context([data-theme="dark"]) .secondary-nav-header { background: #1e1e1e !important; border-bottom-color: #424242 !important; }
    :host-context([data-theme="dark"]) .back-link { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .back-link mat-icon { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .back-link:hover { background-color: #1a2a4a !important; color: #ffffff !important; }
    :host-context([data-theme="dark"]) .page-title-right { color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .content-area { background: #121212 !important; }
    :host-context([data-theme="dark"]) .report-tile { background: #1e1e1e !important; border-color: #424242 !important; }
    :host-context([data-theme="dark"]) .report-tile:hover { border-color: #ff9800 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important; }
    :host-context([data-theme="dark"]) .report-icon { color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .report-label { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .loading-overlay { background: rgba(0,0,0,0.7) !important; }    :host(.has-overlay) .secondary-nav-header,
    :host(.has-overlay) .content-area {
      filter: blur(3px); pointer-events: none; transition: filter 0.3s ease-in-out;
    }  `]
})
export class ReportsComponent implements OnInit {
  projectNum = '';
  generating = signal(false);

  // Bind blur effect class when processing/downloading
  @HostBinding('class.has-overlay')
  get hasOverlay(): boolean {
    return this.generating();
  }

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  reports: ReportOption[] = [
    { key: 'cableRunList', label: 'Cable Run List', icon: 'cable' , tooltip: 'Download cable run list' },
    { key: 'contactList', label: 'Contact List', icon: 'contact_page', tooltip: 'Contact list' },
    { key: 'drawingInfo', label: 'Drawing Information', icon: 'architecture', tooltip: 'Download the drawing information' },
    { key: 'exportBOM', label: 'Export Bill of Materials', icon: 'save_alt', tooltip: 'Export the bill of materials in CSV format' },
    { key: 'generalNotes', label: 'General Notes', icon: 'description', tooltip: 'Download general notes' },
    { key: 'inventoryDate', label: 'Inventory List [Date]', icon: 'event', tooltip: 'Inventory list' },
    { key: 'materialSummary', label: 'Summary of Material', icon: 'inventory_2', tooltip: 'Summary of material' },
    { key: 'printReports', label: 'Print Reports', icon: 'print', tooltip: 'Print the selected reports' },
    { key: 'titlePage', label: 'Title Page', icon: 'menu_book', tooltip: 'Title page' },
    { key: 'toc', label: 'Table of Contents', icon: 'toc', tooltip: 'Download table of contents' },
    { key: 'upload', label: 'Upload', icon: 'upload', tooltip: 'Upload files related to the project' },
    // { key: 'workItems', label: 'Work Items', icon: 'list_alt' },
    // { key: 'powerRunList',    label: 'Power Run List',           icon: 'bolt' },
    // { key: 'rlNotes',         label: 'Run List Notes',           icon: 'speaker_notes' },
    // { key: 'fuseAssign',      label: 'Fuse/Breaker Assigns',     icon: 'electrical_services' },
    // { key: 'installerNotes',  label: 'Installer Notes',          icon: 'edit_note' },
    // { key: 'inventoryCost',   label: 'Inventory List [Cost]',    icon: 'attach_money' },
    { key: 'inventoryDate',   label: 'Inventory List [Date]',    icon: 'event' },
    { key: 'exportBOM',       label: 'Export Bill of Materials', icon: 'save_alt' },
    { key: 'printReports',    label: 'Print Reports',            icon: 'print' },
  ];

  ngOnInit(): void {
    this.projectNum = this.route.snapshot.paramMap.get('projectNum') || '';
  }

  handleAction(key: string): void {
    switch (key) {
      case 'contactList':
        this.router.navigate(['/projects', this.projectNum, 'reports', 'contact-list']);
        break;
      case 'titlePage':
        this.router.navigate(['/projects', this.projectNum, 'reports', 'title-page']);
        break;
      case 'inventoryDate':
        this.router.navigate(['/projects', this.projectNum, 'reports', 'inventory-date']);
        break;
      case 'toc':
        this.downloadTOC();
        break;
      case 'drawingInfo':
        this.downloadDIS();
        break;
      case 'cableRunList':
        this.downloadCableRunList();
        break;
      case 'generalNotes':
        this.downloadGeneralNotes();
        break;
      case 'exportBOM':
        this.exportBOM();
        break;
      case 'exit':
        this.goBack();
        break;
      case 'printReports':
        this.snackBar.open('Select reports to print from individual options', 'Close', { duration: 3000 });
        break;
      default:
        this.generateReport(key);
    }
  }

  generateReport(key: string): void {
    this.generating.set(true);
    this.http.get(`${environment.apiUrl}/api/projects/${this.projectNum}/reports/${key}`,
      { responseType: 'blob' }
    ).subscribe({
      next: (blob) => {
        this.generating.set(false);
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      },
      error: () => {
        this.generating.set(false);
        this.snackBar.open('Action failed', 'Close', { duration: 4000 });
      }
    });
  }

  downloadDocx(key: string, filename: string): void {
    this.generating.set(true);
    this.http.get(`${environment.apiUrl}/api/projects/${this.projectNum}/reports/${key}`,
      { responseType: 'blob' }
    ).subscribe({
      next: (blob) => {
        this.generating.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.generating.set(false);
        this.snackBar.open(
          'Could not download file. Ensure project files have been generated.',
          'Close', { duration: 5000 });
      }
    });
  }

  downloadTOC(): void {
    if (!this.projectNum) return;
    const filename = `${this.projectNum}TOC.doc`;
    this.generating.set(true);
    this.http.get(`${environment.apiUrl}/api/projects/${this.projectNum}/reports/toc`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.generating.set(false);
        this.snackBar.open(`Downloaded ${filename}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.generating.set(false);
        console.error('TOC download error:', err);
        this.snackBar.open(`Failed to download ${filename}. File may be missing from project folder.`, 'Close', { duration: 5000 });
      }
    });
  }

  downloadDIS(): void {
    if (!this.projectNum) return;
    const filename = `${this.projectNum}DIS.doc`;
    this.generating.set(true);
    this.http.get(`${environment.apiUrl}/api/projects/${this.projectNum}/reports/dis`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.generating.set(false);
        this.snackBar.open(`Downloaded ${filename}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.generating.set(false);
        console.error('DIS download error:', err);
        this.snackBar.open(`Failed to download ${filename}. File may be missing from project folder.`, 'Close', { duration: 5000 });
      }
    });
  }

  downloadCableRunList(): void {
    if (!this.projectNum) return;
    const filename = `${this.projectNum}RUN_LIST.xls`;
    this.generating.set(true);
    this.http.get(`${environment.apiUrl}/api/projects/${this.projectNum}/run-list/download`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.generating.set(false);
        this.snackBar.open(`Downloaded ${filename}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.generating.set(false);
        console.error('Run List download error:', err);
        this.snackBar.open(`Failed to download ${filename}. File may be missing from project folder.`, 'Close', { duration: 5000 });
      }
    });
  }

  downloadGeneralNotes(): void {
    if (!this.projectNum) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      data: {
        title: 'Download General Notes',
        message: 'Select the format to download:',
        dialogType: 'format-selection',
        options: [
          { label: 'PDF', value: 'pdf', color: 'primary', icon: 'picture_as_pdf' },
          { label: 'Word (.docx)', value: 'docx', color: 'accent', icon: 'description' }
        ]
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === undefined || result === null) return;
      const format = result;
      const filename = `General_Notes.${format}`;
      this.generating.set(true);
      this.http.get(`${environment.apiUrl}/api/templates/download?name=General_Notes&format=${format}`, {
        responseType: 'blob'
      }).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          window.URL.revokeObjectURL(url);
          this.generating.set(false);
          this.snackBar.open(`Downloaded ${filename}`, 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.generating.set(false);
          console.error('Download error:', err);
          this.snackBar.open(`Failed to download ${filename}. File may be missing from templates directory.`, 'Close', { duration: 5000 });
        }
      });
    });
  }

  exportBOM(): void {
    const dialogRef = this.dialog.open(BOMDialogComponent, {
      width: '1400px', height: '700px', maxWidth: '95vw', maxHeight: '95vh', panelClass: ['themed-dialog']
    });
    if (dialogRef.componentInstance) {
      dialogRef.componentInstance.projectNum = this.projectNum;
    }
  }

  goBack(): void {
    this.router.navigate(['/home'], { state: { projectNum: this.projectNum } });
  }
}
