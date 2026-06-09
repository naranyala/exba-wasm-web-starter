export type Mapper<T, U> = (input: T) => U;

/**
 * Performs left-to-right function composition.
 * The first function can take any number of arguments,
 * and the result of each function is passed to the next.
 */
export function pipe<T>(value: T, ...fns: Mapper<any, any>[]): any {
  return fns.reduce((acc, fn) => fn(acc), value);
}

/**
 * Performs right-to-left function composition.
 */
export function compose<T>(...fns: Mapper<any, any>[]): Mapper<any, T> {
  return (initialValue: any) =>
    fns.reduceRight((acc, fn) => fn(acc), initialValue);
}

/**
 * Curries a function to allow partial application.
 */
export function curry<T extends any[], R>(fn: (...args: T) => R): any {
  return function curried(...args: any[]) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...args2: any[]) => curried(...args, ...args2);
  };
}

/**
 * Creates a lens for immutable updates of nested objects.
 */
export function lens<T, K extends keyof T>(key: K) {
  return {
    get: (obj: T) => obj[key],
    set: (val: T[K], obj: T) => ({ ...obj, [key]: val }),
  };
}
