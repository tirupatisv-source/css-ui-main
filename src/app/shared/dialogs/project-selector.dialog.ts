import { Component, Inject, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/models';
import { DialogKeyboardNavDirective } from '../directives/dialog-keyboard-nav.directive';

export type ProjectSelectorMode = 'open' | 'copy' | 'delete';

export interface ProjectSelectorData {
  mode: ProjectSelectorMode;
  selectedProjectNum?: string;
  onlyFacilities?: boolean;
}

export interface ProjectSelectorResult {
  selectedProject: Project;
  newProjectNum?: string;
}

@Component({
  selector: 'app-project-selector-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    DialogKeyboardNavDirective
  ],
  template: `
    <div appDialogKeyboardNav (keydown)="onDialogKeydown($event)">
      <div class="dialog-header-wrapper">
        <h2 mat-dialog-title class="sticky-header">{{ title }}</h2>
        <span (mousedown)="closeDialog(); $event.stopPropagation(); $event.preventDefault()" class="close-btn">&#x2715;</span>
      </div>

    <mat-dialog-content class="no-scroll">
      <mat-form-field appearance="outline" class="full-width search-field">
        <mat-label>Search Projects</mat-label>
        <input matInput #searchInput id="search-input" [(ngModel)]="searchText" (change)="onSearchChange($event)" 
               (keydown.enter)="selectFirstProject()" 
               placeholder="Project number, city, state, owner..." />
        <mat-icon matSuffix class="search-icon" *ngIf="!searchPerforming">search</mat-icon>
        <mat-spinner *ngIf="searchPerforming" matSuffix [diameter]="20" [strokeWidth]="2"></mat-spinner>
      </mat-form-field>

      <mat-form-field *ngIf="isCopyMode" appearance="outline" class="full-width copy-field">
        <mat-label>New Project Number</mat-label>
        <input matInput [(ngModel)]="newProjectNum" maxlength="40" required 
               (keydown.enter)="canSubmit() && submit()" />
      </mat-form-field>

      <div *ngIf="loading; else loadedContent">
        <div class="spinner-wrapper">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      </div>
      <ng-template #loadedContent>
        <div class="group-grid">
          <div class="group-card">
            <h3>Facilities</h3>
            <!-- Horizontal scroll wrapper -->
            <div class="table-scroll-wrapper" [class.copy-mode]="data.mode === 'copy'">
              <div class="list-wrapper">
                <table class="project-table">
                  <thead>
                    <tr>
                      <th>Project Number</th>
                      <th>City</th>
                      <th>State</th>
                      <th>Issue Date</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let project of getPaginatedFacilities()" [class.selected]="selectedProject && selectedProject.projectNum === project.projectNum" (click)="selectProject(project)">
                      <td>{{ project.projectNum }}</td>
                      <td>{{ project.city }}</td>
                      <td>{{ project.stateOrProv }}</td>
                      <td>{{ project.dateOfIssue ? (project.dateOfIssue | date:'yyyy-MM-dd') : '' }}</td>
                      <td>{{ project.userName }}</td>
                    </tr>
                    <tr *ngIf="getPaginatedFacilities().length === 0"><td colspan="5" class="empty-text">No matching projects</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Pagination controls -->
            <div class="pagination-controls" *ngIf="getTotalPages() > 1">
              <button mat-icon-button (click)="previousPage()" [disabled]="currentPage === 0">
                <mat-icon>navigate_before</mat-icon>
              </button>
              <span class="page-info">{{ getPaginationRangeDisplay() }}</span>
              <button mat-icon-button (click)="nextPage()" [disabled]="currentPage >= getTotalPages() - 1">
                <mat-icon>navigate_next</mat-icon>
              </button>
            </div>
          </div>

          <!-- COMMENTED OUT - Transport/Haul/Metro not required per business
          <ng-container *ngIf="!data.onlyFacilities">
            <div class="group-card">
              <h3>Transport - Long Haul</h3>
              <div class="list-wrapper">
                <button mat-button class="project-row" *ngFor="let project of filteredLongHaul()"
                        [class.selected]="selectedProject && selectedProject.projectNum === project.projectNum"
                        (click)="selectProject(project)">
                  <span>{{ project.projectNum }}</span>
                  <small>{{ project.city || 'N/A' }} {{ project.stateOrProv || '' }}</small>
                </button>
                <p class="empty-text" *ngIf="filteredLongHaul().length === 0">No matching projects</p>
              </div>
            </div>

            <div class="group-card">
              <h3>Transport - Metro</h3>
              <div class="list-wrapper">
                <button mat-button class="project-row" *ngFor="let project of filteredMetro()"
                        [class.selected]="selectedProject && selectedProject.projectNum === project.projectNum"
                        (click)="selectProject(project)">
                  <span>{{ project.projectNum }}</span>
                  <small>{{ project.city || 'N/A' }} {{ project.stateOrProv || '' }}</small>
                </button>
                <p class="empty-text" *ngIf="filteredMetro().length === 0">No matching projects</p>
              </div>
            </div>
          </ng-container>
          -->
        </div>
      </ng-template>

      <p class="error-text" *ngIf="error">{{ error }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end" *ngIf="selectedProject" class="dialog-actions-footer">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary"
              [disabled]="!canSubmit()"
              (click)="submit()">
        {{ actionLabel }}
      </button>
    </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .full-width { width: 100%; box-sizing: border-box; }
    :host {
      display: block;
      max-height: 94vh;
      overflow: hidden;
      padding: 0 14px;
      box-sizing: border-box;
    }
    .dialog-header-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 0 8px;
      box-sizing: border-box;
    }
    .sticky-header {
      flex: 1;
      margin: 0;
      padding-left: 3px;
      box-sizing: border-box;
    }
    .close-btn {
      cursor: pointer;
      font-size: 22px;
      color: #ff9800;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      transition: background 0.2s;
      border-radius: 50%;
    }
    .close-btn:hover {
      background: #f0f0f0;
    }
    .search-field { 
      margin-top: 12px;
    }
    .search-icon {
      color: #ff9800 !important;
    }
    .search-field ::ng-deep .mdc-notched-outline__leading,
    .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__leading {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-left: 2px solid #ff9800 !important;
      background-clip: padding-box !important;
      box-shadow: none !important;
      min-width: 12px !important;
      width: 12px !important;
      border-radius: 4px 0 0 4px !important;
      height: 100%;
    }
    .search-field ::ng-deep .mdc-notched-outline__notch,
    .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-bottom: 2px solid #ff9800 !important;
      border-left: none !important;
      border-right: none !important;
    }
    
    /* Hide top border in notch when field is focused, has content, or both */
    .search-field ::ng-deep .mdc-text-field--focused .mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-text-field--filled .mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-text-field--focused.mdc-text-field--filled .mdc-notched-outline__notch {
      border-top: none !important;
    }
    
    /* Additional specificity for mat-mdc-notch-piece */
    .search-field ::ng-deep .mdc-text-field--focused .mat-mdc-notch-piece.mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-text-field--filled .mat-mdc-notch-piece.mdc-notched-outline__notch,
    .search-field ::ng-deep .mdc-text-field--focused.mdc-text-field--filled .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-top: none !important;
    }
    .search-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__trailing {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-right: 2px solid #ff9800 !important;
      border-radius: 0 4px 4px 0 !important;
    }
    .search-field ::ng-deep input.mat-mdc-input-element {
      padding-left: 10px !important;
      padding-right: 10px !important;
      border-radius: 4px !important;
    }
    .search-field ::ng-deep .mdc-line-ripple {
      display: none !important;
    }
    /* .search-icon custom styling removed */
    .copy-field {
      margin-top: 0;
    }
    .copy-field ::ng-deep .mdc-notched-outline__leading,
    .copy-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__leading {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-left: 2px solid #ff9800 !important;
      background-clip: padding-box !important;
      box-shadow: none !important;
      min-width: 12px !important;
      width: 12px !important;
      border-radius: 4px 0 0 4px !important;
      height: 100%;
    }
    .copy-field ::ng-deep .mdc-notched-outline__notch,
    .copy-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-left: none !important;
      border-right: none !important;
    }
    
    /* Hide top border in notch when field is focused, has content, or both */
    .copy-field ::ng-deep .mdc-text-field--focused .mdc-notched-outline__notch,
    .copy-field ::ng-deep .mdc-text-field--filled .mdc-notched-outline__notch,
    .copy-field ::ng-deep .mdc-text-field--focused.mdc-text-field--filled .mdc-notched-outline__notch {
      border-top: none !important;
    }
    
    /* Additional specificity for mat-mdc-notch-piece */
    .copy-field ::ng-deep .mdc-text-field--focused .mat-mdc-notch-piece.mdc-notched-outline__notch,
    .copy-field ::ng-deep .mdc-text-field--filled .mat-mdc-notch-piece.mdc-notched-outline__notch,
    .copy-field ::ng-deep .mdc-text-field--focused.mdc-text-field--filled .mat-mdc-notch-piece.mdc-notched-outline__notch {
      border-top: none !important;
    }
    .copy-field ::ng-deep .mat-mdc-notch-piece.mdc-notched-outline__trailing {
      border-top: 2px solid #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      border-right: 2px solid #ff9800 !important;
      border-radius: 0 4px 4px 0 !important;
    }
    .copy-field ::ng-deep input.mat-mdc-input-element {
      padding-left: 10px !important;
      padding-right: 10px !important;
      border-radius: 4px !important;
    }
    .copy-field ::ng-deep .mdc-line-ripple {
      display: none !important;
    }
    .spinner-wrapper { display: flex; justify-content: center; padding: 24px; }
    .group-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin: 0; padding: 0; width: 100%; box-sizing: border-box; }
    .group-card { border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 8px; padding: 8px 14px; min-height: 220px; width: 100%; margin: 0; box-sizing: border-box; }
    .group-card h3 { margin: 4px 0 8px; font-size: 14px; }
    .table-scroll-wrapper { 
      overflow-x: hidden; 
      overflow-y: auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      max-height: 300px;
      margin-bottom: 12px;
      width: 100%;
      box-sizing: border-box;
    }
    .table-scroll-wrapper.copy-mode {
      max-height: 200px;
    }
    .table-scroll-wrapper::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .table-scroll-wrapper::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    .table-scroll-wrapper::-webkit-scrollbar-thumb {
      background: #ff9800;
      border-radius: 4px;
    }
    .table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
      background: #e68900;
    }
    .list-wrapper { 
      display: flex; 
      flex-direction: column; 
      gap: 0;
      width: 100%;
      min-width: 100%;
      box-sizing: border-box;
    }
    .pagination-controls {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 8px;
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 12px;
    }
    .page-info {
      color: #666;
      min-width: 200px;
      text-align: center;
    }
    .dialog-actions-footer {
      position: sticky;
      bottom: 0;
      background: white;
      border-top: 1px solid #e0e0e0;
      padding-top: 12px !important;
      padding-left: 8px !important;
      padding-right: 8px !important;
      box-sizing: border-box;
      z-index: 10;
    }
    .sticky-header {
      position: sticky;
      top: 0;
      background: #fff;
      z-index: 2;
      padding-bottom: 8px;
    }
    .no-scroll {
      overflow: visible !important;
      max-height: none !important;
      padding-left: 8px !important;
      padding-right: 8px !important;
      box-sizing: border-box;
    }
    .project-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      table-layout: fixed;
    }
    .project-table th, .project-table td {
      border: 1px solid #e0e0e0;
      padding: 6px 8px;
      text-align: left;
      word-break: break-word;
    }
    .project-table th:nth-child(3), .project-table td:nth-child(3) {
      width: 55px;
    }
    .project-table th:nth-child(4), .project-table td:nth-child(4) {
      width: 92px;
    }
    .project-table tr.selected td:first-child {
      border-left: 3px solid #ff9800 !important;
    }
    .project-table tr.selected {
      background: #f1ece5;
      border-color: #f1ece5;
    }
    .empty-text { color: rgba(0, 0, 0, 0.6); font-size: 12px; margin: 8px; }
    .error-text { color: #b00020; margin-top: 8px; }
    @media (max-width: 1100px) {
      .group-grid { grid-template-columns: 1fr; }
      .group-card { min-height: 0; }
    }

    /* ====== DARK MODE ====== */
    :host-context([data-theme="dark"]) .sticky-header {
      background: #1e1e1e !important;
    }
    :host-context([data-theme="dark"]) .search-icon {
      color: #ff9800 !important;
    }
    :host-context([data-theme="dark"]) .dialog-header-wrapper {
      background: #1e1e1e !important;
    }
    /* .close-button dark mode styling removed */
    :host-context([data-theme="dark"]) .project-table th {
      background: #2a1a08 !important;
      color: #ff9800 !important;
      border-color: #424242 !important;
    }
    :host-context([data-theme="dark"]) .project-table td {
      color: #e0e0e0 !important;
      border-color: #424242 !important;
    }
    :host-context([data-theme="dark"]) .project-table tr.selected {
      background: #3d2a10 !important;
    }
    :host-context([data-theme="dark"]) .project-table tr.selected td:first-child {
      border-left: 3px solid #ff9800 !important;
    }
    :host-context([data-theme="dark"]) .project-table tr:hover td {
      background: #2a2520 !important;
    }
    :host-context([data-theme="dark"]) .group-card {
      border-color: #424242 !important;
      background: #1e1e1e !important;
    }
    :host-context([data-theme="dark"]) .empty-text {
      color: #9e9e9e !important;
    }
    :host-context([data-theme="dark"]) .error-text {
      color: #ef9a9a !important;
    }
    :host-context([data-theme="dark"]) .table-scroll-wrapper {
      border-color: #424242 !important;
      background: #1e1e1e !important;
    }
    :host-context([data-theme="dark"]) .table-scroll-wrapper.copy-mode {
      max-height: 200px;
    }
    :host-context([data-theme="dark"]) .table-scroll-wrapper::-webkit-scrollbar-track {
      background: #2a2a2a !important;
    }
    :host-context([data-theme="dark"]) .table-scroll-wrapper::-webkit-scrollbar-thumb {
      background: #ff9800 !important;
    }
    :host-context([data-theme="dark"]) .table-scroll-wrapper::-webkit-scrollbar-thumb:hover {
      background: #ffb74d !important;
    }
    :host-context([data-theme="dark"]) .pagination-controls {
      background: #2a2a2a !important;
      border-color: #424242 !important;
      color: #e0e0e0 !important;
    }
    :host-context([data-theme="dark"]) .page-info {
      color: #b0b0b0 !important;
      min-width: 200px;
    }
    :host-context([data-theme="dark"]) .pagination-controls button[mat-icon-button][disabled] {
      color: #666 !important;
    }
    :host-context([data-theme="dark"]) .dialog-actions-footer {
      background: #1e1e1e !important;
      border-top-color: #424242 !important;
    }
  `]
})
export class ProjectSelectorDialog implements OnInit, OnDestroy {
  searchText = '';
  newProjectNum = '';
  currentPage = 0;
  private readonly itemsPerPage = 50;
  totalProjectsCount = 0;
  totalSearchResultsCount = 0;

  facilities: Project[] = [];
  selectedProject: Project | null = null;
  loading = false;
  error = '';
  searchPerforming = false;

  // Search optimization
  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(
    private projectService: ProjectService,
    private dialogRef: MatDialogRef<ProjectSelectorDialog, ProjectSelectorResult>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: ProjectSelectorData
  ) {}

  onDialogKeydown(event: KeyboardEvent): void {
    // Alt+O: Open/select project
    if (event.altKey && event.key.toLowerCase() === 'o' && this.canSubmit()) {
      event.preventDefault();
      this.submit();
      return;
    }

    // Alt+C: Cancel/Close dialog
    if (event.altKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      this.closeDialog();
      return;
    }

    // Escape: Close dialog
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeDialog();
      return;
    }

    // Arrow Down in search: Move focus to project list
    if (event.key === 'ArrowDown' && document.activeElement?.id === 'search-input') {
      event.preventDefault();
      const firstRow = document.querySelector('.project-table tbody tr:not(.empty-text)') as HTMLElement;
      if (firstRow) {
        firstRow.focus();
      }
    }
  }

  ngOnInit(): void {
    // Setup debounced search
    const searchSub = this.searchSubject.pipe(
      debounceTime(300),                    // Wait 300ms after user stops typing
      distinctUntilChanged(),               // Only search if text actually changed
      switchMap(searchTerm => {
        this.searchPerforming = true;
        this.currentPage = 0;               // Reset to first page on new search
        this.cdr.markForCheck();
        return this.projectService.getProjects(0, this.itemsPerPage, searchTerm || undefined);
      })
    ).subscribe({
      next: (projects) => {
        this.facilities = projects;
        this.searchPerforming = false;
        this.cdr.markForCheck();
        // Fetch total count for pagination info
        if (this.searchText.trim()) {
          this.projectService.getProjectsCount(this.searchText.trim()).subscribe(
            result => {
              this.totalSearchResultsCount = result.count;
              this.cdr.markForCheck();
            }
          );
        } else {
          this.totalSearchResultsCount = this.totalProjectsCount;
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.searchPerforming = false;
        this.error = 'Search failed';
        this.cdr.markForCheck();
      }
    });
    this.subscriptions.push(searchSub);

    // Load initial projects (first 50)
    this.loadInitialProjects();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadInitialProjects(): void {
    this.loading = true;
    this.error = '';
    this.facilities = [];
    this.currentPage = 0;

    // Load first page of projects
    this.projectService.getProjects(0, this.itemsPerPage).subscribe({
      next: (projects) => {
        this.facilities = projects;
        this.loading = false;
        
        // Get total count
        this.projectService.getProjectsCount().subscribe(
          result => {
            this.totalProjectsCount = result.count;
            this.totalSearchResultsCount = result.count;
            this.cdr.markForCheck();
          }
        );

        if (this.data.selectedProjectNum) {
          const found = projects.find(p => p.projectNum === this.data.selectedProjectNum) || null;
          this.selectedProject = found;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load projects';
        this.cdr.markForCheck();
      }
    });
  }

  onSearchChange(event: any): void {
    // Emit search term to debounced subject
    this.searchSubject.next(event.target?.value || '');
  }

  /**
   * Refresh the project list - called after copy/delete operations
   * to show updated data immediately without closing the dialog
   */
  refreshProjects(): void {
    console.log('[ProjectSelectorDialog] Refreshing project list...');
    this.searchText = '';
    this.currentPage = 0;
    this.selectedProject = null;
    this.loadInitialProjects();
  }

  get isCopyMode(): boolean {
    return this.data.mode === 'copy';
  }

  get title(): string {
    if (this.data.mode === 'copy') {
      return 'Copy Project';
    }
    if (this.data.mode === 'delete') {
      return 'Delete Project';
    }
    return 'Open Project';
  }


  get actionLabel(): string {
    if (this.data.mode === 'copy') {
      return 'Copy';
    }
    if (this.data.mode === 'delete') {
      return 'Delete';
    }
    return 'Open';
  }

  getPaginatedFacilities(): Project[] {
    // All items in facilities are already from current search/page from server
    return this.facilities;
  }

  getTotalPages(): number {
    const total = this.totalSearchResultsCount > 0 ? this.totalSearchResultsCount : this.totalProjectsCount;
    return Math.ceil(total / this.itemsPerPage);
  }

  getPaginationRangeDisplay(): string {
    if (this.facilities.length === 0) {
      return '0 of ' + (this.totalSearchResultsCount || this.totalProjectsCount);
    }
    
    const start = this.currentPage * this.itemsPerPage + 1;
    const end = Math.min((this.currentPage + 1) * this.itemsPerPage, this.totalSearchResultsCount || this.totalProjectsCount);
    const total = this.totalSearchResultsCount || this.totalProjectsCount;
    
    return `${start}-${end} of ${total}`;
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPage();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages() - 1) {
      this.currentPage++;
      this.loadPage();
    }
  }

  private loadPage(): void {
    this.loading = true;
    const searchTerm = this.searchText.trim() || undefined;
    this.projectService.getProjects(this.currentPage, this.itemsPerPage, searchTerm).subscribe({
      next: (projects) => {
        this.facilities = projects;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load page';
        this.cdr.markForCheck();
      }
    });
  }

  selectProject(project: Project): void {
    this.selectedProject = project;
    this.searchText = project.projectNum;
    this.currentPage = 0; // Reset pagination when selecting a project
    this.cdr.markForCheck();  // Force selection display
    // Do not close the dialog immediately in open/copy mode; wait for explicit confirmation
  }

  selectFirstProject(): void {
    if (this.facilities.length > 0) {
      this.selectProject(this.facilities[0]);
    }
  }

  canSubmit(): boolean {
    if (!this.selectedProject) {
      return false;
    }
    if (this.isCopyMode && !this.newProjectNum.trim()) {
      return false;
    }
    return true;
  }

  submit(): void {
    const selectedProject = this.selectedProject;
    if (!selectedProject) {
      return;
    }

    this.dialogRef.close({
      selectedProject,
      newProjectNum: this.isCopyMode ? this.newProjectNum.trim() : undefined
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }


}
