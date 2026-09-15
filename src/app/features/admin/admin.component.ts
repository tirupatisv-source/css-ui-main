import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { AdminModalWrapperComponent } from './admin-modal.component';

interface AdminOption {
  route: string;
  label: string;
  icon: string;
  tooltip: string;
  role?: 'userAccess' | 'dataAdmin' | 'projAdmin' | 'costAdmin' | 'userAdmin';
}

/**
 * Admin shell component — converted from VB6 frmAdmMenu.
 * Displays admin options as tiles in a grid layout (similar to Reports page).
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatIconModule, MatButtonModule, MatTooltipModule, MatDialogModule
  ],
  template: `
    <div class="secondary-nav-header">
      <button mat-button class="back-link" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon>
        <span>Back</span>
      </button>
      <h1 class="page-title-right">Administration Menu</h1>
    </div>

    <main class="content-area">
      <section class="menu-section">
        <div class="tile-grid">
          @for (option of adminOptions; track option.route) {
            @if (!option.role || authService.hasRole(option.role)) {
              <a tabindex="0" role="button" (click)="selectRoute(option.route)" (keydown.enter)="selectRoute(option.route)" class="admin-tile" [matTooltip]="option.tooltip">
                <div class="tile-content">
                  <mat-icon class="admin-icon">{{ option.icon }}</mat-icon>
                  <span class="admin-label">{{ option.label }}</span>
                </div>
              </a>
            }
          }
        </div>
      </section>
    </main>
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
    /* Match specificity of global button[mat-button]:not([color]) selector */
    button[mat-button].back-link {
      color: #6b7280 !important;
    }

    button[mat-button].back-link mat-icon {
      color: #6b7280 !important;
    }

    button[mat-button].back-link:hover {
      color: #ff9800 !important;
    }

    button[mat-button].back-link:hover mat-icon {
      color: #ff9800 !important;
    }

    .back-link {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #6b7280 !important;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      font-size: 14px;
      font-weight: 500;
      gap: 8px;
    }
    .back-link:hover { background-color: #f0f4f8; color: #ff9800 !important; transform: scale(1.04); }
    .back-link mat-icon { font-size: 20px; width: 20px; height: 20px; color: #6b7280 !important; transition: color 0.2s; }
    .back-link:hover mat-icon { color: #ff9800 !important; }
    .back-link:active { transform: scale(0.93); background-color: rgba(255, 152, 0, 0.14) !important; color: #e65100 !important; box-shadow: inset 0 3px 10px rgba(15, 23, 42, 0.25) !important; }
    .back-link:active mat-icon { color: #e65100 !important; }
    .back-link span { margin-top: 0; }
    .page-title-right { font-size: 20px; font-weight: 400; color: #8a4d00; margin: 0; }
    .content-area { padding: 32px 40px; background: #fcfcfc; height: calc(100vh - 120px); overflow-y: auto; }
    .tile-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 48px; }
    @media (max-width: 1200px) { .tile-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 900px) { .tile-grid { grid-template-columns: repeat(2, 1fr); } }
    .admin-tile {
      background: #fff;
      border: 1px solid #e0e4e8;
      border-radius: 8px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      cursor: pointer;
      min-height: 60px;
      text-decoration: none;
      transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
    }
    .admin-tile:hover { border-color: #ff9800; background: rgba(255, 152, 0, 0.03); box-shadow: 0 10px 24px rgba(255, 152, 0, 0.14); transform: translateY(-2px) scale(1.03); }
    .admin-tile:active { background: rgba(255, 152, 0, 0.16); box-shadow: inset 0 4px 12px rgba(15, 23, 42, 0.22); transform: translateY(1px) scale(0.94); border-color: #e65100; }
    .tile-content { display: flex; align-items: center; gap: 16px; flex: 1; }
    .admin-icon { color: #546e7a; font-size: 24px; }
    .admin-label { font-size: 14px; color: #2c3e50; font-weight: 500; }
    
    :host-context([data-theme="dark"]) .secondary-nav-header { background: #1e1e1e !important; border-bottom-color: #424242 !important; }
    :host-context([data-theme="dark"]) .back-link { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .back-link mat-icon { color: #90caf9 !important; }
    :host-context([data-theme="dark"]) .back-link:hover { background-color: #1a2a4a !important; color: #ffffff !important; }
    :host-context([data-theme="dark"]) .page-title-right { color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .content-area { background: #121212 !important; }
    :host-context([data-theme="dark"]) .admin-tile { background: #1e1e1e !important; border-color: #424242 !important; }
    :host-context([data-theme="dark"]) .admin-tile:hover { border-color: #ff9800 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important; }
    :host-context([data-theme="dark"]) .admin-icon { color: #ff9800 !important; }
    :host-context([data-theme="dark"]) .admin-label { color: #e0e0e0 !important; }
  `]
})
export class AdminComponent implements OnInit {
  projectNum: string = '';
  project: any = null;
  private activeAdminDialogRef: MatDialogRef<AdminModalWrapperComponent> | null = null;

  constructor(
    public authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Retrieve projectNum and project data from navigation state
    const navState = history.state as { projectNum?: string; project?: any };
    this.projectNum = navState?.projectNum || '';
    this.project = navState?.project || null;
  }

  adminOptions: AdminOption[] = [
    { route: 'cable-color', label: 'Cable Color/Designation', icon: 'palette', tooltip: 'Cable color/designation' },
    { route: 'cable-type', label: 'Cable Type', icon: 'cable', tooltip: 'Cable types' },
    // { route: 'companies', label: 'Companies', icon: 'business', tooltip: 'Companies' },
    { route: 'earthquake-zone', label: 'Earthquake Zone', icon: 'terrain', tooltip: 'Earthquake zones' },
    { route: 'material-category', label: 'Material Category', icon: 'category', tooltip: 'Material categories' },
    { route: 'parts', label: 'Master Parts List', icon: 'inventory', tooltip: 'Master parts list' },
    { route: 'part-association', label: 'Part Associations', icon: 'hub', tooltip: 'Part associations' },
    { route: 'part-association-table', label: 'Part Associations Table', icon: 'table_chart', tooltip: 'Part association table' },
    { route: 'runlist-category', label: 'Runlist Cable Category', icon: 'label', tooltip: 'Runlist cable categories' },
    { route: 'runlist-association', label: 'Runlist Association', icon: 'link', tooltip: 'Runlist associations' },
    // { route: 'users', label: 'User Management', icon: 'people', tooltip: 'User management', role: 'userAdmin' },
    { route: 'user-access', label: 'User Access', icon: 'person_add', tooltip: 'User access control' },
    { route: 'unit-of-measure', label: 'Unit of Measure', icon: 'straighten', tooltip: 'Unit of measure' },
    { route: 'vendor', label: 'Vendor/Manufacturer', icon: 'apartment', tooltip: 'Vendor/Manufacturer' },
    { route: 'work-item-operation', label: 'Workitem Operation', icon: 'assignment', tooltip: 'Work item operations' },
  ];

  selectRoute(route: string): void {
    const option = this.adminOptions.find(opt => opt.route === route);
    const title = option?.label || route;
    const isFullscreenRoute = route === 'parts' || route === 'part-association' || route === 'part-association-table';
    const panelClass = AdminModalWrapperComponent.resolvePanelClass(route);

    const openSelectedDialog = (): void => {
      this.activeAdminDialogRef = this.dialog.open(AdminModalWrapperComponent, {
        data: { route, title },
        width: isFullscreenRoute ? '100vw' : AdminModalWrapperComponent.resolveDialogWidth(route),
        height: isFullscreenRoute ? '100vh' : undefined,
        maxWidth: isFullscreenRoute ? '100vw' : '90vw',
        maxHeight: isFullscreenRoute ? '100vh' : '90vh',
        panelClass: isFullscreenRoute ? [panelClass, 'admin-modal-fullscreen'] : panelClass,
        disableClose: false,
        autoFocus: false,
      });

      this.activeAdminDialogRef.afterClosed().subscribe(() => {
        this.activeAdminDialogRef = null;
      });
    };

    if (this.dialog.openDialogs.length > 0) {
      this.dialog.closeAll();
      this.dialog.afterAllClosed.pipe(take(1)).subscribe(() => openSelectedDialog());
      return;
    }

    openSelectedDialog();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Ignore synthetic/programmatic clicks (e.g. XLSX.writeFile triggers a
    // hidden <a>.click() for the file download — isTrusted=false for those).
    if (!event.isTrusted) {
      return;
    }

    if (!this.activeAdminDialogRef) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const insideDialogSurface = !!target.closest('.mat-mdc-dialog-surface');
    const onAdminTileClick = !!target.closest('.admin-tile');

    if (!insideDialogSurface && !onAdminTileClick) {
      this.activeAdminDialogRef.close();
    }
  }

  goBack(): void {
    // Pass full project data back to landing page to preserve project state
    this.router.navigate(['/home'], { 
      state: { 
        projectNum: this.projectNum,
        project: this.project
      }
    });
  }
}
