import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/overlay';

/**
 * DialogService
 * Centralized wrapper for Material Dialog operations
 * Ensures consistent sizing, theming, and configuration across all dialogs
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  // Default dialog configuration
  private readonly DEFAULT_CONFIG: MatDialogConfig = {
    width: '600px',
    panelClass: ['themed-dialog'],
    disableClose: false,
    backdropClass: 'dark-backdrop',
  };

  private readonly LARGE_CONFIG: MatDialogConfig = {
    ...this.DEFAULT_CONFIG,
    width: '900px',
  };

  private readonly MEDIUM_CONFIG: MatDialogConfig = {
    ...this.DEFAULT_CONFIG,
    width: '600px',
  };

  private readonly SMALL_CONFIG: MatDialogConfig = {
    ...this.DEFAULT_CONFIG,
    width: '400px',
  };

  constructor(private dialog: MatDialog) {}

  /**
   * Open a dialog with default configuration
   * @param component The component to display
   * @param data Optional data to pass to the component
   * @param size 'small' | 'medium' | 'large' (default: 'medium')
   */
  open<T, R = any>(
    component: ComponentType<T>,
    data?: any,
    size: 'small' | 'medium' | 'large' = 'medium'
  ) {
    const config = this.getConfigBySize(size);
    if (data) {
      config.data = data;
    }
    return this.dialog.open(component, config);
  }

  /**
   * Open a dialog with custom configuration
   * @param component The component to display
   * @param customConfig Custom MatDialogConfig
   */
  openCustom<T, R = any>(
    component: ComponentType<T>,
    customConfig: MatDialogConfig
  ) {
    const mergedConfig = { ...this.DEFAULT_CONFIG, ...customConfig, panelClass: ['themed-dialog'] };
    return this.dialog.open(component, mergedConfig);
  }

  /**
   * Open a confirmation dialog
   * @param title Dialog title
   * @param message Dialog message
   * @param confirmText Button text (default: 'Yes')
   * @param cancelText Button text (default: 'Cancel')
   */
  openConfirm(
    title: string,
    message: string,
    confirmText = 'Yes',
    cancelText = 'Cancel'
  ) {
    // Import ConfirmDialogComponent when needed to avoid circular dependencies
    return this.dialog.open(this.getConfirmComponent(), {
      width: '400px',
      panelClass: ['themed-dialog'],
      data: { title, message, confirmText, cancelText },
    });
  }

  /**
   * Close all open dialogs
   */
  closeAll(): void {
    this.dialog.closeAll();
  }

  /**
   * Get number of open dialogs
   */
  getOpenDialogCount(): number {
    return this.dialog.openDialogs.length;
  }

  /**
   * Open ProjectSelectorDialog with standard configuration
   * @param mode 'open' | 'copy' | 'delete'
   * @param onlyFacilities Optional - filter to facilities only
   */
  openProjectSelector(mode: 'open' | 'copy' | 'delete', onlyFacilities = true) {
    // Import ProjectSelectorDialog when needed
    const ProjectSelectorDialog = this.getProjectSelectorComponent();
    return this.dialog.open(ProjectSelectorDialog, {
      width: '600px',
      panelClass: ['themed-dialog'],
      data: { mode, onlyFacilities }
    });
  }

  /**
   * Open ConfirmDialog for project deletion
   * @param projectNum Project number to delete
   */
  openDeleteConfirm(projectNum: string) {
    return this.openConfirm(
      'Delete Project',
      `Are you sure you want to delete project ${projectNum}?`,
      'Delete',
      'Cancel'
    );
  }

  /**
   * Open BOMDialog for project reports
   * @param projectNum Project number for BOM
   */
  openBOMDialog(projectNum: string) {
    const BOMDialogComponent = this.getBOMDialogComponent();
    const dialogRef = this.dialog.open(BOMDialogComponent, {
      width: '1400px',
      height: '700px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: ['themed-dialog']
    });
    if (dialogRef.componentInstance) {
      dialogRef.componentInstance.projectNum = projectNum;
    }
    return dialogRef;
  }

  private getConfigBySize(size: 'small' | 'medium' | 'large'): MatDialogConfig {
    switch (size) {
      case 'small':
        return { ...this.SMALL_CONFIG };
      case 'large':
        return { ...this.LARGE_CONFIG };
      case 'medium':
      default:
        return { ...this.MEDIUM_CONFIG };
    }
  }

  private getConfirmComponent(): any {
    // Placeholder - will be imported as needed to avoid circular dependency
    // Actual import: ConfirmDialogComponent
    return null;
  }

  private getProjectSelectorComponent(): any {
    // Placeholder - will be imported as needed to avoid circular dependency
    // Actual import: ProjectSelectorDialog
    return null;
  }

  private getBOMDialogComponent(): any {
    // Placeholder - will be imported as needed to avoid circular dependency
    // Actual import: BOMDialogComponent
    return null;
  }
}
