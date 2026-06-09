type Listener<T> = (value: T) => void;

/**
 * A Signal is a reactive wrapper around a value.
 * It allows multiple listeners to subscribe to changes of the value.
 * When the value is updated, all subscribed listeners are notified automatically.
 */
export class Signal<T> {
  private _value: T;
  private listeners = new Set<Listener<T>>();

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  /**
   * Gets the current value of the signal.
   */
  get value(): T {
    return this._value;
  }

  /**
   * Sets the current value of the signal.
   * If the new value is different from the current one, all listeners are notified.
   */
  set value(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue;
      this.notify();
    }
  }

  /**
   * Subscribes a listener to signal changes.
   * The listener is called immediately with the current value upon subscription.
   *
   * @param listener - A callback function that receives the updated value.
   * @returns An unsubscribe function to stop listening to changes.
   */
  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    listener(this._value);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this._value));
  }
}

/**
 * Factory function to create a new Signal instance.
 *
 * @param initialValue - The starting value of the signal.
 * @returns A new Signal instance.
 */
export function createSignal<T>(initialValue: T) {
  return new Signal(initialValue);
}
