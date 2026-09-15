import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule
  ],
  template: `
    <!-- Edit Header Section -->
    <div class="edit-page-header">
      <div class="header-left">
        <button mat-button class="back-button" (click)="backToProject()">
          <mat-icon>arrow_back</mat-icon>
          <span>Back to Project: {{currentProjectNum}}</span>
        </button>
        
      </div>
      <div class="header-right">
        <span class="project-number-right">Edit</span>
      </div>
    </div>
    <div class="header-divider"></div>

    

    <div class="edit-tabs-wrapper">
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="edit-tabs">
        <mat-tab label="Table of Contents">
          <!-- Table of Contents -->
          <div class="edit-section">
            <div class="edit-section-header">
              
            </div>
            <table class="edit-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Section Title</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let section of tocSections; let i = index">
                  <td>{{ section.order }}</td>
                  <td><input [(ngModel)]="section.title" placeholder="Section Title" /></td>
                  <td><button mat-icon-button color="warn" (click)="removeTocSection(i)"><mat-icon>delete</mat-icon></button></td>
                </tr>
              </tbody>
            </table>
            <div class="action-button-container">
              <button mat-raised-button color="primary" (click)="addTocSection()">Add Section</button>
            </div>
          </div>
        </mat-tab>
        <mat-tab label="Drawing Information">
          <!-- Drawing Information -->
          <div class="edit-section">
            <div class="edit-section-header">
              <!-- <h2>Drawing Information</h2> -->
            </div>
            <table class="edit-table">
              <thead>
                <tr>
                  <th>Drawing Number</th>
                  <th>Description</th>
                  <th>File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let drawing of drawings; let i = index">
                  <td><input [(ngModel)]="drawing.number" placeholder="Drawing Number" /></td>
                  <td><input [(ngModel)]="drawing.description" placeholder="Description" /></td>
                  <td><input [(ngModel)]="drawing.file" placeholder="File Name or URL" /></td>
                  <td><button mat-icon-button color="warn" (click)="removeDrawing(i)"><mat-icon>delete</mat-icon></button></td>
                </tr>
              </tbody>
            </table>
            <div class="action-button-container">
              <button mat-raised-button color="primary" (click)="addDrawing()">Add Drawing</button>
            </div>
          </div>
        </mat-tab>
        <mat-tab label="Cable Run List">
          <!-- Cable Run List -->
          <div class="edit-section">
            <div class="edit-section-header">
              <!-- <h2>Cable Run List</h2> -->
            </div>
            <table class="edit-table">
              <thead>
                <tr>
                  <th>Cable ID</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Type</th>
                  <th>Length (m)</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let run of runList; let i = index">
                  <td><input [(ngModel)]="run.cableId" placeholder="Cable ID" /></td>
                  <td><input [(ngModel)]="run.start" placeholder="Start" /></td>
                  <td><input [(ngModel)]="run.end" placeholder="End" /></td>
                  <td><input [(ngModel)]="run.type" placeholder="Type" /></td>
                  <td><input [(ngModel)]="run.length" type="number" placeholder="Length" /></td>
                  <td><input [(ngModel)]="run.notes" placeholder="Notes" /></td>
                  <td><button mat-icon-button color="warn" (click)="removeRun(i)"><mat-icon>delete</mat-icon></button></td>
                </tr>
              </tbody>
            </table>
            <div class="action-button-container">
              <button mat-raised-button color="primary" (click)="addRun()">Add Run</button>
            </div>
          </div>
        </mat-tab>
        <mat-tab label="Power Run List Report">
          <!-- Power Run List Report -->
          <div class="edit-section">
            <div class="edit-section-header">
              <!-- <h2>Power Run List Report</h2> -->
            </div>
            <table class="edit-table">
              <thead>
                <tr>
                  <th>Power Cable ID</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Type</th>
                  <th>Length (m)</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let run of powerRunList; let i = index">
                  <td><input [(ngModel)]="run.cableId" placeholder="Power Cable ID" /></td>
                  <td><input [(ngModel)]="run.start" placeholder="Start" /></td>
                  <td><input [(ngModel)]="run.end" placeholder="End" /></td>
                  <td><input [(ngModel)]="run.type" placeholder="Type" /></td>
                  <td><input [(ngModel)]="run.length" type="number" placeholder="Length" /></td>
                  <td><input [(ngModel)]="run.notes" placeholder="Notes" /></td>
                  <td><button mat-icon-button color="warn" (click)="removePowerRun(i)"><mat-icon>delete</mat-icon></button></td>
                </tr>
              </tbody>
            </table>
            <div class="action-button-container">
              <button mat-raised-button color="primary" (click)="addPowerRun()">Add Power Run</button>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    /* ============ Host ============ */
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    /* ============ Page Header ============ */
    .edit-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 32px;
      background-color: #ffffff;
      border-bottom: 1px solid #e5e7eb;
      min-height: 64px;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .back-button {
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

    .back-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #6b7280;
      transition: color 0.2s;
    }

    .back-button:hover {
      background-color: #f0f4f8;
      color: #ff9800;
    }

    .back-button:hover mat-icon {
      color: #ff9800;
    }

    .header-right {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .project-number-right {
      font-size: 20px;
      font-weight: 400;
      color: #8a4d00;
      margin: 0;
      padding: 0;
      white-space: nowrap;
    }

    .header-divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 0;
      flex-shrink: 0;
    }

    /* ============ Tab Wrapper — mirrors .landing-body ============ */
    .edit-tabs-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
      flex: 1;
      min-height: 0;
      background: #f5f5f5;
      overflow-x: hidden;
      overflow-y: auto;
      box-sizing: border-box;
    }

    /* ============ Tab Group — mirrors landing-body mat-tab-group ============ */
    .edit-tabs {
      background: white;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 100%;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;

      --mat-tab-active-label-text-color: #ff9800 !important;
      --mat-tab-inactive-label-text-color: #6b7280 !important;
      --mat-tab-focus-state-layer-color: #ff9800 !important;
      --mdc-tab-indicator-color: #ff9800 !important;
      --mat-tab-indicator-color: #ff9800 !important;
    }

    /* Tab label bar */
    .edit-tabs ::ng-deep .mat-mdc-tab-labels {
      background: #f9f9f9;
      border-bottom: 1px solid #e0e0e0;
      overflow-x: hidden;
      overflow-y: hidden;
      position: sticky;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
    }

    /* ALL tab labels — default inactive */
    .edit-tabs ::ng-deep .mat-mdc-tab-label {
      min-width: 140px;
      transition: color 0.2s ease;
      color: #6b7280 !important;
    }

    .edit-tabs ::ng-deep .mat-mdc-tab-label .mdc-tab__text-label {
      color: #6b7280 !important;
    }

    /* Active tab label — all selectors mirrored from landing page */
    .edit-tabs ::ng-deep .mat-mdc-tab-label[aria-selected="true"],
    .edit-tabs ::ng-deep .mat-mdc-tab-label.mat-mdc-tab-label-active,
    .edit-tabs ::ng-deep mat-mdc-tab.mdc-tab--active {
      color: #ff9800 !important;
      background-color: #f1ece5 !important;
    }

    .edit-tabs ::ng-deep .mat-mdc-tab-label[aria-selected="true"] .mdc-tab__text-label,
    .edit-tabs ::ng-deep .mat-mdc-tab-label.mat-mdc-tab-label-active .mdc-tab__text-label,
    .edit-tabs ::ng-deep mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
      color: #ff9800 !important;
    }

    /* Active tab container background */
    .edit-tabs ::ng-deep mat-mdc-tab[aria-selected="true"],
    .edit-tabs ::ng-deep .mdc-tab--active {
      background-color: #f1ece5 !important;
    }

    /* Role selector */
    .edit-tabs ::ng-deep [role="tab"][aria-selected="true"] {
      background-color: #f1ece5 !important;
    }

    /* Catch-all active text */
    .edit-tabs ::ng-deep .mdc-tab--active .mdc-tab__text-label {
      color: #ff9800 !important;
    }

    /* Focus / hover on active tab */
    .edit-tabs ::ng-deep mat-mdc-tab.mdc-tab--active:focus .mdc-tab__text-label,
    .edit-tabs ::ng-deep mat-mdc-tab.mdc-tab--active:hover .mdc-tab__text-label {
      color: #ff9800 !important;
    }

    /* Hover on inactive tabs */
    .edit-tabs ::ng-deep .mat-mdc-tab-label:hover:not(.mat-mdc-tab-label-disabled):not([aria-selected="true"]) {
      background-color: #f1ece5 !important;
    }

    .edit-tabs ::ng-deep .mat-mdc-tab-label:hover:not(.mat-mdc-tab-label-disabled):not([aria-selected="true"]) .mdc-tab__text-label {
      color: #ff9800 !important;
    }

    /* Tab indicator — positioned at bottom, orange */
    .edit-tabs ::ng-deep .mdc-tab-indicator {
      display: block !important;
      height: 2px !important;
      position: absolute !important;
      bottom: 0 !important;
      top: auto !important;
    }

    .edit-tabs ::ng-deep .mdc-tab--active .mdc-tab-indicator {
      display: block !important;
      height: 2px !important;
      position: absolute !important;
      bottom: 0 !important;
      top: auto !important;
    }

    .edit-tabs ::ng-deep .mdc-tab-indicator__content {
      display: block !important;
      height: 2px !important;
      background-color: #ff9800 !important;
      border: none !important;
      width: 100% !important;
      position: absolute !important;
      bottom: 0 !important;
      top: auto !important;
    }

    .edit-tabs ::ng-deep .mdc-tab-indicator__content--underline {
      display: block !important;
      height: 2px !important;
      background-color: #ff9800 !important;
      border-bottom: 2px solid #ff9800 !important;
      width: 100% !important;
      position: absolute !important;
      bottom: 0 !important;
      top: auto !important;
    }

    /* Active tab position anchor for indicator */
    .edit-tabs ::ng-deep .mat-mdc-tab-label.mat-mdc-tab-label-active,
    .edit-tabs ::ng-deep .mat-mdc-tab-label[aria-selected="true"] {
      position: relative;
    }

    /* Tab body scroll */
    .edit-tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      overflow-x: hidden;
      overflow-y: auto;
      width: 100%;
      max-width: 100%;
      flex: 1;
      min-height: 0;
    }

    .edit-tabs ::ng-deep .mat-mdc-tab-body {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }

    /* ============ Section Content ============ */
    .edit-section {
      margin: 24px 32px 24px 24px;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      padding: 20px 16px;
    }

    .edit-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    /* ============ Table ============ */
    .edit-table {
      width: 100%;
      max-width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      background: #fafbfc;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      box-sizing: border-box;
    }

    .edit-table th,
    .edit-table td {
      border: 1px solid #e0e0e0;
      padding: 7px 8px;
      text-align: left;
      font-size: 13px;
    }

    .edit-table th {
      background: #f1ece5;
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #424242;
      white-space: nowrap;
    }

    /* Inputs inside table — mirrors field-input from landing page */
    .edit-table input {
      background: #fff;
      border: 1px solid #949392;
      color: #222;
      box-shadow: none;
      height: 24px;
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
      transition: border 0.2s, box-shadow 0.2s, background 0.2s;
    }

    .edit-table input:focus {
      border: 1.5px solid #ff9800;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
      outline: none;
    }

    /* ============ Action Button ============ */
    .action-button-container {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }

    /* Match project-selector dialog button colours */
    ::ng-deep button.mat-mdc-raised-button.mat-primary,
    ::ng-deep button[mat-raised-button][color="primary"] {
      background-color: #ff9800 !important;
      color: #ffffff !important;
    }
    ::ng-deep button.mat-mdc-raised-button.mat-primary:hover:not(:disabled),
    ::ng-deep button[mat-raised-button][color="primary"]:hover:not(:disabled) {
      background-color: #fb8500 !important;
    }
    ::ng-deep button.mat-mdc-button:not(.mat-primary):not(.mat-warn):not(.back-button) {
      color: #ff9800 !important;
    }
    ::ng-deep button.mat-mdc-button:not(.mat-primary):not(.mat-warn):not(.back-button):hover:not(:disabled) {
      background-color: rgba(25, 118, 210, 0.08) !important;
    }

    /* ====== DARK MODE ====== */
    :host-context([data-theme="dark"]) .edit-page-header {
      background-color: #1e1e1e !important;
      border-bottom-color: #424242 !important;
    }
    :host-context([data-theme="dark"]) .back-button {
      color: #90caf9 !important;
    }
    :host-context([data-theme="dark"]) .back-button mat-icon {
      color: #90caf9 !important;
    }
    :host-context([data-theme="dark"]) .back-button:hover {
      background-color: #1a2a4a !important;
      color: #ffffff !important;
    }
    :host-context([data-theme="dark"]) .project-number-right {
      color: #ff9800 !important;
    }
    :host-context([data-theme="dark"]) .header-divider {
      background-color: #2a5298 !important;
    }
    :host-context([data-theme="dark"]) .edit-tabs-wrapper {
      background: #121212 !important;
    }
    :host-context([data-theme="dark"]) .edit-tabs {
      background: #1e1e1e !important;
    }
    :host-context([data-theme="dark"]) .edit-tabs ::ng-deep .mat-mdc-tab-labels {
      background: #1e1e1e !important;
      border-bottom-color: #424242 !important;
    }
    :host-context([data-theme="dark"]) .edit-tabs ::ng-deep .mat-mdc-tab-label .mdc-tab__text-label {
      color: #9e9e9e !important;
    }
    :host-context([data-theme="dark"]) .edit-tabs ::ng-deep .mat-mdc-tab-label[aria-selected="true"],
    :host-context([data-theme="dark"]) .edit-tabs ::ng-deep .mdc-tab--active {
      background-color: #2a2520 !important;
    }
    :host-context([data-theme="dark"]) .edit-tabs ::ng-deep .mat-mdc-tab-label[aria-selected="true"] .mdc-tab__text-label,
    :host-context([data-theme="dark"]) .edit-tabs ::ng-deep .mdc-tab--active .mdc-tab__text-label {
      color: #ff9800 !important;
    }
    :host-context([data-theme="dark"]) .edit-section {
      background: #1e1e1e !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5) !important;
    }
    :host-context([data-theme="dark"]) .edit-table {
      background: #1e1e1e !important;
    }
    :host-context([data-theme="dark"]) .edit-table th {
      background: #2a1a08 !important;
      color: #ff9800 !important;
      border-color: #424242 !important;
    }
    :host-context([data-theme="dark"]) .edit-table td {
      color: #e0e0e0 !important;
      border-color: #424242 !important;
    }
    :host-context([data-theme="dark"]) .edit-table input {
      background: #2c2c2c !important;
      border-color: #616161 !important;
      color: #e0e0e0 !important;
    }
  `]
})
export class EditComponent implements OnInit {
  currentProjectNum: string = '';
  project: any = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get the project number from route params
    this.route.parent?.params.subscribe(params => {
      this.currentProjectNum = params['projectNum'] || '';
    });
    
    // Fallback: check current route params
    if (!this.currentProjectNum) {
      this.route.params.subscribe(params => {
        this.currentProjectNum = params['projectNum'] || '';
      });
    }

    // Capture project data from navigation state if available
    const navState = history.state as { projectNum?: string; project?: any };
    this.project = navState?.project || null;

    // Set active tab from query param (0 = Table of Contents, 1 = Drawing Information)
    this.route.queryParams.subscribe(params => {
      if (params['tab'] !== undefined) {
        this.selectedTabIndex = +params['tab'];
      }
    });
  }

  backToProject(): void {
    this.router.navigate(['/home'], { 
      state: { 
        projectNum: this.currentProjectNum,
        project: this.project
      }
    });
  }

  exitToLanding() {
    this.router.navigate(['/home'], { 
      state: { 
        projectNum: this.currentProjectNum,
        project: this.project
      }
    });
  }

  selectedTabIndex = 0;

  // Table of Contents
  tocSections = [
    { title: 'Introduction', order: 1 },
    { title: 'Scope', order: 2 }
  ];
  addTocSection() {
    this.tocSections.push({ title: '', order: this.tocSections.length + 1 });
  }
  removeTocSection(idx: number) {
    this.tocSections.splice(idx, 1);
  }

  // Drawing Information
  drawings = [
    { number: 'D-001', description: 'Main Schematic', file: '' }
  ];
  addDrawing() {
    this.drawings.push({ number: '', description: '', file: '' });
  }
  removeDrawing(idx: number) {
    this.drawings.splice(idx, 1);
  }

  // Cable Run List
  runList = [
    { cableId: 'C-001', start: 'Panel A', end: 'Panel B', type: 'Cat6', length: 10, notes: '' }
  ];
  addRun() {
    this.runList.push({ cableId: '', start: '', end: '', type: '', length: 0, notes: '' });
  }
  removeRun(idx: number) {
    this.runList.splice(idx, 1);
  }

  // Power Run List
  powerRunList = [
    { cableId: 'P-001', start: 'Panel X', end: 'Panel Y', type: 'Power', length: 20, notes: '' }
  ];
  addPowerRun() {
    this.powerRunList.push({ cableId: '', start: '', end: '', type: '', length: 0, notes: '' });
  }
  removePowerRun(idx: number) {
    this.powerRunList.splice(idx, 1);
  }
}