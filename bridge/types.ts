import type { IRBundle } from '@core/dom/schema';

/**
 * Low-level interface for the communication bridge between TypeScript and WASM.
 */
export interface ExbaBridge {
  /**
   * Calls a method on the bridge.
   * @param method The name of the method to invoke.
   * @param args Arguments to pass to the method.
   * @returns A promise resolving to the method's result.
   */
  call<T>(method: string, ...args: unknown[]): Promise<T>;

  /**
   * Registers a callback for bridge events.
   * @param event The event name to listen for.
   * @param callback Function called when the event occurs.
   */
  on(event: string, callback: (data: unknown) => void): void;
}

/**
 * High-level, type-safe representation of the WASM API.
 */
export interface BridgeAPI {
  /** Adds two numbers in Rust */
  add(a: number, b: number): Promise<number>;
  /** Calculates fibonacci in Rust */
  fibonacci(n: number): Promise<number>;
  /** Triggers a browser greeting from Rust */
  greet(name: string): Promise<void>;
  /** Processes a UI action through the Rust engine */
  process_action(id: string): Promise<IRBundle>;
  /** Processes a raw IR command string in Rust */
  process_ir(json: string): Promise<IRBundle>;
}

/**
 * Creates a type-safe proxy wrapper over the raw bridge.
 * 
 * Allows calling bridge methods as if they were regular async functions:
 * `const result = await api.add(1, 2);`
 * 
 * @param bridge The raw ExbaBridge instance.
 * @returns A type-safe BridgeAPI proxy.
 */
export function createTypedBridge(bridge: ExbaBridge): BridgeAPI {
  return new Proxy({} as BridgeAPI, {
    get(_, method: string) {
      return (...args: unknown[]) => bridge.call(method, ...args);
    },
  });
}
