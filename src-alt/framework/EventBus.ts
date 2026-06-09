type Listener<T = any> = (data: T) => void;
type Unsubscribe = () => void;

/**
 * A lightweight EventBus for decoupled communication between different parts of the application.
 * Supports standard event listening and "once" listeners that trigger only a single time.
 */
export class EventBus {
  private listeners = new Map<string, Set<Listener>>();
  private onceListeners = new Map<string, Set<Listener>>();

  /**
   * Subscribes a listener to a specific event.
   *
   * @param event - The name of the event to listen for.
   * @param listener - Callback function executed when the event is emitted.
   * @returns An unsubscribe function to stop listening to the event.
   */
  on<T>(event: string, listener: Listener<T>): Unsubscribe {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.listeners.get(event)?.delete(listener);
  }

  /**
   * Subscribes a listener to a specific event that will only fire once.
   *
   * @param event - The name of the event to listen for.
   * @param listener - Callback function executed once when the event is first emitted.
   * @returns An unsubscribe function to cancel the one-time listener.
   */
  once<T>(event: string, listener: Listener<T>): Unsubscribe {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(listener);
    return () => this.onceListeners.get(event)?.delete(listener);
  }

  /**
   * Emits an event to all subscribed listeners.
   *
   * @param event - The name of the event to emit.
   * @param data - The payload to pass to the listeners.
   */
  emit<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((fn) => fn(data));
    this.onceListeners.get(event)?.forEach((fn) => fn(data));
    this.onceListeners.delete(event);
  }

  /**
   * Removes all listeners (both standard and one-time) for a specific event.
   *
   * @param event - The name of the event to clear.
   */
  off(event: string): void {
    this.listeners.delete(event);
    this.onceListeners.delete(event);
  }

  /**
   * Completely clears all listeners for all events in the bus.
   */
  clear(): void {
    this.listeners.clear();
    this.onceListeners.clear();
  }

  /**
   * Returns the total number of listeners subscribed to a specific event.
   *
   * @param event - The name of the event.
   * @returns The sum of standard and one-time listeners.
   */
  listenerCount(event: string): number {
    return (
      (this.listeners.get(event)?.size ?? 0) +
      (this.onceListeners.get(event)?.size ?? 0)
    );
  }
}

/**
 * The global instance of the EventBus for application-wide communication.
 */
export const globalBus = new EventBus();
