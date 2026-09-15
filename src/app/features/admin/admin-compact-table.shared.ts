import { ElementRef } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

export interface AdminCompactColumn {
  key: string;
  header: string;
  /** Optional cell formatter */
  format?: (row: Record<string, unknown>) => string;
}

export const ADMIN_COMPACT_TABLE_STYLES = `
  :host {
    display: block;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .admin-container {
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    gap: 12px;
    text-align: center;
  }

  .loading p { margin: 0; }

  .contact-tab-table {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding: 6px;
    margin: 0;
    overflow: hidden;
  }

  .table-scroll {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }

  .footer-table.admin-compact-table {
    width: 100%;
    max-width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    margin: 0;
    background: #fafbfc;
    font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    box-sizing: border-box;
  }

  .footer-table th,
  .footer-table td {
    border: 1px solid #949392;
    padding: 4px 8px;
    text-align: left;
    font-size: 12px;
    color: #222;
  }

  .footer-table th {
    background: #f1ece5;
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    color: #424242;
    white-space: nowrap;
  }

  .footer-table td {
    background: #fff;
    height: 24px;
    line-height: 16px;
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .footer-table tbody tr:hover td {
    background: #f5f5f5;
    transition: background 0.2s ease;
  }

  .footer-table .col-actions {
    width: 40px;
    min-width: 40px;
    max-width: 40px;
    text-align: center;
    padding: 2px 4px;
  }

  .footer-table th.col-actions {
    padding: 4px;
    border-left: none;
  }

  .action-btn {
    width: 32px !important;
    height: 32px !important;
    flex-shrink: 0;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    margin: 0 !important;
    padding: 0 !important;
    box-shadow: none !important;
  }

  .action-btn mat-icon {
    font-size: 20px !important;
    width: 20px !important;
    height: 20px !important;
    color: #ff9800 !important;
    opacity: 0.7;
  }

  .action-btn:hover mat-icon { opacity: 1 !important; }

  .color-dot {
    font-size: 16px;
    margin-right: 6px;
    vertical-align: middle;
  }

  .no-data {
    text-align: center;
    padding: 40px;
    color: #999;
  }

  .no-data mat-icon {
    font-size: 48px;
    width: 48px;
    height: 48px;
    opacity: 0.5;
  }

  :host-context([data-theme="dark"]) .action-btn mat-icon {
    color: #ffb74d !important;
  }

  :host-context([data-theme="dark"]) .footer-table {
    background: #1e1e1e !important;
  }

  :host-context([data-theme="dark"]) .footer-table th {
    background: #2a1a08 !important;
    color: #ff9800 !important;
    border-color: #424242 !important;
  }

  :host-context([data-theme="dark"]) .footer-table td {
    background: #1e1e1e !important;
    color: #e0e0e0 !important;
    border-color: #424242 !important;
  }

  :host-context([data-theme="dark"]) .footer-table tbody tr:hover td {
    background: #2a2520 !important;
  }
`;

export const ADMIN_COMPACT_MENU_STYLES = `
  ::ng-deep .mat-mdc-menu-content { padding: 8px 0 !important; }

  ::ng-deep .admin-container .mat-mdc-menu-item {
    font-size: 13px !important;
    font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif !important;
    color: #333333 !important;
  }

  ::ng-deep .admin-container .mat-mdc-menu-item:hover {
    background: rgba(255, 152, 0, 0.08) !important;
  }

  ::ng-deep .admin-container .mat-mdc-menu-item:hover mat-icon,
  ::ng-deep .admin-container .mat-mdc-menu-item:hover span {
    color: #ff7043 !important;
  }

  :host-context([data-theme="dark"]) ::ng-deep .admin-container .mat-mdc-menu-item {
    color: #fff9c4 !important;
  }

  :host-context([data-theme="dark"]) ::ng-deep .admin-container .mat-mdc-menu-item:hover {
    background: rgba(255, 152, 0, 0.25) !important;
  }
`;

export function getPaginatedSlice<T>(data: T[], pageIndex: number, pageSize: number): T[] {
  const start = pageIndex * pageSize;
  return data.slice(start, start + pageSize);
}

export function measureAdminDialogWidth(
  tableWrap: HTMLElement | undefined,
  columnCount: number
): number {
  /** Room for mat-paginator + Add + Export without overlap */
  const footerMin = 640;
  const maxViewport = Math.floor(window.innerWidth * 0.9);

  if (tableWrap) {
    const tableWidth = Math.ceil(tableWrap.scrollWidth);
    return Math.min(Math.max(tableWidth + 12, footerMin), maxViewport);
  }

  const estimated = 100 + columnCount * 110 + 48;
  return Math.min(Math.max(estimated, footerMin), maxViewport);
}

export function scheduleDialogWidthUpdate(
  tableWrap: ElementRef<HTMLElement> | undefined,
  columnCount: number,
  emitter: EventEmitter<number>
): void {
  setTimeout(() => {
    emitter.emit(measureAdminDialogWidth(tableWrap?.nativeElement, columnCount));
  }, 0);
}

export function emitAdminPagination(
  filteredData: unknown[],
  pageSize: number,
  pageIndex: number,
  paginationEmitter: EventEmitter<{ totalItems: number; pageSize: number; pageIndex: number }>,
  widthEmitter: EventEmitter<number> | undefined,
  getTableWrap: (() => ElementRef<HTMLElement> | undefined) | undefined,
  columnCount: number,
  /** Only true after data load — avoids popup resizing when page changes */
  resizeDialog = false
): void {
  paginationEmitter.emit({
    totalItems: filteredData.length,
    pageSize,
    pageIndex
  });
  if (resizeDialog && widthEmitter && getTableWrap) {
    setTimeout(() => {
      scheduleDialogWidthUpdate(getTableWrap(), columnCount, widthEmitter);
    }, 0);
  }
}

export function exportCsv(data: unknown[], filename: string): void {
  if (!data.length) {
    return;
  }
  const rows = data as Record<string, unknown>[];
  const csv = [
    Object.keys(rows[0]).join(','),
    ...rows.map(item => Object.values(item).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

export function cellValue(row: Record<string, unknown>, col: AdminCompactColumn): string {
  if (col.format) {
    return col.format(row);
  }
  const val = row[col.key];
  if (val === null || val === undefined || val === '') {
    return '-';
  }
  return String(val);
}

/** Routes using modal footer + compact contacts-style table */
export const ADMIN_MODAL_LIST_ROUTES = new Set([
  'unit-of-measure',
  'material-category',
  'vendor',
  'companies',
  'earthquake-zone',
  'cable-color',
  'work-item-operation',
  'runlist-category',
  'runlist-association',
  'cable-type'
]);

/** Routes opened as compact modal lists (footer + contacts-style table). */
export const ADMIN_COMPACT_MODAL_ROUTES = ADMIN_MODAL_LIST_ROUTES;

export const ADMIN_ROUTE_COLUMN_COUNT: Record<string, number> = {
  'unit-of-measure': 1,
  'material-category': 2,
  'vendor': 2,
  'companies': 2,
  'earthquake-zone': 2,
  'cable-color': 3,
  'work-item-operation': 2,
  'runlist-category': 3,
  'runlist-association': 3, // category + from part + to part (display columns)
  'cable-type': 4
};

export const ADMIN_ROUTE_ADD_LABEL: Record<string, string> = {
  'unit-of-measure': 'Add',
  'material-category': 'Add',
  'vendor': 'Add',
  'companies': 'Add',
  'earthquake-zone': 'Add',
  'cable-color': 'Add',
  'work-item-operation': 'Add',
  'runlist-category': 'Add',
  'runlist-association': 'Add',
  'cable-type': 'Add'
};

export function applyPageChange(event: PageEvent, ctx: {
  pageIndex: number;
  pageSize: number;
  setPage: (index: number, size: number) => void;
  filteredData: unknown[];
  paginationEmitter: EventEmitter<{ totalItems: number; pageSize: number; pageIndex: number }>;
  widthEmitter?: EventEmitter<number>;
  getTableWrap?: () => ElementRef<HTMLElement> | undefined;
  columnCount: number;
}): void {
  ctx.setPage(event.pageIndex, event.pageSize);
  emitAdminPagination(
    ctx.filteredData,
    ctx.pageSize,
    ctx.pageIndex,
    ctx.paginationEmitter,
    ctx.widthEmitter,
    ctx.getTableWrap,
    ctx.columnCount,
    false
  );
}
