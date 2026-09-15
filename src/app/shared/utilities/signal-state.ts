import { signal, Signal, WritableSignal } from '@angular/core';

/**
 * Signals State Management Utilities
 * Provides reusable patterns for loading, error, and result states
 */

/**
 * Generic loading state signal factory
 * Usage: const loading = createLoadingSignal();
 */
export function createLoadingSignal(): WritableSignal<boolean> {
  return signal(false);
}

/**
 * Generic error state signal factory
 * Usage: const error = createErrorSignal();
 */
export function createErrorSignal(): WritableSignal<string> {
  return signal('');
}

/**
 * Generic result state signal factory
 * Usage: const result = createResultSignal<User>();
 */
export function createResultSignal<T>(initialValue: T | null = null): WritableSignal<T | null> {
  return signal(initialValue);
}

/**
 * Combined state object for data fetching operations
 * Usage: const state = createDataState<User>();
 */
export interface DataState<T> {
  loading: WritableSignal<boolean>;
  error: WritableSignal<string>;
  result: WritableSignal<T | null>;
}

export function createDataState<T>(initialValue?: T): DataState<T> {
  return {
    loading: signal(false),
    error: signal(''),
    result: signal(initialValue ?? null),
  };
}

/**
 * List state for paginated/searchable data
 * Usage: const listState = createListState<Project>();
 */
export interface ListState<T> {
  loading: WritableSignal<boolean>;
  error: WritableSignal<string>;
  items: WritableSignal<T[]>;
  filteredItems: WritableSignal<T[]>;
  selectedItem: WritableSignal<T | null>;
  searchText: WritableSignal<string>;
}

export function createListState<T>(): ListState<T> {
  return {
    loading: signal(false),
    error: signal(''),
    items: signal<T[]>([]),
    filteredItems: signal<T[]>([]),
    selectedItem: signal<T | null>(null),
    searchText: signal(''),
  };
}

/**
 * Form state for reactive forms
 * Usage: const formState = createFormState();
 */
export interface FormState {
  loading: WritableSignal<boolean>;
  error: WritableSignal<string>;
  success: WritableSignal<boolean>;
  touched: WritableSignal<boolean>;
}

export function createFormState(): FormState {
  return {
    loading: signal(false),
    error: signal(''),
    success: signal(false),
    touched: signal(false),
  };
}

/**
 * Modal/Dialog state
 * Usage: const dialogState = createDialogState();
 */
export interface DialogState<T = any> {
  isOpen: WritableSignal<boolean>;
  data: WritableSignal<T | null>;
  result: WritableSignal<T | null>;
  error: WritableSignal<string>;
}

export function createDialogState<T = any>(): DialogState<T> {
  return {
    isOpen: signal(false),
    data: signal<T | null>(null),
    result: signal<T | null>(null),
    error: signal(''),
  };
}

/**
 * Pagination state
 * Usage: const paginationState = createPaginationState();
 */
export interface PaginationState {
  currentPage: WritableSignal<number>;
  pageSize: WritableSignal<number>;
  totalItems: WritableSignal<number>;
  totalPages: WritableSignal<number>;
}

export function createPaginationState(
  initialPageSize = 10,
  initialPage = 1
): PaginationState {
  return {
    currentPage: signal(initialPage),
    pageSize: signal(initialPageSize),
    totalItems: signal(0),
    totalPages: signal(0),
  };
}

/**
 * Tab state for multi-tab layouts
 * Usage: const tabState = createTabState();
 */
export interface TabState {
  activeTabIndex: WritableSignal<number>;
  tabData: WritableSignal<Record<number, any>>;
}

export function createTabState(initialIndex = 0): TabState {
  return {
    activeTabIndex: signal(initialIndex),
    tabData: signal<Record<number, any>>({}),
  };
}
