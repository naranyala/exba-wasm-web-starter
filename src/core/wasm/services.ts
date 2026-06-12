import { EXBA } from '@core/lifecycle/exba';

/**
 * Defines the nature of a WASM call.
 * Command: Modifies state in Rust, usually triggers a `pushState` back to TS.
 * Query: Returns data from Rust without modifying state.
 */
export type CallType = 'Command' | 'Query';

/**
 * Standard response wrapper for WASM calls.
 * Mimics Rust's Result<T, E> to ensure consistent error handling.
 */
export type WasmResponse<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
};

/**
 * Base class for WASM-backed services with a typed contract.
 * @template TContract An interface defining the methods and types of the WASM domain.
 */
export abstract class WasmService<TContract> {
  protected abstract moduleName: string;

  /**
   * Executes a WASM call.
   * @param method The method name from the contract.
   * @param type Whether this is a Command or a Query.
   * @param args Arguments to pass to Rust.
   */
  protected async execute<T>(
    method: keyof TContract, 
    type: CallType, 
    ...args: any[]
  ): Promise<WasmResponse<T>> {
    const fullName = `${this.moduleName}_${String(method)}`;
    
    try {
      // We pass the CallType in the arguments so the bridge/middleware can handle it
      const result = await EXBA.callBridge<T>(fullName, { type }, ...args);
      
      if (result && typeof result === 'object' && 'error_code' in result) {
        return {
          ok: false,
          error: {
            code: result.error_code,
            message: result.error_message || 'WASM Execution Error',
            details: result,
          },
        };
      }
      
      return { ok: true, data: result };
    } catch (e: any) {
      return {
        ok: false,
        error: {
          code: 'BRIDGE_EXCEPTION',
          message: e.message || 'Unknown Bridge Error',
          details: e,
        },
      };
    }
  }

  /**
   * Shortcut for Query calls (Fetch data).
   */
  protected async query<T>(method: keyof TContract, ...args: any[]): Promise<WasmResponse<T>> {
    return this.execute<T>(method, 'Query', ...args);
  }

  /**
   * Shortcut for Command calls (Modify state).
   */
  protected async command<T>(method: keyof TContract, ...args: any[]): Promise<WasmResponse<T>> {
    return this.execute<T>(method, 'Command', ...args);
  }
}

import { Domains, type WasmDomain } from '@core/wasm/registry';

/**
 * Example of a typed contract for a Data Engine.
 */
interface IDataEngine {
  search: any[];
  aggregate: any;
  validate: { valid: boolean; errors: string[] };
}

/**
 * Feature-Complete DataService implementation.
 */
export class DataService extends WasmService<IDataEngine> implements WasmDomain {
  name = 'data_engine';

  async searchRecords(query: string, filters: any) {
    const res = await this.call('search', query, filters);
    if (!res.ok) throw new Error(res.error.message);
    return res.data;
  }

  async calculateAggregates(ids: string[]) {
    const res = await this.call('aggregate', ids);
    if (!res.ok) throw new Error(res.error.message);
    return res.data;
  }

  async validateComplexSchema(data: any) {
    const res = await this.call('validate', data);
    return res; // Return the full WasmResponse for the UI to handle errors
  }
}

export const dataService = Domains.register(new DataService());
