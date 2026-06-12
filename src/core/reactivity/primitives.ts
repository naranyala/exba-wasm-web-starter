// ─── Internal Tracking Context ──────────────────────────────────

type Cleanup = () => void;
type Dispose = () => void;
type Subscriber = (val?: any) => void;

export let activeEffect: EffectContext | null = null;
export let activeMemo: MemoContext | null = null;

interface EffectContext {
  deps: Set<Trackable>;
  fn: (onCleanup: (fn: Cleanup) => void) => void;
  cleanups: Cleanup[];
  disposed: boolean;
}

interface MemoContext {
  deps: Set<Trackable>;
  fn: () => any;
  cachedValue: any;
  dirty: boolean;
  subscribers: Set<Subscriber>;
  disposed: boolean;
}

/** Anything that can be a dependency target (signal or memo/computed). */
interface Trackable {
  subscribeDep(sub: Subscriber): void;
  unsubscribeDep(sub: Subscriber): void;
}

/** Notify all subscribers in a set using a snapshot to prevent re-entrancy loops. */
export function notifySubscribers(subs: Set<Subscriber>, value: any) {
  const toNotify = Array.from(subs);
  for (const cb of toNotify) {
    if ((cb as any)._isEffect) {
      queueEffect(cb);
    } else {
      cb(value);
    }
  }
}

// ─── Microtask & Sync Batching ──────────────────────────────────

let batchDepth = 0;
const pendingBatch = new Set<Subscriber>();
const microtaskQueue = new Set<Subscriber>();
let microtaskScheduled = false;

function queueEffect(cb: Subscriber) {
  microtaskQueue.add(cb);
  if (!microtaskScheduled) {
    microtaskScheduled = true;
    queueMicrotask(() => {
      microtaskScheduled = false;
      flushQueue();
    });
  }
}

export function flushQueue() {
  const toFlush = Array.from(microtaskQueue);
  microtaskQueue.clear();
  toFlush.forEach((cb) => cb());
}

export function batch(fn: () => void): void {
  batchDepth++;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      const toFlush = Array.from(pendingBatch);
      pendingBatch.clear();
      toFlush.forEach((cb) => {
        if ((cb as any)._isEffect) {
          queueEffect(cb);
        } else {
          cb((cb as any)._pendingValue);
        }
      });
    }
  }
}

// ─── Signal ─────────────────────────────────────────────────────

export interface Signal<T> {
  0: () => T;
  1: (v: T | ((prev: T) => T)) => void;
  /** Get the current value (auto-tracks if inside effect/memo). */
  get value(): T;
  /** Set the value (strict equality check + microtask batching). */
  set value(v: T);
  /** Read without tracking. */
  peek(): T;
  /** Subscribe to value changes. Returns dispose function. */
  subscribe(cb: (v: T) => void): Dispose;
}

export function signal<T>(initialValue: T): Signal<T> {
  const subs = new Set<Subscriber>();
  const trackable: Trackable = {
    subscribeDep: (sub) => subs.add(sub),
    unsubscribeDep: (sub) => subs.delete(sub),
  };
  let val = initialValue;

  const getter = () => {
    if (activeEffect) {
      activeEffect.deps.add(trackable);
    }
    if (activeMemo) {
      activeMemo.deps.add(trackable);
    }
    return val;
  };

  const setter = (newVal: T | ((prev: T) => T)) => {
    const nextVal =
      typeof newVal === 'function' ? (newVal as Function)(val) : newVal;
    if (val === nextVal) return;
    val = nextVal;
    if (batchDepth > 0) {
      subs.forEach((cb) => {
        (cb as any)._pendingValue = val;
        pendingBatch.add(cb);
      });
    } else {
      notifySubscribers(subs, val);
    }
  };

  const s = [getter, setter] as any;

  Object.defineProperty(s, 'value', {
    get: getter,
    set: setter,
  });

  s.peek = () => val;
  s.subscribe = (cb: (v: T) => void) => {
    subs.add(cb);
    return () => subs.delete(cb);
  };

  return s as Signal<T>;
}

// ─── Memo ───────────────────────────────────────────────────────

export interface Memo<T> {
  /** Get the computed value (lazy, cached until dirty). */
  get value(): T;
  /** Read without tracking. */
  peek(): T;
  /** Subscribe to value changes. Returns dispose function. */
  subscribe(cb: (v: T) => void): Dispose;
}

export function memo<T>(fn: () => T): Memo<T> {
  const subs = new Set<Subscriber>();
  const depSet = new Set<Trackable>();
  const selfTrackable: Trackable = {
    subscribeDep: (sub) => subs.add(sub),
    unsubscribeDep: (sub) => subs.delete(sub),
  };
  let cachedValue: any;
  let dirty = true;
  const disposed = false;

  function invalidate() {
    if (disposed || dirty) return;
    dirty = true;
    notifySubscribers(subs, cachedValue);
  }

  function recompute() {
    depSet.forEach((d) => d.unsubscribeDep(invalidate));
    depSet.clear();

    const prevMemo = activeMemo;
    const prevEffect = activeEffect;
    activeMemo = {
      deps: depSet,
      fn,
      cachedValue,
      dirty,
      subscribers: subs,
      disposed,
    };
    activeEffect = null;

    cachedValue = fn();

    activeMemo = prevMemo;
    activeEffect = prevEffect;

    depSet.forEach((d) => d.subscribeDep(invalidate));
    dirty = false;
  }

  const m: Memo<T> = {
    get value() {
      if (dirty && !disposed) {
        recompute();
      }
      if (activeEffect) {
        activeEffect.deps.add(selfTrackable);
      }
      if (activeMemo) {
        activeMemo.deps.add(selfTrackable);
      }
      return cachedValue;
    },
    peek: () => cachedValue,
    subscribe(cb: (v: T) => void) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
  };

  // Initial computation
  recompute();

  return m;
}

// ─── Computed ───────────────────────────────────────────────────

export function computed<T>(fn: () => T): Memo<T> {
  const subs = new Set<Subscriber>();
  const depSet = new Set<Trackable>();
  const selfTrackable: Trackable = {
    subscribeDep: (sub) => subs.add(sub),
    unsubscribeDep: (sub) => subs.delete(sub),
  };
  let cachedValue: any;
  let dirty = true;
  const disposed = false;

  function recompute() {
    depSet.forEach((d) => d.unsubscribeDep(invalidate));
    depSet.clear();

    const prevMemo = activeMemo;
    const prevEffect = activeEffect;
    activeMemo = {
      deps: depSet,
      fn,
      cachedValue,
      dirty,
      subscribers: subs,
      disposed,
    };
    activeEffect = null;

    cachedValue = fn();

    activeMemo = prevMemo;
    activeEffect = prevEffect;

    depSet.forEach((d) => d.subscribeDep(invalidate));
    dirty = false;
  }

  function invalidate() {
    if (disposed || dirty) return;
    if (subs.size > 0) {
      const prevVal = cachedValue;
      recompute();
      if (cachedValue !== prevVal) {
        notifySubscribers(subs, cachedValue);
      }
    } else {
      dirty = true;
    }
  }

  const m: Memo<T> = {
    get value() {
      if (dirty && !disposed) {
        recompute();
      }
      if (activeEffect) {
        activeEffect.deps.add(selfTrackable);
      }
      if (activeMemo) {
        activeMemo.deps.add(selfTrackable);
      }
      return cachedValue;
    },
    peek: () => cachedValue,
    subscribe(cb: (v: T) => void) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
  };

  // Initial computation
  recompute();

  return m;
}

// ─── Effect ─────────────────────────────────────────────────────

export function effect(
  fn: (onCleanup: (cleanupFn: Cleanup) => void) => void,
): Dispose {
  const ctx: EffectContext = {
    deps: new Set(),
    fn,
    cleanups: [],
    disposed: false,
  };

  const run = () => {
    if (ctx.disposed) return;

    ctx.cleanups.forEach((c) => c());
    ctx.cleanups.length = 0;

    ctx.deps.forEach((d) => d.unsubscribeDep(run));
    ctx.deps.clear();

    const prevEffect = activeEffect;
    const prevMemo = activeMemo;
    activeEffect = ctx;
    activeMemo = null;

    ctx.fn((cleanupFn) => {
      ctx.cleanups.push(cleanupFn);
    });

    activeEffect = prevEffect;
    activeMemo = prevMemo;

    ctx.deps.forEach((d) => d.subscribeDep(run));
  };

  (run as any)._isEffect = true;

  run();

  return () => {
    ctx.disposed = true;
    ctx.cleanups.forEach((c) => c());
    ctx.cleanups.length = 0;
    ctx.deps.forEach((d) => d.unsubscribeDep(run));
    ctx.deps.clear();
  };
}

// ─── Untrack ────────────────────────────────────────────────────

export function untrack<T>(fn: () => T): T {
  const prevEffect = activeEffect;
  const prevMemo = activeMemo;
  activeEffect = null;
  activeMemo = null;
  try {
    return fn();
  } finally {
    activeEffect = prevEffect;
    activeMemo = prevMemo;
  }
}

// ─── On & Listen ────────────────────────────────────────────────

export function on<T>(
  deps: Signal<T> | Signal<any>[],
  callback: (v: any) => void,
): Dispose {
  if (Array.isArray(deps) && typeof (deps as any).subscribe !== 'function') {
    const unsubscribes = deps.map((dep) =>
      dep.subscribe(() => {
        callback(deps.map((d) => d.peek()));
      }),
    );
    return () => unsubscribes.forEach((unsub) => unsub());
  }
  return (deps as any).subscribe(callback);
}

export const listen = on;
