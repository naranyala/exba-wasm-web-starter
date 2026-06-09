import { EXBA } from '../core/exba';

export interface StateOptions {
  onUpdate?: (newState: any) => void;
  onPropertyUpdate?: (prop: string, value: any, oldValue: any) => void;
}

function isSameValue(a: any, b: any): boolean {
  if (a === b) return true;
  // Handle NaN deduplication
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  return false;
}

export class ReactiveStateProxy {
  private state: any;
  private options: StateOptions;
  private pendingNotify = new Map<string, any>();
  private flushScheduled = false;

  constructor(initialState: any, options: StateOptions = {}) {
    this.options = options;

    let current = initialState;

    this.state = new Proxy(
      {},
      {
        set: (_target, prop, value) => {
          const oldValue = current[prop as string];
          if (isSameValue(oldValue, value)) return true;

          // Shallow immutable update (no immer needed)
          current = { ...current, [prop as string]: value };

          // Batch notifications via microtask
          this.enqueueNotify(prop as string, value, oldValue);
          return true;
        },
        get: (_target, prop) => {
          return current[prop as string];
        },
      },
    );
  }

  private enqueueNotify(prop: string, value: any, oldValue: any) {
    this.pendingNotify.set(prop, { value, oldValue });

    if (!this.flushScheduled) {
      this.flushScheduled = true;
      queueMicrotask(() => this.flush());
    }
  }

  private flush() {
    this.flushScheduled = false;
    const batch = new Map(this.pendingNotify);
    this.pendingNotify.clear();

    for (const [prop, { value, oldValue }] of batch) {
      EXBA.log('STATE_CHANGE', { prop, oldValue, newValue: value });
      EXBA.notify(prop, value);

      if (this.options.onPropertyUpdate) {
        this.options.onPropertyUpdate(prop, value, oldValue);
      }
    }

    if (this.options.onUpdate) {
      this.options.onUpdate(this.state);
    }
  }

  get value() {
    return this.state;
  }
}
