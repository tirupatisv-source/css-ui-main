/**
 * Array utility functions for common array operations.
 * Consolidates duplicate array handling and transformations across components.
 */
export class ArrayUtils {
  /**
   * Check if array is null, undefined, or empty
   * @param array - Array to check
   * @returns true if array is null/undefined/empty
   */
  static isEmpty(array: any[] | null | undefined): boolean {
    return !array || array.length === 0;
  }

  /**
   * Check if array has elements (inverse of isEmpty)
   * @param array - Array to check
   * @returns true if array has elements
   */
  static hasElements(array: any[] | null | undefined): boolean {
    return !this.isEmpty(array);
  }

  /**
   * Get first element of array
   * @param array - Array to process
   * @returns First element or undefined
   */
  static first<T>(array: T[] | null | undefined): T | undefined {
    return this.isEmpty(array) ? undefined : array![0];
  }

  /**
   * Get last element of array
   * @param array - Array to process
   * @returns Last element or undefined
   */
  static last<T>(array: T[] | null | undefined): T | undefined {
    return this.isEmpty(array) ? undefined : array![array!.length - 1];
  }

  /**
   * Get element at index with bounds checking
   * @param array - Array to process
   * @param index - Index to retrieve
   * @returns Element at index or undefined
   */
  static getAt<T>(array: T[] | null | undefined, index: number): T | undefined {
    if (this.isEmpty(array) || index < 0 || index >= array!.length) {
      return undefined;
    }
    return array![index];
  }

  /**
   * Remove duplicates from array
   * @param array - Array to process
   * @returns Array with duplicates removed
   */
  static distinct<T>(array: T[]): T[] {
    if (this.isEmpty(array)) return [];
    return [...new Set(array)];
  }

  /**
   * Remove duplicates by property (for objects)
   * @param array - Array to process
   * @param property - Property name to check for uniqueness
   * @returns Array with duplicate properties removed
   */
  static distinctBy<T>(array: T[], property: keyof T): T[] {
    if (this.isEmpty(array)) return [];
    const seen = new Set();
    return array.filter(item => {
      const value = item[property];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  /**
   * Flatten nested arrays
   * @param array - Array to flatten
   * @param depth - Depth to flatten (default: 1)
   * @returns Flattened array
   */
  static flatten<T>(array: any[], depth: number = 1): T[] {
    if (this.isEmpty(array)) return [];
    if (depth <= 0) return array;
    return array.reduce((acc, val) => 
      acc.concat(Array.isArray(val) ? this.flatten(val, depth - 1) : val), []);
  }

  /**
   * Find element by property value
   * @param array - Array to search
   * @param property - Property name
   * @param value - Value to match
   * @returns First matching element or undefined
   */
  static findBy<T>(array: T[] | null | undefined, property: keyof T, value: any): T | undefined {
    if (this.isEmpty(array)) return undefined;
    return array!.find(item => item[property] === value);
  }

  /**
   * Find all elements by property value
   * @param array - Array to search
   * @param property - Property name
   * @param value - Value to match
   * @returns Array of matching elements
   */
  static filterBy<T>(array: T[] | null | undefined, property: keyof T, value: any): T[] {
    if (this.isEmpty(array)) return [];
    return array!.filter(item => item[property] === value);
  }

  /**
   * Group array elements by property
   * @param array - Array to group
   * @param property - Property to group by
   * @returns Object with grouped elements
   */
  static groupBy<T>(array: T[] | null | undefined, property: keyof T): { [key: string]: T[] } {
    if (this.isEmpty(array)) return {};
    return array!.reduce((acc, item) => {
      const key = String(item[property]);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as { [key: string]: T[] });
  }

  /**
   * Map array elements by property
   * @param array - Array to process
   * @param property - Property to map
   * @returns Array of property values
   */
  static pluck<T, K extends keyof T>(array: T[] | null | undefined, property: K): T[K][] {
    if (this.isEmpty(array)) return [];
    return array!.map(item => item[property]);
  }

  /**
   * Count elements in array matching predicate
   * @param array - Array to count
   * @param predicate - Condition function
   * @returns Count of matching elements
   */
  static count<T>(array: T[] | null | undefined, predicate?: (item: T) => boolean): number {
    if (this.isEmpty(array)) return 0;
    if (!predicate) return array!.length;
    return array!.filter(predicate).length;
  }

  /**
   * Check if array contains element
   * @param array - Array to search
   * @param element - Element to find
   * @returns true if element is in array
   */
  static contains<T>(array: T[] | null | undefined, element: T): boolean {
    return !this.isEmpty(array) && array!.includes(element);
  }

  /**
   * Check if array contains any element matching predicate
   * @param array - Array to search
   * @param predicate - Condition function
   * @returns true if any element matches predicate
   */
  static containsAny<T>(array: T[] | null | undefined, predicate: (item: T) => boolean): boolean {
    if (this.isEmpty(array)) return false;
    return array!.some(predicate);
  }

  /**
   * Check if array contains all elements matching predicate
   * @param array - Array to search
   * @param predicate - Condition function
   * @returns true if all elements match predicate
   */
  static containsAll<T>(array: T[] | null | undefined, predicate: (item: T) => boolean): boolean {
    if (this.isEmpty(array)) return false;
    return array!.every(predicate);
  }

  /**
   * Find index of element
   * @param array - Array to search
   * @param element - Element to find
   * @returns Index of element or -1
   */
  static indexOf<T>(array: T[] | null | undefined, element: T): number {
    if (this.isEmpty(array)) return -1;
    return array!.indexOf(element);
  }

  /**
   * Find index by property value
   * @param array - Array to search
   * @param property - Property name
   * @param value - Value to match
   * @returns Index of first matching element or -1
   */
  static indexOfBy<T>(array: T[] | null | undefined, property: keyof T, value: any): number {
    if (this.isEmpty(array)) return -1;
    return array!.findIndex(item => item[property] === value);
  }

  /**
   * Remove element from array
   * @param array - Array to modify
   * @param element - Element to remove
   * @returns Array with element removed (new array)
   */
  static remove<T>(array: T[] | null | undefined, element: T): T[] {
    if (this.isEmpty(array)) return [];
    return array!.filter(item => item !== element);
  }

  /**
   * Remove element by property value
   * @param array - Array to modify
   * @param property - Property name
   * @param value - Value to match for removal
   * @returns Array with matching element removed (new array)
   */
  static removeBy<T>(array: T[] | null | undefined, property: keyof T, value: any): T[] {
    if (this.isEmpty(array)) return [];
    return array!.filter(item => item[property] !== value);
  }

  /**
   * Remove element at index
   * @param array - Array to modify
   * @param index - Index to remove
   * @returns Array with element removed (new array)
   */
  static removeAt<T>(array: T[] | null | undefined, index: number): T[] {
    if (this.isEmpty(array) || index < 0 || index >= array!.length) {
      return array || [];
    }
    return [...array!.slice(0, index), ...array!.slice(index + 1)];
  }

  /**
   * Replace element in array
   * @param array - Array to modify
   * @param oldElement - Element to replace
   * @param newElement - Replacement element
   * @returns Array with element replaced (new array)
   */
  static replace<T>(array: T[] | null | undefined, oldElement: T, newElement: T): T[] {
    if (this.isEmpty(array)) return [];
    return array!.map(item => item === oldElement ? newElement : item);
  }

  /**
   * Replace element by index
   * @param array - Array to modify
   * @param index - Index to replace
   * @param newElement - Replacement element
   * @returns Array with element replaced (new array)
   */
  static replaceAt<T>(array: T[] | null | undefined, index: number, newElement: T): T[] {
    if (this.isEmpty(array) || index < 0 || index >= array!.length) {
      return array || [];
    }
    return [...array!.slice(0, index), newElement, ...array!.slice(index + 1)];
  }

  /**
   * Sort array in ascending order
   * @param array - Array to sort
   * @param property - Optional property to sort by (for objects)
   * @returns Sorted array
   */
  static sort<T>(array: T[] | null | undefined, property?: keyof T): T[] {
    if (this.isEmpty(array)) return [];
    const copy = [...array!];
    if (property) {
      copy.sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
      });
    } else {
      copy.sort();
    }
    return copy;
  }

  /**
   * Sort array in descending order
   * @param array - Array to sort
   * @param property - Optional property to sort by (for objects)
   * @returns Sorted array
   */
  static sortDescending<T>(array: T[] | null | undefined, property?: keyof T): T[] {
    if (this.isEmpty(array)) return [];
    const copy = [...array!];
    if (property) {
      copy.sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];
        if (aVal > bVal) return -1;
        if (aVal < bVal) return 1;
        return 0;
      });
    } else {
      copy.sort().reverse();
    }
    return copy;
  }

  /**
   * Reverse array
   * @param array - Array to reverse
   * @returns Reversed array
   */
  static reverse<T>(array: T[] | null | undefined): T[] {
    if (this.isEmpty(array)) return [];
    return [...array!].reverse();
  }

  /**
   * Get slice of array
   * @param array - Array to slice
   * @param start - Start index (default: 0)
   * @param end - End index (optional)
   * @returns Sliced array
   */
  static slice<T>(array: T[] | null | undefined, start: number = 0, end?: number): T[] {
    if (this.isEmpty(array)) return [];
    return array!.slice(start, end);
  }

  /**
   * Get first N elements
   * @param array - Array to process
   * @param n - Number of elements
   * @returns First N elements
   */
  static take<T>(array: T[] | null | undefined, n: number): T[] {
    return this.slice(array, 0, n);
  }

  /**
   * Skip first N elements
   * @param array - Array to process
   * @param n - Number of elements to skip
   * @returns Array without first N elements
   */
  static skip<T>(array: T[] | null | undefined, n: number): T[] {
    return this.slice(array, n);
  }

  /**
   * Get every Nth element
   * @param array - Array to process
   * @param n - Step size
   * @returns Every Nth element
   */
  static everyNth<T>(array: T[] | null | undefined, n: number): T[] {
    if (this.isEmpty(array) || n <= 0) return [];
    return array!.filter((_, i) => i % n === 0);
  }

  /**
   * Rotate array elements
   * @param array - Array to rotate
   * @param steps - Number of positions to rotate (positive: right, negative: left)
   * @returns Rotated array
   */
  static rotate<T>(array: T[] | null | undefined, steps: number = 1): T[] {
    if (this.isEmpty(array) || array!.length <= 1) return array || [];
    const normalized = steps % array!.length;
    return [...array!.slice(-normalized), ...array!.slice(0, array!.length - normalized)];
  }

  /**
   * Get sum of numeric array or property values
   * @param array - Array to sum
   * @param property - Optional property to sum (for objects)
   * @returns Sum of values
   */
  static sum(array: number[] | null | undefined, property?: undefined): number;
  static sum<T>(array: T[] | null | undefined, property: keyof T): number;
  static sum<T>(array: (number | T)[] | null | undefined, property?: keyof T): number {
    if (this.isEmpty(array)) return 0;
    if (property) {
      return (array as T[]).reduce((sum, item) => {
        const val = item[property];
        return sum + (typeof val === 'number' ? val : 0);
      }, 0);
    } else {
      return (array as number[]).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    }
  }

  /**
   * Get average of numeric array or property values
   * @param array - Array to average
   * @param property - Optional property to average (for objects)
   * @returns Average value
   */
  static average(array: number[] | null | undefined, property?: undefined): number;
  static average<T>(array: T[] | null | undefined, property: keyof T): number;
  static average<T>(array: (number | T)[] | null | undefined, property?: keyof T): number {
    if (this.isEmpty(array)) return 0;
    const sum = this.sum(array as any, property as any);
    return sum / (array as any).length;
  }

  /**
   * Get minimum value in array
   * @param array - Array to process
   * @param property - Optional property to check (for objects)
   * @returns Minimum value
   */
  static min(array: number[] | null | undefined, property?: undefined): number;
  static min<T>(array: T[] | null | undefined, property: keyof T): any;
  static min<T>(array: (number | T)[] | null | undefined, property?: keyof T): number | any {
    if (this.isEmpty(array)) return NaN;
    if (property) {
      return Math.min(...(array as T[]).map(item => {
        const val = item[property];
        return typeof val === 'number' ? val : NaN;
      }));
    } else {
      return Math.min(...(array as number[]));
    }
  }

  /**
   * Get maximum value in array
   * @param array - Array to process
   * @param property - Optional property to check (for objects)
   * @returns Maximum value
   */
  static max(array: number[] | null | undefined, property?: undefined): number;
  static max<T>(array: T[] | null | undefined, property: keyof T): any;
  static max<T>(array: (number | T)[] | null | undefined, property?: keyof T): number | any {
    if (this.isEmpty(array)) return NaN;
    if (property) {
      return Math.max(...(array as T[]).map(item => {
        const val = item[property];
        return typeof val === 'number' ? val : NaN;
      }));
    } else {
      return Math.max(...(array as number[]));
    }
  }
}
