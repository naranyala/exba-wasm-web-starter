/**
 * Reactivity primitives for EXBA Framework.
 *
 * Provides standalone, auto-tracking reactive functions as an alternative
 * to the EXBA.createSignal() / EXBA.createComputed() class methods.
 *
 * @example
 * ```ts
 * import { signal, effect, memo, batch } from '@core/reactivity';
 *
 * const count = signal(0);
 * const doubled = memo(() => count.value * 2);
 *
 * effect((onCleanup) => {
 *   console.log('count:', count.value, 'doubled:', doubled.value);
 *   onCleanup(() => console.log('cleaned up'));
 * });
 *
 * batch(() => {
 *   count.value = 5;
 * });
 * ```
 */
export {
  signal,
  memo,
  computed,
  effect,
  untrack,
  batch,
  on,
  listen,
  flushQueue,
} from './primitives';

export type { Signal, Memo } from './primitives';
