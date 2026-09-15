import { Component, Inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { MatTooltipModule } from '@angular/material/tooltip';

import {

  ADMIN_MODAL_LIST_ROUTES,

  ADMIN_ROUTE_ADD_LABEL,

  ADMIN_ROUTE_COLUMN_COUNT

} from './admin-compact-table.shared';



@Component({

  selector: 'app-admin-modal-wrapper',

  standalone: true,

  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatPaginatorModule, MatTooltipModule],

  template: `
    @if (!isFullscreenLayout) {
      <div class="modal-header">

      <h2 class="modal-title">{{ data.title }}</h2>

      <button mat-icon-button (click)="close()" class="close-button">

        <mat-icon>close</mat-icon>

      </button>

      </div>
    }

    <mat-dialog-content class="modal-content" [class.modal-content--compact]="isCompactModal" [class.modal-content--fullscreen]="isFullscreenLayout">

      <div #componentHost class="component-host"></div>

    </mat-dialog-content>

    <div class="modal-footer" *ngIf="showPagination">
      <div class="footer-pagination">
        <mat-paginator
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageIndex]="pageIndex"
          [pageSizeOptions]="[5, 10, 25]"
          (page)="onPageChange($event)"
          aria-label="Select page">
        </mat-paginator>
      </div>
      <div class="footer-actions" *ngIf="hasListFooter">
        <button mat-raised-button color="primary" (click)="onAddNew()" [matTooltip]="addTooltip" class="add-btn">
          <mat-icon>add</mat-icon>
          <span>{{ addLabel }}</span>
        </button>
        <button mat-icon-button type="button" (click)="onExport()" matTooltip="Export" class="export-btn">
          <mat-icon>download</mat-icon>
        </button>
      </div>
    </div>

  `,

  styles: [`

    :host {

      display: flex;

      flex-direction: column;

      height: 100%;

    }



    .modal-header {

      display: flex;

      justify-content: space-between;

      align-items: center;

      padding: 16px 24px;

      border-bottom: 1px solid #e0e0e0;

      background: #fff;

      flex-shrink: 0;

    }

    .modal-title {

      font-size: 18px;

      font-weight: 500;

      color: #8a4d00;

      margin: 0;

    }

    .close-button {

      color: #666;

    }

    .close-button:hover {

      color: #ff9800;

      background-color: #f5f5f5;

    }

    .modal-content {

      padding: 0 !important;

      flex: 1;

      overflow-y: auto;

      overflow-x: hidden;

    }



    .modal-content--compact {

      overflow-x: hidden;

    }

    .modal-content--fullscreen {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      max-height: none !important;
      overflow: hidden;
    }



    ::ng-deep mat-dialog-content.modal-content {

      padding: 0 !important;

      overflow-x: hidden !important;

    }



    .component-host {

      display: flex;

      flex: 1 1 auto;

      min-height: 0;

      width: 100%;

    }

    .modal-footer {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      column-gap: 16px;
      row-gap: 8px;
      padding: 8px 16px;
      border-top: 1px solid #e0e0e0;
      background: #fff;
      flex-shrink: 0;
      min-height: 56px;
    }

    .footer-pagination {
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow-x: auto;
    }

    .footer-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-shrink: 0;
      white-space: nowrap;
      justify-self: end;
    }

    :host ::ng-deep .footer-pagination .mat-mdc-paginator {
      background: transparent;
    }

    :host ::ng-deep .footer-pagination .mat-mdc-paginator-container {
      padding: 0 4px;
      min-height: 48px;
      flex-wrap: nowrap;
    }

    @media (max-width: 600px) {
      .modal-footer {
        grid-template-columns: 1fr;
      }

      .footer-pagination {
        justify-content: flex-start;
      }
    }



    .add-btn,

    .export-btn {

      display: inline-flex;

      align-items: center;

      justify-content: center;

    }



    .add-btn mat-icon {

      margin: 0;

      vertical-align: middle;

    }



    .add-btn {

      background: #ff9800 !important;

      color: white !important;

    }



    .export-btn {

      color: #ff9800 !important;

    }

    

    :host-context([data-theme="dark"]) .modal-header { background: #1e1e1e !important; border-bottom-color: #424242 !important; }

    :host-context([data-theme="dark"]) .modal-title { color:#8a4d00 !important; }

    :host-context([data-theme="dark"]) .close-button { color: #90caf9 !important; }

    :host-context([data-theme="dark"]) .close-button:hover { color: #ff9800 !important; background-color: #262626 !important; }

    :host-context([data-theme="dark"]) .modal-content { background: #121212 !important; }

    :host-context([data-theme="dark"]) .modal-footer { background: #1e1e1e !important; border-top-color: #424242 !important; }

    :host-context([data-theme="dark"]) .add-btn { background: #ff9800 !important; color: white !important; }

    :host-context([data-theme="dark"]) .export-btn { color: #ff9800 !important; }

  `]

})

export class AdminModalWrapperComponent implements OnInit {

  @ViewChild('componentHost', { read: ViewContainerRef }) componentHost!: ViewContainerRef;



  totalItems = 0;

  pageSize = 10;

  pageIndex = 0;

  showPagination = false;

  loadedComponent: any = null;

  isCompactModal = false;
  isFullscreenLayout = false;

  hasListFooter = false;

  addLabel = 'Add';

  addTooltip = 'Add';



  private static readonly WIDE_TABLE_MIN_COLUMNS = 4;



  constructor(

    @Inject(MAT_DIALOG_DATA) public data: { route: string; title: string },

    public dialogRef: MatDialogRef<AdminModalWrapperComponent>

  ) {}



  async ngOnInit(): Promise<void> {

    this.isFullscreenLayout = this.isFullscreenRoute(this.data.route);

    this.isCompactModal = ADMIN_MODAL_LIST_ROUTES.has(this.data.route);

    this.hasListFooter = this.isCompactModal;

    this.addLabel = ADMIN_ROUTE_ADD_LABEL[this.data.route] ?? 'Add';

    this.addTooltip = `Add ${this.data.title}`;

    await this.loadComponent();

  }

  private isFullscreenRoute(route: string): boolean {
    return route === 'parts' || route === 'part-association' || route === 'part-association-table';
  }



  private async loadComponent(): Promise<void> {

    const componentMap: Record<string, () => Promise<any>> = {

      'vendor': () => import('./vendor.component').then(m => m.VendorComponent),

      'material-category': () => import('./material-category.component').then(m => m.MaterialCategoryComponent),

      'runlist-category': () => import('./runlist-category.component').then(m => m.RunlistCategoryComponent),

      'user-access': () => import('./user-access.component').then(m => m.UserAccessComponent),

      'parts': () => import('./parts-list.component').then(m => m.PartsListComponent),

      'runlist-association': () => import('./runlist-association.component').then(m => m.RunlistAssociationComponent),

      'part-association': () => import('./part-association.component').then(m => m.PartAssociationComponent),

      'cable-type': () => import('./cable-type.component').then(m => m.CableTypeComponent),

      'unit-of-measure': () => import('./unit-of-measure.component').then(m => m.UnitOfMeasureComponent),

      'part-association-table': () => import('./part-association-table.component').then(m => m.PartAssociationTableComponent),

      'cable-color': () => import('./cable-color.component').then(m => m.CableColorComponent),

      'earthquake-zone': () => import('./earthquake-zone.component').then(m => m.EarthquakeZoneComponent),

      'work-item-operation': () => import('./work-item-operation.component').then(m => m.WorkItemOperationComponent),

      'companies': () => import('./companies.component').then(m => m.CompaniesComponent),

      'users': () => import('./users.component').then(m => m.UsersComponent),

    };



    try {

      const componentLoader = componentMap[this.data.route];

      if (componentLoader) {

        const component = await componentLoader();

        const componentRef = this.componentHost.createComponent(component);

        this.loadedComponent = componentRef.instance;



        if (ADMIN_MODAL_LIST_ROUTES.has(this.data.route)) {

          this.wireListComponent(componentRef.instance);

        }

      } else {

        console.warn(`Component not found for route: ${this.data.route}`);

      }

    } catch (error) {

      console.error(`Failed to load component for route: ${this.data.route}`, error);

    }

  }



  private wireListComponent(instance: any): void {

    if (instance.paginationChange) {

      instance.paginationChange.subscribe((paginationData: any) => {

        this.totalItems = paginationData.totalItems;

        this.pageSize = paginationData.pageSize;

        this.pageIndex = paginationData.pageIndex ?? 0;

        this.showPagination = this.totalItems > 0;

      });

    }

    if (instance.dialogWidthChange) {

      instance.dialogWidthChange.subscribe((width: number) => {

        this.updateDialogWidth(width);

      });

    }

  }



  onPageChange(event: PageEvent): void {

    if (this.loadedComponent?.onPageChange) {

      this.loadedComponent.onPageChange(event);

    }

  }



  onAddNew(): void {

    if (this.loadedComponent?.addNew) {

      this.loadedComponent.addNew();

    }

  }



  onExport(): void {

    if (this.loadedComponent?.exportData) {

      this.loadedComponent.exportData();

    }

  }



  close(): void {

    this.dialogRef.close();

  }



  private updateDialogWidth(contentWidthPx: number): void {

    const maxViewport = Math.floor(window.innerWidth * 0.9);

    const width = Math.min(Math.max(Math.round(contentWidthPx), 320), maxViewport);

    this.dialogRef.updateSize(`${width}px`);

  }



  static resolveDialogWidth(route: string): string {

    if (!ADMIN_MODAL_LIST_ROUTES.has(route)) {

      const cols = ADMIN_ROUTE_COLUMN_COUNT[route] ?? 0;

      if (cols >= AdminModalWrapperComponent.WIDE_TABLE_MIN_COLUMNS) {

        return '90vw';

      }

      return 'min(720px, 90vw)';

    }



    const dataCols = ADMIN_ROUTE_COLUMN_COUNT[route] ?? 1;

    const totalCols = dataCols + 1;

    if (totalCols >= AdminModalWrapperComponent.WIDE_TABLE_MIN_COLUMNS) {

      return 'min(720px, 90vw)';

    }

    if (route === 'runlist-association') {

      return 'min(800px, 90vw)';

    }

    if (totalCols >= 3) {

      return 'min(640px, 90vw)';

    }

    return 'min(680px, 90vw)';

  }



  static resolvePanelClass(route: string): string {

    if (ADMIN_MODAL_LIST_ROUTES.has(route)) {

      const dataCols = ADMIN_ROUTE_COLUMN_COUNT[route] ?? 1;

      if (dataCols + 1 >= AdminModalWrapperComponent.WIDE_TABLE_MIN_COLUMNS) {

        return 'admin-modal-wide';

      }

      return 'admin-modal-compact';

    }

    return 'admin-modal-wide';

  }

}


