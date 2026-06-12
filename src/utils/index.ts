/**
 * Collection of high-utility TypeScript helpers for array and object manipulation.
 */
export const Collection = {
  /**
   * Deeply clones an object or array using JSON serialization.
   * Note: Does not support functions, undefined, or circular references.
   * @param obj The object or array to clone
   * @returns A deep copy of the input
   */
  clone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Returns an array containing only unique elements based on a specific key.
   * @param arr The source array
   * @param key The key to check for uniqueness
   * @returns A new array with unique items
   */
  uniqueBy: <T>(arr: T[], key: keyof T) => {
    return Array.from(new Map(arr.map((item) => [item[key], item])).values());
  },

  /**
   * Groups an array of objects into a record keyed by the values of a specific property.
   * @param arr The source array
   * @param key The property key to group by
   * @returns A record where each key points to an array of matching objects
   */
  groupBy: <T>(arr: T[], key: keyof T) => {
    return arr.reduce(
      (acc, item) => {
        const group = String(item[key]);
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
      },
      {} as Record<string, T[]>,
    );
  },

  /**
   * Shuffles an array in place using the Fisher-Yates algorithm.
   * @param arr The source array
   * @returns A new array with elements in random order
   */
  shuffle: <T>(arr: T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * Recursively flattens a nested array structure into a single-level array.
   * @param arr The nested array to flatten
   * @returns A flat array containing all leaf elements
   */
  flatten: <T>(arr: any[]): T[] => {
    return arr.reduce(
      (acc, val) =>
        Array.isArray(val)
          ? acc.concat(Collection.flatten(val))
          : acc.concat(val),
      [],
    );
  },
};

/**
 * Utilities for handling asynchronous operations, timing, and flow control.
 */
export const Async = {
  /**
   * Returns a version of the function that only executes after a specified delay
   * since the last call.
   * @param fn The function to debounce
   * @param delay Delay in milliseconds
   * @returns The debounced function
   */
  debounce: <T extends (...args: any[]) => any>(fn: T, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },

  /**
   * Returns a version of the function that only executes at most once per
   * specified time limit.
   * @param fn The function to throttle
   * @param limit Time limit in milliseconds
   * @returns The throttled function
   */
  throttle: <T extends (...args: any[]) => any>(fn: T, limit: number) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Retries an asynchronous operation multiple times before failing.
   * @param fn The async function to retry
   * @param retries Number of retry attempts (default: 3)
   * @param delay Delay between attempts in milliseconds (default: 1000)
   * @returns The result of the operation
   * @throws The last error encountered if all retries fail
   */
  retry: async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000,
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return Async.retry(fn, retries - 1, delay);
    }
  },

  /**
   * Pauses execution for a specified amount of time.
   * @param ms Time to wait in milliseconds
   * @returns A promise that resolves after the delay
   */
  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

/**
 * DOM manipulation and querying helpers.
 */
export const DOM = {
  /**
   * Queries an element from the DOM and casts it to a specific HTMLElement type.
   * @param selector CSS selector string
   * @returns The found element or null
   */
  query: <T extends HTMLElement>(selector: string): T | null => {
    return document.querySelector(selector) as T | null;
  },

  /**
   * Toggles a CSS class on an element, optionally forcing a state.
   * @param el Target HTML element
   * @param className Class name to toggle
   * @param force Optional boolean to force inclusion or removal
   */
  toggle: (el: HTMLElement, className: string, force?: boolean) => {
    el.classList.toggle(className, force);
  },

  /**
   * Determines if an element is currently visible within the browser's viewport.
   * @param el Target HTML element
   * @returns true if the element is visible
   */
  isVisible: (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },
};

/**
 * Common mathematical utilities.
 */
export const MathUtils = {
  /**
   * Constrains a value between a minimum and maximum range.
   * @param val The input value
   * @param min The lower bound
   * @param max The upper bound
   * @returns The clamped value
   */
  clamp: (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val)),

  /**
   * Performs linear interpolation between two values.
   * @param start The start value
   * @param end The end value
   * @param t The interpolation factor (0.0 to 1.0)
   * @returns The interpolated value
   */
  lerp: (start: number, end: number, t: number) => start * (1 - t) + end * t,

  /**
   * Generates a random integer within a specific range.
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns A random integer
   */
  randomInt: (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
};

/**
 * Date and time formatting utilities.
 */
export const DateUtils = {
  /**
   * Formats a Date object into an ISO date string (YYYY-MM-DD).
   * @param date The Date object (defaults to now)
   * @returns Formatted date string
   */
  format: (date: Date = new Date()) => date.toISOString().split('T')[0],

  /**
   * Generates a human-friendly relative time string (e.g., "2 hours ago").
   * @param date The past Date object to compare against
   * @returns Relative time string
   */
  timeAgo: (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    return 'just now';
  },
};
