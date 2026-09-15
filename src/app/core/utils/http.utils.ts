import { HttpParams, HttpErrorResponse } from '@angular/common/http';

/**
 * HTTP utility functions for common HTTP operations.
 * Consolidates duplicate HTTP param building and error handling across services.
 */
export class HttpUtils {
  /**
   * Build HttpParams from object, skipping null/undefined/empty values
   * @param params - Object with parameter key-value pairs
   * @returns HttpParams instance
   */
  static buildParams(params: { [key: string]: any }): HttpParams {
    let httpParams = new HttpParams();
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        const value = params[key];
        // Skip null, undefined, empty strings, and empty arrays
        if (value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
          if (Array.isArray(value)) {
            // For arrays, add multiple params with same key
            value.forEach(v => {
              httpParams = httpParams.append(key, String(v));
            });
          } else {
            httpParams = httpParams.set(key, String(value));
          }
        }
      }
    }
    return httpParams;
  }

  /**
   * Add parameter to HttpParams if value is not null/undefined/empty
   * @param params - Existing HttpParams
   * @param key - Parameter key
   * @param value - Parameter value
   * @returns Updated HttpParams
   */
  static addParam(params: HttpParams, key: string, value: any): HttpParams {
    if (value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
      if (Array.isArray(value)) {
        value.forEach(v => {
          params = params.append(key, String(v));
        });
      } else {
        params = params.set(key, String(value));
      }
    }
    return params;
  }

  /**
   * Add multiple parameters to HttpParams
   * @param params - Existing HttpParams
   * @param newParams - Object with parameters to add
   * @returns Updated HttpParams
   */
  static addParams(params: HttpParams, newParams: { [key: string]: any }): HttpParams {
    for (const key in newParams) {
      if (newParams.hasOwnProperty(key)) {
        params = this.addParam(params, key, newParams[key]);
      }
    }
    return params;
  }

  /**
   * Extract error message from HttpErrorResponse
   * @param error - HttpErrorResponse
   * @param defaultMessage - Default message if error message cannot be extracted
   * @returns Error message string
   */
  static getErrorMessage(error: any, defaultMessage: string = 'An error occurred'): string {
    if (!error) return defaultMessage;

    // Check if error is HttpErrorResponse with status
    if (error instanceof HttpErrorResponse) {
      // Try to get message from error body
      if (error.error) {
        if (typeof error.error === 'string') {
          return error.error;
        }
        if (error.error.message) {
          return error.error.message;
        }
        if (error.error.error) {
          return error.error.error;
        }
      }

      // Fall back to HTTP status text
      if (error.statusText) {
        return error.statusText;
      }

      // Try to get message from status
      if (error.status) {
        return `HTTP Error ${error.status}`;
      }
    }

    // Check if error has message property
    if (typeof error === 'object' && error.message) {
      return error.message;
    }

    // Check if error is a string
    if (typeof error === 'string') {
      return error;
    }

    return defaultMessage;
  }

  /**
   * Check if error is network error
   * @param error - Error to check
   * @returns true if error is network error
   */
  static isNetworkError(error: any): boolean {
    if (error instanceof HttpErrorResponse) {
      // Network errors typically have status 0
      return error.status === 0;
    }
    return false;
  }

  /**
   * Check if error is authentication error (401 Unauthorized)
   * @param error - Error to check
   * @returns true if error is 401
   */
  static isUnauthorizedError(error: any): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 401;
    }
    return false;
  }

  /**
   * Check if error is forbidden error (403 Forbidden)
   * @param error - Error to check
   * @returns true if error is 403
   */
  static isForbiddenError(error: any): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 403;
    }
    return false;
  }

  /**
   * Check if error is not found error (404)
   * @param error - Error to check
   * @returns true if error is 404
   */
  static isNotFoundError(error: any): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status === 404;
    }
    return false;
  }

  /**
   * Check if error is server error (5xx)
   * @param error - Error to check
   * @returns true if error is 5xx
   */
  static isServerError(error: any): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status >= 500;
    }
    return false;
  }

  /**
   * Check if error is client error (4xx)
   * @param error - Error to check
   * @returns true if error is 4xx
   */
  static isClientError(error: any): boolean {
    if (error instanceof HttpErrorResponse) {
      return error.status >= 400 && error.status < 500;
    }
    return false;
  }

  /**
   * Get HTTP status description
   * @param status - HTTP status code
   * @returns Status description
   */
  static getStatusDescription(status: number): string {
    const statusMap: { [key: number]: string } = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout'
    };
    return statusMap[status] || `Unknown (${status})`;
  }

  /**
   * Parse JSON error response
   * @param response - Error response
   * @returns Parsed error object
   */
  static parseErrorResponse(response: any): { message: string; details?: string; code?: string } {
    if (typeof response === 'string') {
      return { message: response };
    }

    if (typeof response === 'object') {
      return {
        message: response.message || response.error || 'Unknown error',
        details: response.details || response.description,
        code: response.code || response.errorCode
      };
    }

    return { message: 'Unknown error occurred' };
  }

  /**
   * Build authorization header
   * @param token - Bearer token
   * @returns Authorization header value
   */
  static buildAuthHeader(token: string): string {
    return `Bearer ${token}`;
  }

  /**
   * Build query string from object
   * @param params - Parameter object
   * @returns Query string (without leading ?)
   */
  static buildQueryString(params: { [key: string]: any }): string {
    const queryParams: string[] = [];
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== undefined) {
        queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(params[key]))}`);
      }
    }
    return queryParams.join('&');
  }

  /**
   * Build URL with query parameters
   * @param baseUrl - Base URL
   * @param params - Parameter object
   * @returns Complete URL with query string
   */
  static buildUrl(baseUrl: string, params: { [key: string]: any }): string {
    const queryString = this.buildQueryString(params);
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Format file size for display
   * @param bytes - Size in bytes
   * @returns Formatted size string (e.g., "1.5 MB")
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
