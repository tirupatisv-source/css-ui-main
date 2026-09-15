import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';

import { Project, ProjectContact } from '../../core/models/models';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { RunListService } from '../../core/services/run-list.service';
import { NetworkAccessService } from '../../core/services/network-access.service';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog.component';
import { NewProjectDialog } from '../../shared/dialogs/new-project.dialog';
import { ProjectSelectorDialog } from '../../shared/dialogs/project-selector.dialog';

/**
 * Landing Page Component
 * Serves as a home page for project management
 * Displays an embedded project detail form that is populated when creating/opening/copying projects
 */
@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit, OnDestroy {
  project: Project = this.createEmptyProject();
  projectOpened = false;
  workItemsEnabled = false;
  isEditable = false;
  isNewProject = false;
  tabIndex = 0;
  isLoadingProject = false;
  isCreatingProject = false;
  isDownloading = false;

  private destroy$ = new Subject<void>();

  // Getter for checking if user is admin
  get isAdmin(): boolean {
    return this.authService.currentUser()?.userAdmin ?? false;
  }

  // Bind blur effect class when loading/creating/downloading
  @HostBinding('class.has-overlay')
  get hasOverlay(): boolean {
    return this.isLoadingProject || this.isCreatingProject || this.isDownloading;
  }

  // ============ Constructor ============

  constructor(
    private dialog: MatDialog,
    private projectService: ProjectService,
    private authService: AuthService,
    private networkAccessService: NetworkAccessService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private runListService: RunListService
  ) {}

  // ============ Lifecycle Hooks ============

  ngOnInit(): void {
    // Ensure a folder exists under Projects\ for every project in the database.
    // this.projectService.syncFolders().subscribe();

    // Restore project state when navigating back from reports/edit/notes/run-list/work-items/admin
    const navState = history.state as { projectNum?: string; project?: any };
    if (navState?.project) {
      // Restore full project data from navigation state
      console.log('[LandingPage] 📂 Restoring project from navigation state:', navState.project.projectNum);
      this.project = navState.project;
      this.projectOpened = true;
      this.isEditable = !this.project.completed;
      this.workItemsEnabled = true;
      this.tabIndex = 0;
      this.cdr.markForCheck();
      
      // Show loading spinner and refresh data in background
      this.isLoadingProject = true;
      this.loadProject(navState.project.projectNum);
    } else if (navState?.projectNum) {
      // Fallback: if only projectNum passed, load from API
      this.isLoadingProject = true;
      this.loadProject(navState.projectNum);
      return;
    }

    const cachedProjectNum = localStorage.getItem('activeProjectNum');
    if (cachedProjectNum) {
      this.loadProject(cachedProjectNum);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============ Private Helper Methods ============

  private createEmptyProject(): Project {
    return {
      projectNum: '',
      customer: '',
      workOrder: '',
      appendix: '',
      addr1: '',
      addr2: '',
      city: '',
      stateOrProv: '',
      zip: '',
      country: '',
      dateOfIssue: '',
      eqId: null,
      earthquakeZone: '',
      rise: 0,
      floorHeight: 0,
      userName: '',
      projectGroup: '',
      completed: false,
      specification: '',
      clarifyCaseId: '',
      partGroupId: 1,
    };
  }

  // ============ Project Operations ============

  newProject(event?: Event): void {
    event?.stopPropagation();
    this.dialog.closeAll();
    this.dialog.open(NewProjectDialog, { width: '520px', panelClass: ['themed-dialog'] }).afterClosed().subscribe((created?: Project) => {
      if (created?.projectNum) {
        if (!created.dateOfIssue) {
          created.dateOfIssue = new Date().toISOString().substring(0, 10);
        }
        this.project = created;
        this.projectOpened = true;
        this.isEditable = true;
        this.isNewProject = true;
        this.workItemsEnabled = true;
        this.tabIndex = 0;
        // this.projectStateService.saveProjectState(this.project, this.projectOpened, this.isEditable, this.workItemsEnabled, this.tabIndex);
        this.cdr.markForCheck();
        localStorage.setItem('activeProjectNum', created.projectNum);
        // Generate project files (TOC.docx, DIS.docx, RUNLIST.xlsx) via backend
        // this.projectService.generateFiles(created.projectNum).subscribe();
        // Create project directory on network share with loading spinner
        this.isCreatingProject = true;
        this.cdr.markForCheck();
        this.networkAccessService.createProjectNetworkDirectory(created.projectNum).subscribe({
          next: (response) => {
            this.isCreatingProject = false;
            this.cdr.markForCheck();
            if (response.success || !response.error) {
              console.log(`✓ Network directory created for project ${created.projectNum}`);
              // Show confirmation dialog
              this.dialog.open(ConfirmDialogComponent, {
                width: '500px',
                data: {
                  title: 'Project Created Successfully',
                  message: `Project "${created.projectNum}" has been created and files have been copied. Would you like to open this project now?`,
                  okLabel: 'Open Project',
                  cancelLabel: 'Close',
                  showCancel: true
                },
                panelClass: ['themed-dialog']
              }).afterClosed().subscribe((result) => {
                if (result) {
                  // Auto-open the project
                  this.isLoadingProject = true;
                  this.loadProject(created.projectNum);
                }
              });
            } else {
              console.warn(`⚠️ Failed to create network directory: ${response.error}`);
              this.snackBar.open(`Project created but network directory setup encountered an issue`, 'Close', { duration: 4000 });
            }
          },
          error: (err) => {
            this.isCreatingProject = false;
            this.cdr.markForCheck();
            console.error(`✗ Error creating network directory: ${err.message}`);
            this.snackBar.open(`Project created but network directory setup failed`, 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  openProject(event?: Event): void {
    event?.stopPropagation();
    this.dialog.closeAll();
    const dialogStartTime = performance.now();
    console.log(`[LandingPage] 🔄 openProject() START - Opening project selector dialog at ${new Date().toLocaleTimeString()}`);
    
    this.dialog.open(ProjectSelectorDialog, { width: '600px', data: { mode: 'open', onlyFacilities: true }, panelClass: ['themed-dialog'] })
      .afterClosed().subscribe((result) => {
        const dialogTime = performance.now() - dialogStartTime;
        console.log(`[LandingPage] 📋 Project selector dialog closed after ${dialogTime.toFixed(2)}ms`);
        
        if (!result?.selectedProject) {
          console.log('[LandingPage] ⚠️  No project selected');
          return;
        }
        
        console.log(`[LandingPage] 📌 Selected project: ${result.selectedProject.projectNum}`);
        
        // Search for project directory on network share
        const projectNum = result.selectedProject.projectNum;
        this.networkAccessService.findProjectNetworkDirectory(projectNum).subscribe({
          next: (response) => {
            if (response.found) {
              console.log(`✓ Network directory found for project ${projectNum}`);
            } else {
              console.warn(`⚠️ Network directory not found for project ${projectNum}`);
            }
          },
          error: (err) => {
            console.error(`✗ Error searching for network directory: ${err.message}`);
          }
        });
        
        // Set loading state before loading project
        this.isLoadingProject = true;
        this.loadProject(projectNum);
      });
  }

  copyProject(event?: Event): void {
    event?.stopPropagation();
    this.dialog.closeAll();
    const userName = this.authService.getCurrentUserName();
    console.log(`Current user: "${userName}"`);
    
    if (!userName || userName.trim() === '') {
      this.snackBar.open('Error: User not authenticated. Please login again.', 'Close', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ProjectSelectorDialog, { width: '600px', data: { mode: 'copy', onlyFacilities: true }, panelClass: ['themed-dialog'] });
    const projectSelectorInstance = dialogRef.componentInstance;
    
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Copy dialog result:', result);
      
      if (!result) {
        console.log('Copy canceled - no result');
        return;
      }
      
      if (!result.selectedProject) {
        console.log('Copy canceled - no selectedProject');
        this.snackBar.open('No project selected', 'Close', { duration: 2000 });
        return;
      }
      
      if (!result.newProjectNum) {
        console.log('Copy canceled - no newProjectNum');
        this.snackBar.open('No new project name provided', 'Close', { duration: 2000 });
        return;
      }
      
      const sourceProjNum = result.selectedProject.projectNum || result.selectedProject;
      const newProjNum = result.newProjectNum;
      
      console.log(`About to copy: source="${sourceProjNum}", new="${newProjNum}", user="${userName}"`);
      
      if (!sourceProjNum || sourceProjNum.trim() === '') {
        console.error('Invalid source project number');
        this.snackBar.open('Invalid source project number', 'Close', { duration: 2000 });
        return;
      }
      
      if (!newProjNum || newProjNum.trim() === '') {
        console.error('Invalid new project number');
        this.snackBar.open('Invalid new project number', 'Close', { duration: 2000 });
        return;
      }

      // Show spinner immediately while copying
      this.isCreatingProject = true;
      this.cdr.markForCheck();

      this.projectService.copyProject(sourceProjNum, newProjNum, userName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (copied) => {
            console.log('✓ Copy successful:', copied);
            
            // Hide spinner immediately - copy is done
            this.isCreatingProject = false;
            this.cdr.markForCheck();

            // Show confirmation dialog immediately (don't wait for network directory creation)
            this.dialog.open(ConfirmDialogComponent, {
              width: '500px',
              data: {
                title: 'Project Copied Successfully',
                message: `Project "${newProjNum}" has been copied successfully. Would you like to open this project now?`,
                okLabel: 'Open Project',
                cancelLabel: 'Close',
                showCancel: true
              },
              panelClass: ['themed-dialog']
            }).afterClosed().subscribe((result) => {
              if (result) {
                // Auto-open the project
                this.isLoadingProject = true;
                this.loadProject(newProjNum);
              }
            });

            // Create project directory on network share in background (fire and forget)
            this.networkAccessService.createProjectNetworkDirectory(newProjNum).subscribe({
              next: (response) => {
                if (response.success || !response.error) {
                  console.log(`✓ Network directory created for project ${newProjNum}`);
                } else {
                  console.warn(`⚠️ Failed to create network directory: ${response.error}`);
                }
              },
              error: (err) => {
                console.error(`✗ Error creating network directory: ${err.message}`);
              }
            });

            // Refresh the project list in the dialog
            if (projectSelectorInstance && projectSelectorInstance.refreshProjects) {
              projectSelectorInstance.refreshProjects();
            }
            
            // Show success message
            this.snackBar.open(`Project copied to ${copied.projectNum}`, 'Close', { duration: 3000 });
          },
          error: (err) => {
            this.isCreatingProject = false;
            this.cdr.markForCheck();
            
            console.error('✗ Copy failed');
            console.error('  Status:', err?.status);
            console.error('  Error object:', err?.error);
            console.error('  Message:', err?.message);
            console.error('  StatusText:', err?.statusText);
            const errorMsg = err?.error?.message || err?.message || err?.statusText || 'Unknown error';
            
            // Provide specific error messages for common issues
            let displayMsg = `Failed to copy project: ${errorMsg}`;
            if (errorMsg.includes('Referential integrity constraint') || errorMsg.includes('FOREIGN KEY')) {
              displayMsg = 'Copy failed: Some referenced parts no longer exist. Please verify the source project data and try again.';
            }
            
            this.snackBar.open(displayMsg, 'Close', { duration: 5000 });
          }
        });
    });
  }

  deleteProject(event?: Event): void {
    event?.stopPropagation();
    this.dialog.closeAll();
    const dialogRef = this.dialog.open(ProjectSelectorDialog, { width: '600px', data: { mode: 'delete', onlyFacilities: true }, panelClass: ['themed-dialog'] });
    const projectSelectorInstance = dialogRef.componentInstance;
    
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Delete dialog result:', result);
      
      if (!result) {
        console.log('Delete canceled - no result');
        return;
      }
      
      if (!result.selectedProject) {
        console.log('Delete canceled - no selectedProject');
        this.snackBar.open('No project selected', 'Close', { duration: 2000 });
        return;
      }
      
      const projectNumToDelete = result.selectedProject.projectNum || result.selectedProject;
      console.log(`Delete - Selected project: "${projectNumToDelete}"`);
      
      if (!projectNumToDelete || projectNumToDelete.trim() === '') {
        console.error('Invalid project number');
        this.snackBar.open('Invalid project number', 'Close', { duration: 2000 });
        return;
      }
      
      this.dialog.open(ConfirmDialogComponent, {
        width: '420px',
        panelClass: ['themed-dialog'],
        data: {
          title: 'Delete Project',
          message: `Are you sure you want to delete project ${projectNumToDelete}?`,
          okLabel: 'Delete',
          okColor: 'primary',
          cancelLabel: 'Cancel',
          showCancel: true
        }
      }).afterClosed().subscribe(confirmed => {
        console.log('Delete confirmation:', confirmed);
        
        if (!confirmed) { 
          console.log('Delete canceled by user');
          return; 
        }
        
        console.log(`About to delete project: "${projectNumToDelete}"`);
        this.projectService.deleteProject(projectNumToDelete)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              console.log('✓ Delete successful');
              
              // Refresh the project list in the dialog
              if (projectSelectorInstance && projectSelectorInstance.refreshProjects) {
                projectSelectorInstance.refreshProjects();
              }
              
              // Clear the currently opened project if it's the deleted one
              if (this.project.projectNum === projectNumToDelete) {
                this.project = this.createEmptyProject();
                this.projectOpened = false;
                this.isEditable = false;
                this.isNewProject = false;
                this.workItemsEnabled = false;
                this.cdr.markForCheck();
                localStorage.removeItem('activeProjectNum');
              }
              
              this.snackBar.open(`Project ${projectNumToDelete} deleted`, 'Close', { duration: 3000 });
            },
            error: (err) => {
              console.error('✗ Delete failed');
              console.error('  Status:', err?.status);
              console.error('  Error object:', err?.error);
              console.error('  Message:', err?.message);
              console.error('  StatusText:', err?.statusText);
              const errorMsg = err?.error?.message || err?.message || err?.statusText || 'Unknown error';
              this.snackBar.open(`Failed to delete project: ${errorMsg}`, 'Close', { duration: 4000 });
            }
          });
      });
    });
  }

  closeLandingDialogs(): void {
    if (this.dialog.openDialogs.length > 0) {
      this.dialog.closeAll();
    }
  }

  get hasOpenDialog(): boolean {
    return this.dialog.openDialogs.length > 0;
  }

  private loadProject(projectNum: string): void {
    const startTime = performance.now();
    console.log(`[LandingPage] 🔄 loadProject() START - projectNum: "${projectNum}" at ${new Date().toLocaleTimeString()}`);
    
    // Ensure loading spinner is visible
    this.isLoadingProject = true;
    this.cdr.markForCheck();
    
    this.projectService.getProject(projectNum)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (project) => {
          const responseTime = performance.now() - startTime;
          console.log(`[LandingPage] ✅ getProject API response received in ${responseTime.toFixed(2)}ms at ${new Date().toLocaleTimeString()}`);
          console.log('[LandingPage] 📦 Response data:', project);
          
          // Map eqId to earthquakeZone
          const eqIdToZoneMap: { [key: number]: string } = {
            1: 'low',
            2: 'moderate',
            3: 'heavy'
          };
          
          if (project.eqId) {
            project.earthquakeZone = eqIdToZoneMap[project.eqId] || '';
            console.log(`[LandingPage] Mapped eqId ${project.eqId} to zone: ${project.earthquakeZone}`);
          }
          
          // Map earthquakeZone to rise value
          if (project.earthquakeZone) {
            const zoneToRiseMap: { [key: string]: number } = {
              'low': 1,
              'moderate': 2,
              'heavy': 3
            };
            project.rise = zoneToRiseMap[project.earthquakeZone] || 0;
            console.log(`[LandingPage] Set rise to ${project.rise} based on zone`);
          }
          
          // Ensure floorHeight is a number
          if (project.floorHeight !== null && project.floorHeight !== undefined) {
            project.floorHeight = typeof project.floorHeight === 'string' ? 
              parseFloat(project.floorHeight) : project.floorHeight;
            console.log(`[LandingPage] Floor height: ${project.floorHeight}`);
          }
          
          const beforeAssignment = performance.now();
          this.project = project;
          this.projectOpened = true;
          // Set editability: if project is completed, all fields are read-only
          // If not completed, all fields except projectNum are editable
          this.isEditable = !project.completed;
          this.isNewProject = false;
          this.workItemsEnabled = true;
          this.tabIndex = 0;
          // this.projectStateService.saveProjectState(this.project, this.projectOpened, this.isEditable, this.workItemsEnabled, this.tabIndex);
          this.cdr.markForCheck();
          localStorage.setItem('activeProjectNum', projectNum);

          const assignmentTime = performance.now() - beforeAssignment;
          
          const totalTime = performance.now() - startTime;
          console.log(`[LandingPage] ⏱️  Timing breakdown:
            - API Response: ${responseTime.toFixed(2)}ms
            - Data Assignment: ${assignmentTime.toFixed(2)}ms
            - Total: ${totalTime.toFixed(2)}ms
            - Completed at: ${new Date().toLocaleTimeString()}`);
          this.isLoadingProject = false;
        },
        error: (err) => {
          const errorTime = performance.now() - startTime;
          console.error(`[LandingPage] ❌ getProject FAILED after ${errorTime.toFixed(2)}ms - Error:`, err);
          this.snackBar.open('Failed to load project', 'Close', { duration: 3000 });
          this.isLoadingProject = false;
        }
      });
  }

  // ============ Navigation Methods ============

  showWorkItems(): void {
    if (this.projectOpened) {
      // this.projectStateService.saveProjectState(this.project, this.projectOpened, this.isEditable, this.workItemsEnabled, this.tabIndex);
      this.router.navigate(['/projects', this.project.projectNum, 'work-items'], {
        state: { projectNum: this.project.projectNum, project: this.project }
      });
    }
  }

  downloadRunList(): void {
    if (!this.projectOpened) return;
    const projectNum = this.project.projectNum;
    this.isDownloading = true;
    this.runListService.downloadRunList(projectNum).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectNum}RUN_LIST.xls`;
        a.click();
        URL.revokeObjectURL(url);
        this.isDownloading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isDownloading = false;
        this.cdr.detectChanges();
        this.snackBar.open('Failed to download run list. File may be missing from project directory.', 'Close', { duration: 4000 });
      }
    });
  }

  uploadRunList(): void {
    if (this.projectOpened) {
      this.router.navigate(['/projects', this.project.projectNum, 'run-list-upload'], {
        state: { projectNum: this.project.projectNum, project: this.project }
      });
    }
  }

  showReports(): void {
    // console.log("work in progress");
    if (this.projectOpened) {
      // this.projectStateService.saveProjectState(this.project, this.projectOpened, this.isEditable, this.workItemsEnabled, this.tabIndex);
      this.router.navigate(['/projects', this.project.projectNum, 'reports'], {
        state: { projectNum: this.project.projectNum, project: this.project }
      });
    }
  }

  showNotes(): void {
    if (!this.projectOpened || !this.project?.projectNum) return;

    // Show dialog to select format (PDF or Word)
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
      if (result === undefined || result === null) return; // Dialog closed without selection

      const format = result; // result will be 'pdf' or 'docx' directly
      const filename = `General_Notes.${format}`;

      this.isDownloading = true;

      // Download template from API
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
          this.isDownloading = false;
          this.cdr.detectChanges();
          this.snackBar.open(`Downloaded ${filename}`, 'Close', { duration: 3000 });
        },
        error: (err) => {
          this.isDownloading = false;
          this.cdr.detectChanges();
          console.error('Download error:', err);
          this.snackBar.open(`Failed to download ${filename}. File may be missing from templates directory.`, 'Close', { duration: 5000 });
        }
      });
    });
  }

  showEditTab(tabIndex: number): void {
    if (this.projectOpened) {
      this.router.navigate(['/projects', this.project.projectNum, 'edit'], { queryParams: { tab: tabIndex } });
    }
  }

  openTemplateTOC(): void {
    if (!this.projectOpened || !this.project?.projectNum) return;

    const filename = `${this.project.projectNum}TOC.doc`;
    this.isDownloading = true;
    
    // Download TOC from project folder
    this.http.get(`${environment.apiUrl}/api/projects/${this.project.projectNum}/reports/toc`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
        this.cdr.detectChanges();
        this.snackBar.open(`Downloaded ${filename}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.isDownloading = false;
        this.cdr.detectChanges();
        console.error('TOC download error:', err);
        this.snackBar.open(`Failed to download ${filename}. File may be missing from project folder.`, 'Close', { duration: 5000 });
      }
    });
  }

  openTemplateDIS(): void {
    if (!this.projectOpened || !this.project?.projectNum) return;

    const filename = `${this.project.projectNum}DIS.doc`;
    this.isDownloading = true;
    
    // Download DIS from project folder
    this.http.get(`${environment.apiUrl}/api/projects/${this.project.projectNum}/reports/dis`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isDownloading = false;
        this.cdr.detectChanges();
        this.snackBar.open(`Downloaded ${filename}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.isDownloading = false;
        this.cdr.detectChanges();
        console.error('DIS download error:', err);
        this.snackBar.open(`Failed to download ${filename}. File may be missing from project folder.`, 'Close', { duration: 5000 });
      }
    });
  }

  // Admin button moved to user dropdown in header
  // showAdmin(): void {
  //   this.router.navigate(['/admin']);
  // }

  /**
   * Debug method to list network path contents in the console.
   * Useful for troubleshooting network access issues.
   */
  // debugListNetworkPath(): void {
  //   console.log('[LandingPage] Listing network path contents...');
  //   this.networkAccessService.listNetworkPathContents()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (data) => {
  //         console.log('[LandingPage] Network path listing complete');
  //         this.snackBar.open('Network path contents listed in console', 'Close', { duration: 3000 });
  //       },
  //       error: (err) => {
  //         console.error('[LandingPage] Error listing network path:', err);
  //         this.snackBar.open('Error listing network path - check console', 'Close', { duration: 3000 });
  //       }
  //     });
  // }

  onEarthquakeZoneChange(): void {
    // Map zone values to rise values
    const zoneToRiseMap: { [key: string]: number } = {
      'low': 1,
      'moderate': 2,
      'heavy': 3
    };
    
    const zone = this.project.earthquakeZone || '';
    const rise = zoneToRiseMap[zone] || 0;
    
    console.log(`[LandingPage] Zone changed to: ${zone}, Setting Rise to: ${rise}`);
    this.project.rise = rise;
    this.cdr.markForCheck();
  }

  formatFloorHeight(): void {
    if (this.project.floorHeight !== null && this.project.floorHeight !== undefined) {
      // Convert to number and format to 2 decimal places
      const value = parseFloat(this.project.floorHeight.toString());
      if (!isNaN(value)) {
        this.project.floorHeight = Math.round(value * 100) / 100;
      }
    }
  }

  onFloorHeightInput(value: string): void {
    if (value === '' || value === null) {
      // Keep the current value or set to 0 for empty input
      return;
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        this.project.floorHeight = numValue;
      }
    }
  }
}