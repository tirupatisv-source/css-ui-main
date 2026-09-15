/**
 * String utility functions for common string operations.
 * Consolidates duplicate string handling across services and components.
 */
export class StringUtils {
  /**
   * Safely trim a string and return empty string if null/undefined
   * @param value - String to trim
   * @returns Trimmed string or empty string
   */
  static trim(value: string | null | undefined): string {
    return (value ?? '').trim();
  }

  /**
   * Trim and convert to lowercase
   * @param value - String to process
   * @returns Trimmed and lowercased string
   */
  static trimAndLowerCase(value: string | null | undefined): string {
    return this.trim(value).toLowerCase();
  }

  /**
   * Trim and convert to uppercase
   * @param value - String to process
   * @returns Trimmed and uppercased string
   */
  static trimAndUpperCase(value: string | null | undefined): string {
    return this.trim(value).toUpperCase();
  }

  /**
   * Convert to lowercase
   * @param value - String to convert
   * @returns Lowercased string or empty string
   */
  static toLowerCase(value: string | null | undefined): string {
    return (value ?? '').toLowerCase();
  }

  /**
   * Convert to uppercase
   * @param value - String to convert
   * @returns Uppercased string or empty string
   */
  static toUpperCase(value: string | null | undefined): string {
    return (value ?? '').toUpperCase();
  }

  /**
   * Check if string is null, undefined, or empty (after trim)
   * @param value - String to check
   * @returns true if null/empty/whitespace-only
   */
  static isNullOrEmpty(value: string | null | undefined): boolean {
    return !value || value.trim().length === 0;
  }

  /**
   * Check if string has content (inverse of isNullOrEmpty)
   * @param value - String to check
   * @returns true if string has non-whitespace content
   */
  static hasContent(value: string | null | undefined): boolean {
    return !this.isNullOrEmpty(value);
  }

  /**
   * Check if string is null or undefined (not including empty string)
   * @param value - String to check
   * @returns true if null or undefined
   */
  static isNull(value: string | null | undefined): boolean {
    return value === null || value === undefined;
  }

  /**
   * Check if string is empty (not including null/undefined)
   * @param value - String to check
   * @returns true if empty string after trim
   */
  static isEmpty(value: string): boolean {
    return value.trim().length === 0;
  }

  /**
   * Get first N characters of string, with optional ellipsis
   * @param value - String to truncate
   * @param length - Maximum length
   * @param ellipsis - Add '...' if truncated (default: false)
   * @returns Truncated string
   */
  static truncate(value: string | null | undefined, length: number, ellipsis: boolean = false): string {
    const str = this.trim(value);
    if (str.length <= length) {
      return str;
    }
    return ellipsis ? str.substring(0, length - 3) + '...' : str.substring(0, length);
  }

  /**
   * Repeat a string N times
   * @param value - String to repeat
   * @param count - Number of repetitions
   * @returns Repeated string
   */
  static repeat(value: string, count: number): string {
    if (count <= 0) return '';
    return value.repeat(count);
  }

  /**
   * Pad string on the left
   * @param value - String to pad
   * @param length - Target length
   * @param padChar - Character to pad with (default: space)
   * @returns Left-padded string
   */
  static padLeft(value: string | null | undefined, length: number, padChar: string = ' '): string {
    const str = this.trim(value);
    if (str.length >= length) return str;
    return padChar.repeat(length - str.length) + str;
  }

  /**
   * Pad string on the right
   * @param value - String to pad
   * @param length - Target length
   * @param padChar - Character to pad with (default: space)
   * @returns Right-padded string
   */
  static padRight(value: string | null | undefined, length: number, padChar: string = ' '): string {
    const str = this.trim(value);
    if (str.length >= length) return str;
    return str + padChar.repeat(length - str.length);
  }

  /**
   * Compare strings ignoring case and whitespace
   * @param str1 - First string
   * @param str2 - Second string
   * @returns true if strings are equal (ignoring case and whitespace)
   */
  static equalsIgnoreCaseAndWhitespace(str1: string | null | undefined, str2: string | null | undefined): boolean {
    return this.trimAndLowerCase(str1) === this.trimAndLowerCase(str2);
  }

  /**
   * Compare strings ignoring case only
   * @param str1 - First string
   * @param str2 - Second string
   * @returns true if strings are equal (ignoring case)
   */
  static equalsIgnoreCase(str1: string | null | undefined, str2: string | null | undefined): boolean {
    return this.toLowerCase(str1) === this.toLowerCase(str2);
  }

  /**
   * Remove all whitespace from string
   * @param value - String to process
   * @returns String with all whitespace removed
   */
  static removeWhitespace(value: string | null | undefined): string {
    return this.trim(value).replace(/\s/g, '');
  }

  /**
   * Collapse consecutive spaces into single space
   * @param value - String to process
   * @returns String with single spaces
   */
  static collapseSpaces(value: string | null | undefined): string {
    return this.trim(value).replace(/\s+/g, ' ');
  }

  /**
   * Capitalize first letter of string
   * @param value - String to capitalize
   * @returns Capitalized string
   */
  static capitalize(value: string | null | undefined): string {
    const str = this.trim(value);
    if (str.length === 0) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Uncapitalize first letter of string
   * @param value - String to uncapitalize
   * @returns Uncapitalized string
   */
  static uncapitalize(value: string | null | undefined): string {
    const str = this.trim(value);
    if (str.length === 0) return '';
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Split string and trim each part
   * @param value - String to split
   * @param separator - Separator (default: comma)
   * @returns Array of trimmed strings, excluding empty strings
   */
  static splitAndTrim(value: string | null | undefined, separator: string = ','): string[] {
    if (this.isNullOrEmpty(value)) return [];
    return value!.split(separator).map(s => s.trim()).filter(s => s.length > 0);
  }

  /**
   * Join array of strings with separator and optional prefix/suffix
   * @param items - Array of items to join
   * @param separator - Separator (default: comma)
   * @param prefix - Prefix for each item (default: empty)
   * @param suffix - Suffix for each item (default: empty)
   * @returns Joined string
   */
  static joinWithFormat(items: string[], separator: string = ',', prefix: string = '', suffix: string = ''): string {
    return items.map(item => `${prefix}${item}${suffix}`).join(separator);
  }

  /**
   * Check if string starts with value (case-insensitive option)
   * @param value - String to check
   * @param prefix - Prefix to look for
   * @param ignoreCase - Ignore case (default: false)
   * @returns true if string starts with prefix
   */
  static startsWith(value: string | null | undefined, prefix: string, ignoreCase: boolean = false): boolean {
    const str = ignoreCase ? this.toLowerCase(value) : (value ?? '');
    const pfx = ignoreCase ? prefix.toLowerCase() : prefix;
    return str.startsWith(pfx);
  }

  /**
   * Check if string ends with value (case-insensitive option)
   * @param value - String to check
   * @param suffix - Suffix to look for
   * @param ignoreCase - Ignore case (default: false)
   * @returns true if string ends with suffix
   */
  static endsWith(value: string | null | undefined, suffix: string, ignoreCase: boolean = false): boolean {
    const str = ignoreCase ? this.toLowerCase(value) : (value ?? '');
    const sfx = ignoreCase ? suffix.toLowerCase() : suffix;
    return str.endsWith(sfx);
  }

  /**
   * Check if string contains value (case-insensitive option)
   * @param value - String to check
   * @param searchValue - Value to search for
   * @param ignoreCase - Ignore case (default: false)
   * @returns true if string contains value
   */
  static contains(value: string | null | undefined, searchValue: string, ignoreCase: boolean = false): boolean {
    const str = ignoreCase ? this.toLowerCase(value) : (value ?? '');
    const search = ignoreCase ? searchValue.toLowerCase() : searchValue;
    return str.includes(search);
  }

  /**
   * Replace all occurrences of a value (case-insensitive option)
   * @param value - String to process
   * @param searchValue - Value to search for
   * @param replaceValue - Value to replace with
   * @param ignoreCase - Ignore case (default: false)
   * @returns String with replacements
   */
  static replaceAll(value: string | null | undefined, searchValue: string, replaceValue: string, ignoreCase: boolean = false): string {
    let str = this.trim(value);
    if (ignoreCase) {
      const regex = new RegExp(searchValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return str.replace(regex, replaceValue);
    }
    return str.split(searchValue).join(replaceValue);
  }

  /**
   * Reverse a string
   * @param value - String to reverse
   * @returns Reversed string
   */
  static reverse(value: string | null | undefined): string {
    return this.trim(value).split('').reverse().join('');
  }

  /**
   * Get substring safely without error handling
   * @param value - String to process
   * @param start - Start index
   * @param length - Length (optional)
   * @returns Substring
   */
  static substring(value: string | null | undefined, start: number, length?: number): string {
    const str = this.trim(value);
    if (start >= str.length) return '';
    return length ? str.substr(start, length) : str.substring(start);
  }
}
