import { EXBA } from '@core/lifecycle/exba';

/**
 * Represents the available execution tiers for the framework.
 * - 'wasm': High-performance execution in WebAssembly.
 * - 'ts': Safe fallback execution in TypeScript.
 */
export type EngineTier = 'wasm' | 'ts';

/**
 * Health status of the framework's core engine.
 */
export type EngineStatus = 'healthy' | 'degraded' | 'recovering' | 'failed';

/**
 * Manages the health and availability of the WebAssembly core engine.
 * 
 * Implements a circuit-breaker style mechanism:
 * 1. Monitors WASM call successes and failures.
 * 2. If failures exceed a threshold (`MAX_FAILURES`), the engine is marked as 'failed'.
 * 3. The framework automatically falls back to the TypeScript execution tier.
 * 4. Periodically attempts recovery to restore WASM functionality.
 */
export class ResilienceManager {
  private static status: EngineStatus = 'healthy';
  private static failureCount = 0;
  private static MAX_FAILURES = 3;
  private static recoveryTimer: any = null;

  /**
   * Manual override to force the framework into TS fallback mode.
   * Useful for debugging UI and state logic without WASM interference.
   */
  public static DEBUG_FORCE_FALLBACK = false;

  /**
   * Returns the current health status of the WASM engine.
   */
  static getStatus(): EngineStatus {
    return ResilienceManager.status;
  }

  /**
   * Determines the currently active execution tier based on engine health.
   * @returns 'wasm' if healthy or recovering, 'ts' if failed or forced.
   */
  static getActiveTier(): EngineTier {
    if (ResilienceManager.DEBUG_FORCE_FALLBACK) return 'ts';
    return ResilienceManager.status === 'healthy' ||
      ResilienceManager.status === 'recovering'
      ? 'wasm'
      : 'ts';
  }

  /**
   * Reports a successful WASM operation.
   * Resets the failure count and may transition the engine from 'recovering' to 'healthy'.
   */
  static reportSuccess() {
    ResilienceManager.failureCount = 0;
    if (ResilienceManager.status === 'recovering') {
      ResilienceManager.status = 'healthy';
      EXBA.log('RESILIENCE', 'WASM Engine fully recovered');
    }
  }

  /**
   * Reports a failed WASM operation.
   * Increments the failure count and triggers fallback if the threshold is reached.
   * @param reason Optional error message or object.
   */
  static reportFailure(reason?: any) {
    ResilienceManager.failureCount++;
    EXBA.log(
      'RESILIENCE',
      `WASM Call failed (${ResilienceManager.failureCount}/${ResilienceManager.MAX_FAILURES}): ${reason}`,
    );

    if (
      ResilienceManager.failureCount >= ResilienceManager.MAX_FAILURES &&
      ResilienceManager.status !== 'failed'
    ) {
      ResilienceManager.status = 'failed';
      EXBA.log(
        'RESILIENCE_ALERT',
        'CRITICAL: WASM engine failed. Switching to TS fallback tier.',
      );
      ResilienceManager.attemptRecovery();
    }
  }

  /**
   * Internal method to schedule a recovery attempt after a failure.
   */
  private static attemptRecovery() {
    if (ResilienceManager.recoveryTimer) return;

    ResilienceManager.recoveryTimer = setTimeout(async () => {
      ResilienceManager.status = 'recovering';
      EXBA.log('RESILIENCE', 'Attempting WASM engine re-initialization...');

      try {
        // Here we would trigger re-init logic
        ResilienceManager.recoveryTimer = null;
      } catch (e) {
        ResilienceManager.status = 'failed';
        ResilienceManager.recoveryTimer = null;
        ResilienceManager.attemptRecovery(); // Backoff
      }
    }, 5000); // 5s backoff
  }

  /**
   * Quick check to see if WASM can be used for the next operation.
   * @returns true if the module is loaded and status is not 'failed'.
   */
  static isWasmHealthy(): boolean {
    if (ResilienceManager.DEBUG_FORCE_FALLBACK) return false;
    return EXBA.wasmModule !== null && ResilienceManager.status !== 'failed';
  }
}
