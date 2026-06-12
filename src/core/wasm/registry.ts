import { EXBA } from '@core/lifecycle/exba';

/**
 * Interface for a WASM-backed domain service.
 */
export interface WasmDomain {
  name: string;
  init?(): Promise<void>;
  dispose?(): Promise<void>;
}

/**
 * Registry that manages all WASM Domain Services.
 * This ensures that services are singletons and easily accessible.
 */
class DomainRegistry {
  private domains = new Map<string, WasmDomain>();

  /**
   * Registers a domain service.
   */
  register<T extends WasmDomain>(domain: T): T {
    this.domains.set(domain.name, domain);
    return domain;
  }

  /**
   * Retrieves a registered domain service.
   */
  get<T extends WasmDomain>(name: string): T {
    const domain = this.domains.get(name);
    if (!domain) {
      throw new Error(`WASM Domain "${name}" not found in registry.`);
    }
    return domain as T;
  }

  /**
   * Initializes all registered domains.
   */
  async initAll() {
    const initPromises = Array.from(this.domains.values())
      .filter(d => d.init)
      .map(d => d.init!());
    await Promise.all(initPromises);
  }

  /**
   * Disposes all registered domains.
   */
  async disposeAll() {
    const disposePromises = Array.from(this.domains.values())
      .filter(d => d.dispose)
      .map(d => d.dispose!());
    await Promise.all(disposePromises);
  }
}

export const Domains = new DomainRegistry();
