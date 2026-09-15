/**
 * API Endpoints Configuration
 * Centralized endpoint definitions for all services
 * Enables easy maintenance and prevents string duplication
 */

export const API_ENDPOINTS = {
  // Project endpoints
  projects: {
    base: '/projects',
    list: '/projects',
    detail: (projectNum: string) => `/projects/${projectNum}`,
    workItems: (projectNum: string) => `/projects/${projectNum}/work-items`,
    runList: (projectNum: string) => `/projects/${projectNum}/run-list`,
    reports: (projectNum: string) => `/projects/${projectNum}/reports`,
    bom: (projectNum: string) => `/projects/${projectNum}/bom`,
    bomExport: (projectNum: string) => `/projects/${projectNum}/bom/export-html`,
  },

  // Admin endpoints
  admin: {
    base: '/admin',
    parts: '/admin/parts',
    partsList: '/admin/parts/list',
    partsSearch: '/admin/parts/search',
    companies: '/admin/companies',
    companiesList: '/admin/companies/list',
    companiesSearch: '/admin/companies/search',
    users: '/admin/users',
    usersList: '/admin/users/list',
    usersSearch: '/admin/users/search',
    cables: '/admin/cables',
    cableTypes: '/admin/cable-types',
    zones: '/admin/earthquake-zones',
    materials: '/admin/materials',
  },

  // Authentication endpoints
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    profile: '/auth/profile',
  },

  // Lookup endpoints
  lookup: {
    items: '/lookup/items',
    addresses: '/lookup/addresses',
    partGroups: '/lookup/part-groups',
  },
};

/**
 * Dialog sizing presets
 */
export const DIALOG_SIZES = {
  SMALL: '400px',
  MEDIUM: '600px',
  LARGE: '900px',
  EXTRA_LARGE: '1200px',
};

/**
 * Common form validators
 */
export const FORM_VALIDATORS = {
  minLength: (min: number) => `Minimum ${min} characters required`,
  maxLength: (max: number) => `Maximum ${max} characters allowed`,
  required: 'This field is required',
  invalidEmail: 'Invalid email address',
  invalidDate: 'Invalid date format',
  invalidNumber: 'Invalid number',
};

/**
 * HTTP timeout settings
 */
export const HTTP_TIMEOUTS = {
  SHORT: 5000,      // 5 seconds
  MEDIUM: 15000,    // 15 seconds
  LONG: 30000,      // 30 seconds
};

/**
 * Pagination defaults
 */
export const PAGINATION = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

/**
 * Table and grid defaults
 */
export const TABLE_CONFIG = {
  ROWS_PER_PAGE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
  SORT_DIRECTION: 'asc' as const,
};
