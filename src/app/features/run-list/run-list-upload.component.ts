import { Component, ElementRef, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RunListService } from '../../core/services/run-list.service';

/**
 * Run List Upload page.
 * Replaces {projectNum}RUNLIST.xlsx in the project's shared network folder.
 * Only .xlsx and .xls files are accepted.
 */
@Component({
  selector: 'app-run-list-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="edit-page-header">
      <div class="header-left">
        <button mat-button class="back-button" (click)="back()">
          <mat-icon>arrow_back</mat-icon>
          <span>Back to Project: {{ projectNum }}</span>
        </button>
      </div>
      <div class="header-right">
        <span class="page-title">Run List — Upload</span>
      </div>
    </div>
    <div class="header-divider"></div>

    <div class="page-wrapper">
      <div class="card">
        <mat-icon class="card-icon">upload_file</mat-icon>
        <h2 class="card-heading">Upload Runlist</h2>
        <p class="card-desc">
          Replace <strong>{{ projectNum }}RUNLIST.xlsx</strong> in the shared project folder.<br>
          Only <code>.xlsx</code> or <code>.xls</code> files are accepted.
          The existing file will be overwritten.
        </p>

        <!-- Hidden file input -->
        <input #fileInput type="file" accept=".xlsx,.xls" style="display:none"
               (change)="onFileSelected($event)" />

        <!-- Drop zone -->
        <div class="drop-zone"
             [class.drop-zone--has-file]="selectedFile()"
             (click)="fileInput.click()"
             (dragover)="$event.preventDefault()"
             (drop)="onDrop($event)">
          @if (selectedFile()) {
            <div class="file-preview">
              <mat-icon class="file-preview-icon">insert_drive_file</mat-icon>
              <span class="file-preview-name">{{ selectedFile()!.name }}</span>
              <span class="file-preview-size">{{ formatSize(selectedFile()!.size) }}</span>
            </div>
            <button mat-icon-button class="clear-btn" matTooltip="Remove file"
                    (click)="clearFile($event)">
              <mat-icon>close</mat-icon>
            </button>
          } @else {
            <mat-icon class="drop-icon">cloud_upload</mat-icon>
            <span class="drop-label">Click to choose a file or drag &amp; drop here</span>
            <span class="drop-hint">.xlsx / .xls only</span>
          }
        </div>

        <div class="btn-row">
          <button mat-stroked-button class="choose-btn"
                  [disabled]="uploading()"
                  (click)="fileInput.click()">
            <mat-icon>folder_open</mat-icon>
            Choose File
          </button>

          <button mat-raised-button color="primary"
                  class="upload-btn"
                  [disabled]="!selectedFile() || uploading()"
                  (click)="upload()">
            @if (uploading()) {
              <mat-spinner diameter="18" class="btn-spinner"></mat-spinner>
              Uploading…
            } @else {
              <ng-container>
                <mat-icon>upload</mat-icon>
                Upload
              </ng-container>
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    /* ── Header ── */
    .edit-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 32px;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      min-height: 64px;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .header-left { display: flex; align-items: center; flex: 1; }
    .header-right { display: flex; align-items: center; flex-shrink: 0; }

    .back-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 8px;
      background: transparent;
      border: none;
      color: #374151;
      cursor: pointer;
      font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    /* Match specificity of global button[mat-button]:not([color]) selector */
    button[mat-button].back-button {
      color: #6b7280 !important;
    }

    button[mat-button].back-button mat-icon {
      color: #6b7280 !important;
    }

    button[mat-button].back-button:hover {
      color: #ff9800 !important;
    }

    button[mat-button].back-button:hover mat-icon {
      color: #ff9800 !important;
    }

    .back-button mat-icon { font-size: 20px; width: 20px; height: 20px; color: #6b7280 !important; }
    .back-button:hover { background: #f0f4f8; color: #ff9800 !important; }
    .back-button:hover mat-icon { color: #ff9800 !important; }

    .page-title {
      font-size: 20px;
      font-weight: 400;
      color: #8a4d00;
      white-space: nowrap;
    }

    .header-divider { height: 1px; background: #e5e7eb; flex-shrink: 0; }

    /* ── Body ── */
    .page-wrapper {
      flex: 1;
      min-height: 0;
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      overflow-y: auto;
      box-sizing: border-box;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      padding: 40px 48px;
      text-align: center;
      max-width: 520px;
      width: 100%;
    }

    .card-icon {
      font-size: 52px;
      width: 52px;
      height: 52px;
      color: #ff9800;
      margin-bottom: 14px;
    }

    .card-heading {
      font-size: 22px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 10px;
      font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    }

    .card-desc {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.6;
      margin: 0 0 24px;
      font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    }

    /* ── Drop zone ── */
    .drop-zone {
      position: relative;
      border: 2px dashed #d1d5db;
      border-radius: 10px;
      background: #fafafa;
      padding: 28px 20px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      transition: border-color 0.2s, background 0.2s;
      margin-bottom: 20px;
      min-height: 110px;
      justify-content: center;
    }

    .drop-zone:hover {
      border-color: #ff9800;
      background: #fff8f0;
    }

    .drop-zone--has-file {
      border-color: #ff9800;
      background: #fff8f0;
      flex-direction: row;
      justify-content: center;
      padding: 16px 20px;
    }

    .drop-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #9ca3af;
    }

    .drop-label {
      font-size: 13px;
      color: #6b7280;
      font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    }

    .drop-hint {
      font-size: 11px;
      color: #9ca3af;
      font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    }

    /* ── File preview inside drop zone ── */
    .file-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }

    .file-preview-icon {
      color: #ff9800;
      font-size: 28px;
      width: 28px;
      height: 28px;
      flex-shrink: 0;
    }

    .file-preview-name {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    }

    .file-preview-size {
      font-size: 11px;
      color: #9ca3af;
      white-space: nowrap;
      font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
    }

    .clear-btn {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      line-height: 28px;
    }

    .clear-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* ── Action buttons ── */
    .btn-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .choose-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-color: #d1d5db;
      color: #374151;
    }

    .choose-btn:hover:not(:disabled) {
      border-color: #ff9800;
      color: #ff9800;
    }

    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-width: 100px;
    }

    .btn-spinner { display: inline-block; margin-right: 6px; }

    ::ng-deep .upload-btn.mat-mdc-raised-button.mat-primary {
      background-color: #ff9800 !important;
      color: #ffffff !important;
    }

    ::ng-deep .upload-btn.mat-mdc-raised-button.mat-primary:hover:not(:disabled) {
      background-color: #fb8500 !important;
    }

    /* Dark mode */
    :host-context([data-theme="dark"]) .edit-page-header {
      background: #1e1e1e !important;
      border-bottom-color: #424242 !important;
    }
    :host-context([data-theme="dark"]) .back-button { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .back-button mat-icon { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .back-button:hover { background: #1a2a4a !important; color: #fff !important; }
    :host-context([data-theme="dark"]) .page-title { color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .header-divider { background: #2a5298 !important; }
    :host-context([data-theme="dark"]) .page-wrapper { background: #121212 !important; }
    :host-context([data-theme="dark"]) .card { background: #1e1e1e !important; box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important; }
    :host-context([data-theme="dark"]) .card-heading { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .card-desc { color: #9e9e9e !important; }
    :host-context([data-theme="dark"]) .drop-zone {
      border-color: #616161 !important;
      background: #2a2a2a !important;
    }
    :host-context([data-theme="dark"]) .drop-zone:hover,
    :host-context([data-theme="dark"]) .drop-zone--has-file {
      border-color: #ff9800 !important;
      background: #2a1a00 !important;
    }
    :host-context([data-theme="dark"]) .drop-label { color: #9e9e9e !important; }
    :host-context([data-theme="dark"]) .file-preview-name { color: #e0e0e0 !important; }
    :host-context([data-theme="dark"]) .choose-btn { border-color: #616161 !important; color: #e0e0e0 !important; }
  `]
})
export class RunListUploadComponent implements OnInit {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  projectNum   = '';
  project: any = null;
  uploading    = signal(false);
  selectedFile = signal<File | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private runListService: RunListService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.projectNum = params['projectNum'] || '';
    });
    // Capture project data from navigation state if available
    const navState = history.state as { projectNum?: string; project?: any };
    this.project = navState?.project || null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      const name = file.name.toLowerCase();
      if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        this.selectedFile.set(file);
      } else {
        this.snackBar.open('Only .xlsx or .xls files are accepted.', 'Close', { duration: 4000 });
      }
    }
  }

  clearFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) return;

    this.uploading.set(true);
    this.runListService.uploadRunList(this.projectNum, file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.clearFileOnly();
        this.snackBar.open(res.message || 'Run list uploaded successfully.', 'Close', { duration: 4000 });
      },
      error: (err) => {
        this.uploading.set(false);
        const msg = err?.error?.error || 'Failed to upload run list.';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }

  private clearFileOnly(): void {
    this.selectedFile.set(null);
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  back(): void {
    this.router.navigate(['/home'], { 
      state: { 
        projectNum: this.projectNum,
        project: this.project
      }
    });
  }
}
