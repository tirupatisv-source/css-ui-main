/**
 * Validation utility functions for common validation patterns.
 * Consolidates duplicate validation logic across services and components.
 */
export class ValidationUtils {
  /**
   * Check if value is null or undefined
   * @param value - Value to check
   * @returns true if null or undefined
   */
  static isNull(value: any): boolean {
    return value === null || value === undefined;
  }

  /**
   * Check if value is null, undefined, or empty string/array/object
   * @param value - Value to check
   * @returns true if empty or falsy
   */
  static isEmpty(value: any): boolean {
    if (this.isNull(value)) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return !value;
  }

  /**
   * Check if value has content (inverse of isEmpty)
   * @param value - Value to check
   * @returns true if value has content
   */
  static hasContent(value: any): boolean {
    return !this.isEmpty(value);
  }

  /**
   * Validate string is not null/empty
   * @param value - String to validate
   * @param fieldName - Field name for error message
   * @throws Error if validation fails
   */
  static requireString(value: string | null | undefined, fieldName: string = 'Field'): void {
    if (!value || value.trim().length === 0) {
      throw new Error(`${fieldName} is required`);
    }
  }

  /**
   * Validate string length is within bounds
   * @param value - String to validate
   * @param minLength - Minimum length (default: 0)
   * @param maxLength - Maximum length
   * @param fieldName - Field name for error message
   * @throws Error if validation fails
   */
  static validateStringLength(value: string | null | undefined, minLength: number = 0, maxLength: number = Infinity, fieldName: string = 'Field'): void {
    const str = (value ?? '').trim();
    if (str.length < minLength) {
      throw new Error(`${fieldName} must be at least ${minLength} characters`);
    }
    if (str.length > maxLength) {
      throw new Error(`${fieldName} must not exceed ${maxLength} characters`);
    }
  }

  /**
   * Validate number is within range
   * @param value - Number to validate
   * @param min - Minimum value
   * @param max - Maximum value
   * @param fieldName - Field name for error message
   * @throws Error if validation fails
   */
  static validateNumberRange(value: number | null | undefined, min: number, max: number, fieldName: string = 'Field'): void {
    const num = value ?? 0;
    if (num < min) {
      throw new Error(`${fieldName} must be at least ${min}`);
    }
    if (num > max) {
      throw new Error(`${fieldName} must not exceed ${max}`);
    }
  }

  /**
   * Validate email format
   * @param email - Email to validate
   * @returns true if email format is valid
   */
  static isValidEmail(email: string | null | undefined): boolean {
    if (!email || email.trim().length === 0) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (basic)
   * @param phone - Phone number to validate
   * @returns true if phone format is valid (at least 10 digits)
   */
  static isValidPhone(phone: string | null | undefined): boolean {
    if (!phone || phone.trim().length === 0) return false;
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  }

  /**
   * Validate URL format
   * @param url - URL to validate
   * @returns true if URL format is valid
   */
  static isValidUrl(url: string | null | undefined): boolean {
    if (!url || url.trim().length === 0) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate number format
   * @param value - Value to check
   * @returns true if value is a valid number
   */
  static isValidNumber(value: any): boolean {
    return !this.isNull(value) && !isNaN(parseFloat(value)) && isFinite(value);
  }

  /**
   * Validate array contains at least one element
   * @param array - Array to validate
   * @param fieldName - Field name for error message
   * @throws Error if validation fails
   */
  static requireArray(array: any[] | null | undefined, fieldName: string = 'Array'): void {
    if (!array || array.length === 0) {
      throw new Error(`${fieldName} must contain at least one element`);
    }
  }

  /**
   * Validate object has required properties
   * @param obj - Object to validate
   * @param requiredProps - List of required property names
   * @param fieldName - Field name for error message
   * @throws Error if validation fails
   */
  static requireProperties(obj: any, requiredProps: string[], fieldName: string = 'Object'): void {
    if (this.isNull(obj)) {
      throw new Error(`${fieldName} is required`);
    }
    const missingProps = requiredProps.filter(prop => this.isNull(obj[prop]));
    if (missingProps.length > 0) {
      throw new Error(`${fieldName} is missing required properties: ${missingProps.join(', ')}`);
    }
  }

  /**
   * Validate string matches pattern
   * @param value - String to validate
   * @param pattern - Regex pattern to match
   * @param fieldName - Field name for error message
   * @throws Error if validation fails
   */
  static validatePattern(value: string | null | undefined, pattern: RegExp, fieldName: string = 'Field'): void {
    const str = (value ?? '').trim();
    if (str.length === 0) return; // Allow empty for optional fields
    if (!pattern.test(str)) {
      throw new Error(`${fieldName} format is invalid`);
    }
  }

  /**
   * Validate string is alphanumeric only
   * @param value - String to validate
   * @param fieldName - Field name for error message
   * @throws Error if validation fails
   */
  static validateAlphanumeric(value: string | null | undefined, fieldName: string = 'Field'): void {
    const str = (value ?? '').trim();
    if (str.length === 0) return;
    if (!/^[a-zA-Z0-9]+$/.test(str)) {
      throw new Error(`${fieldName} must contain only alphanumeric characters`);
    }
  }

  /**
   * Check if string contains only digits
   * @param value - String to check
   * @returns true if string contains only digits
   */
  static isNumeric(value: string | null | undefined): boolean {
    if (!value || value.trim().length === 0) return false;
    return /^\d+$/.test(value);
  }

  /**
   * Check if value is a valid boolean
   * @param value - Value to check
   * @returns true if value is boolean or can be parsed as boolean
   */
  static isValidBoolean(value: any): boolean {
    return typeof value === 'boolean' || value === 'true' || value === 'false' || value === 1 || value === 0;
  }

  /**
   * Validate date is after minimum date
   * @param value - Date to validate
   * @param minDate - Minimum date
   * @param fieldName - Field name for error message
   * @throws Error if validation fails
   */
  static validateMinDate(value: Date | null | undefined, minDate: Date, fieldName: string = 'Date'): void {
    if (this.isNull(value)) return;
    if (value! < minDate) {
      throw new Error(`${fieldName} must be after ${minDate.toDateString()}`);
    }
  }

  /**
   * Validate date is before maximum date
   * @param value - Date to validate
   * @param maxDate - Maximum date
   * @param fieldName - Field name for error message
   * @throws Error if validation fails
   */
  static validateMaxDate(value: Date | null | undefined, maxDate: Date, fieldName: string = 'Date'): void {
    if (this.isNull(value)) return;
    if (value! > maxDate) {
      throw new Error(`${fieldName} must be before ${maxDate.toDateString()}`);
    }
  }

  /**
   * Validate date is within range
   * @param value - Date to validate
   * @param minDate - Minimum date
   * @param maxDate - Maximum date
   * @param fieldName - Field name for error message
   * @throws Error if validation fails
   */
  static validateDateRange(value: Date | null | undefined, minDate: Date, maxDate: Date, fieldName: string = 'Date'): void {
    if (this.isNull(value)) return;
    this.validateMinDate(value, minDate, fieldName);
    this.validateMaxDate(value, maxDate, fieldName);
  }
}
