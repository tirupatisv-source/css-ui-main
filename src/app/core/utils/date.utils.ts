/**
 * Date utility functions for common date operations.
 * Consolidates duplicate date handling and formatting across components.
 */
export class DateUtils {
  /**
   * Format date to ISO date string (YYYY-MM-DD)
   * @param date - Date to format
   * @returns ISO date string or empty string if null
   */
  static formatToISODate(date: Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }

  /**
   * Format date to display format (MM/DD/YYYY)
   * @param date - Date to format
   * @returns Formatted date string
   */
  static formatToDisplayDate(date: Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${month}/${day}/${d.getFullYear()}`;
  }

  /**
   * Format date to datetime string (YYYY-MM-DD HH:mm:ss)
   * @param date - Date to format
   * @returns Formatted datetime string
   */
  static formatToDateTime(date: Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Format date with custom format string
   * @param date - Date to format
   * @param format - Format string (YYYY, MM, DD, HH, mm, ss)
   * @returns Formatted date string
   */
  static format(date: Date | null | undefined, format: string): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace(/YYYY/g, String(year))
      .replace(/MM/g, month)
      .replace(/DD/g, day)
      .replace(/HH/g, hours)
      .replace(/mm/g, minutes)
      .replace(/ss/g, seconds);
  }

  /**
   * Parse date string to Date object (supports ISO, MM/DD/YYYY, DD/MM/YYYY)
   * @param dateString - Date string to parse
   * @param format - Optional format hint ('iso', 'us', 'eu')
   * @returns Parsed Date or null if invalid
   */
  static parse(dateString: string | null | undefined, format?: string): Date | null {
    if (!dateString) return null;

    // Try ISO format first (YYYY-MM-DD)
    if (dateString.includes('-') && dateString.length === 10) {
      const date = new Date(dateString + 'T00:00:00Z');
      if (!isNaN(date.getTime())) return date;
    }

    // Try ISO datetime (YYYY-MM-DD HH:mm:ss)
    if (dateString.includes('-') && dateString.includes(' ')) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) return date;
    }

    // Try MM/DD/YYYY or DD/MM/YYYY
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const isUS = format === 'us' || !format;
        const month = parseInt(parts[isUS ? 0 : 1], 10);
        const day = parseInt(parts[isUS ? 1 : 0], 10);
        const year = parseInt(parts[2], 10);

        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return new Date(year, month - 1, day);
        }
      }
    }

    return null;
  }

  /**
   * Get current date at start of day (00:00:00)
   * @returns Today's date at midnight
   */
  static today(): Date {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }

  /**
   * Get tomorrow's date at start of day
   * @returns Tomorrow's date at midnight
   */
  static tomorrow(): Date {
    const date = this.today();
    date.setDate(date.getDate() + 1);
    return date;
  }

  /**
   * Get yesterday's date at start of day
   * @returns Yesterday's date at midnight
   */
  static yesterday(): Date {
    const date = this.today();
    date.setDate(date.getDate() - 1);
    return date;
  }

  /**
   * Add days to date
   * @param date - Starting date
   * @param days - Number of days to add (negative to subtract)
   * @returns New date with days added
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add months to date
   * @param date - Starting date
   * @param months - Number of months to add (negative to subtract)
   * @returns New date with months added
   */
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Add years to date
   * @param date - Starting date
   * @param years - Number of years to add (negative to subtract)
   * @returns New date with years added
   */
  static addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Get start of month for given date
   * @param date - Date to process
   * @returns First day of the month at midnight
   */
  static startOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  /**
   * Get end of month for given date
   * @param date - Date to process
   * @returns Last day of the month at 23:59:59
   */
  static endOfMonth(date: Date): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1);
    result.setDate(0);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  /**
   * Get number of days between two dates
   * @param date1 - First date
   * @param date2 - Second date
   * @returns Number of days (can be negative)
   */
  static daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2.getTime() - date1.getTime()) / oneDay);
  }

  /**
   * Check if two dates are on the same day
   * @param date1 - First date
   * @param date2 - Second date
   * @returns true if dates are the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Check if date is today
   * @param date - Date to check
   * @returns true if date is today
   */
  static isToday(date: Date): boolean {
    return this.isSameDay(date, new Date());
  }

  /**
   * Check if date is in the past
   * @param date - Date to check
   * @returns true if date is before today
   */
  static isPast(date: Date): boolean {
    const today = this.today();
    return date < today;
  }

  /**
   * Check if date is in the future
   * @param date - Date to check
   * @returns true if date is after today
   */
  static isFuture(date: Date): boolean {
    const today = this.today();
    return date > today;
  }

  /**
   * Check if date is in the past or today
   * @param date - Date to check
   * @returns true if date is today or before
   */
  static isPastOrToday(date: Date): boolean {
    return date <= this.today();
  }

  /**
   * Check if date is in the future or today
   * @param date - Date to check
   * @returns true if date is today or after
   */
  static isFutureOrToday(date: Date): boolean {
    return date >= this.today();
  }

  /**
   * Get age in years from date of birth
   * @param dateOfBirth - Date of birth
   * @returns Age in years
   */
  static getAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Check if year is leap year
   * @param year - Year to check
   * @returns true if year is leap year
   */
  static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Get number of days in month
   * @param year - Year
   * @param month - Month (1-12)
   * @returns Number of days
   */
  static getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * Get day of week as string
   * @param date - Date to check
   * @param length - Length of name ('short' or 'long', default: 'long')
   * @returns Day name (Monday, Tuesday, etc. or Mon, Tue, etc.)
   */
  static getDayOfWeekName(date: Date, length: 'short' | 'long' = 'long'): string {
    const dayNames = {
      long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
    return dayNames[length][date.getDay()];
  }

  /**
   * Get month name as string
   * @param month - Month (1-12)
   * @param length - Length of name ('short' or 'long', default: 'long')
   * @returns Month name (January, February, etc. or Jan, Feb, etc.)
   */
  static getMonthName(month: number, length: 'short' | 'long' = 'long'): string {
    const monthNames = {
      long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };
    return monthNames[length][month - 1] || '';
  }

  /**
   * Get quarter of year
   * @param date - Date to check
   * @returns Quarter (1-4)
   */
  static getQuarter(date: Date): number {
    return Math.floor(date.getMonth() / 3) + 1;
  }

  /**
   * Check if date is within range
   * @param date - Date to check
   * @param startDate - Range start
   * @param endDate - Range end
   * @returns true if date is within range (inclusive)
   */
  static isWithinRange(date: Date, startDate: Date, endDate: Date): boolean {
    return date >= startDate && date <= endDate;
  }
}
