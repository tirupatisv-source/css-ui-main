import { Injectable } from '@angular/core';
import { Project } from '../models/models';

/**
 * Service to preserve project state across navigation
 * Stores the currently opened/created/copied project so it persists when navigating away and back
 */
@Injectable({
  providedIn: 'root'
})
export class ProjectStateService {
  private currentProject: Project | null = null;
  private projectOpened = false;
  private isEditable = false;
  private workItemsEnabled = false;
  private tabIndex = 0;

  /**
   * Save the current project state
   */
  saveProjectState(project: Project, isOpened: boolean, editable: boolean, itemsEnabled: boolean, activeTab: number): void {
    this.currentProject = { ...project };
    this.projectOpened = isOpened;
    this.isEditable = editable;
    this.workItemsEnabled = itemsEnabled;
    this.tabIndex = activeTab;
    console.log('[ProjectStateService] State saved:', { projectNum: project.projectNum, isOpened, editable });
  }

  /**
   * Get the saved project state
   */
  getProjectState(): {
    project: Project | null;
    projectOpened: boolean;
    isEditable: boolean;
    workItemsEnabled: boolean;
    tabIndex: number;
  } {
    return {
      project: this.currentProject,
      projectOpened: this.projectOpened,
      isEditable: this.isEditable,
      workItemsEnabled: this.workItemsEnabled,
      tabIndex: this.tabIndex
    };
  }

  /**
   * Check if there is saved project state
   */
  hasProjectState(): boolean {
    return this.currentProject != null && this.projectOpened;
  }

  /**
   * Clear the saved project state
   */
  clearProjectState(): void {
    this.currentProject = null;
    this.projectOpened = false;
    this.isEditable = false;
    this.workItemsEnabled = false;
    this.tabIndex = 0;
    console.log('[ProjectStateService] State cleared');
  }
}
