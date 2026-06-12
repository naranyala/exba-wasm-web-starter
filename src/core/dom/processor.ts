import { IRBundleSchema, type LLIR } from '@core/dom/schema';
import { EXBA } from '@core/lifecycle/exba';

/** Resolve an element by searching light DOM, then all shadow roots. */
function resolveElement(id: string): HTMLElement | null {
  // Try light DOM first
  const el = document.getElementById(id);
  if (el) return el;

  // Walk all custom elements looking in their shadow roots
  const all = document.querySelectorAll('*');
  for (const node of all) {
    if (node instanceof HTMLElement && node.shadowRoot) {
      const found = node.shadowRoot.getElementById(id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * The core engine for processing IR (Intermediate Representation) bundles.
 *
 * The IRProcessor takes validated bundles from WASM and executes them in the browser.
 * It handles two types of instructions:
 * 1. **HLIR (High-Level IR)**: System-level effects like navigation or state updates.
 * 2. **LLIR (Low-Level IR)**: Direct DOM manipulations like updating text or classes.
 *
 * It also includes a resilient retry mechanism for instructions that target
 * elements not yet present in the DOM (e.g., during async rendering).
 */
export class IRProcessor {
  /** Queue of instructions that failed to execute and are waiting for a retry */
  static pendingInstructions: LLIR[] = [];
  /** Timer ID for the scheduled retry operation */
  static retryTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Entry point for processing a new IR bundle.
   * Performs schema validation before execution.
   * @param bundle The raw IR bundle received from WASM
   */
  static process(bundle: any) {
    const result = IRBundleSchema.safeParse(bundle);

    if (!result.success) {
      console.error(
        '%c[EXBA IR][VALIDATION_ERROR]',
        'color: #ef4444; font-weight: bold;',
        result.error.format(),
      );
      return;
    }

    const validatedBundle = result.data;
    EXBA.log('IR_PIPELINE_START', { version: validatedBundle.version });

    // 1. Process High-Level Effects (HLIR)
    if (validatedBundle.hlir) {
      validatedBundle.hlir.forEach((effect: any) => {
        IRProcessor.executeEffect(effect);
      });
    }

    EXBA.log('IR_LLIR_DISPATCH', validatedBundle.llir);

    // 2. Process Low-Level Instructions (LLIR)
    const failed: LLIR[] = [];
    for (const inst of validatedBundle.llir) {
      const ok = IRProcessor.execute(inst);
      if (!ok) failed.push(inst);
    }

    if (failed.length > 0) {
      IRProcessor.scheduleRetry(failed);
    }

    EXBA.log('IR_PIPELINE_END', validatedBundle.version);
  }

  /**
   * Executes a single high-level effect.
   * HLIR effects impact the application state, routing, or global services.
   * @param effect The HLIR effect object
   */
  private static executeEffect(effect: any) {
    switch (effect.type) {
      case 'UpdateState': {
        (window as any).wasm_update_app_state(effect.payload.patch);
        return;
      }
      case 'Navigate': {
        const router = (window as any).appRouter;
        if (router) router.navigate(effect.payload.path);
        return;
      }
      case 'Notify': {
        console.log(
          `%c[EXBA-NOTIFY] [${effect.payload.level}] ${effect.payload.msg}`,
          'color: #818cf8',
        );
        return;
      }
      case 'InvokeJS': {
        const { func, args } = effect.payload;
        const fn = (window as any)[func];
        if (typeof fn === 'function') {
          const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
          fn(...parsedArgs);
        }
        return;
      }
      case 'SyncData': {
        console.log(`%c[EXBA-SYNC] ${effect.payload.key}`, 'color: #fbbf24');
        return;
      }
    }
  }

  /**
   * Executes a single low-level DOM instruction.
   * Uses `resolveElement` to find targets in both Light DOM and Shadow DOM.
   * @param inst The LLIR instruction object
   * @returns true if execution was successful, false if the target element was not found
   */
  private static execute(inst: LLIR): boolean {
    EXBA.log('IR_EXECUTE', inst);

    switch (inst.type) {
      case 'UpdateText': {
        const el = resolveElement(inst.id);
        if (!el) return false;
        el.textContent = inst.text;
        return true;
      }
      case 'SetAttribute': {
        const el = resolveElement(inst.id);
        if (!el) return false;
        el.setAttribute(inst.attr, inst.value);
        return true;
      }
      case 'RemoveAttribute': {
        const el = resolveElement(inst.id);
        if (!el) return false;
        el.removeAttribute(inst.attr);
        return true;
      }
      case 'AddClass': {
        const el = resolveElement(inst.id);
        if (!el) return false;
        el.classList.add(inst.class);
        return true;
      }
      case 'RemoveClass': {
        const el = resolveElement(inst.id);
        if (!el) return false;
        el.classList.remove(inst.class);
        return true;
      }
      case 'ToggleClass': {
        const el = resolveElement(inst.id);
        if (!el) return false;
        el.classList.toggle(inst.class);
        return true;
      }
      case 'SetStyle': {
        const el = resolveElement(inst.id);
        if (!el) return false;
        (el.style as any)[inst.prop] = inst.value;
        return true;
      }
      case 'TriggerEvent': {
        const el = resolveElement(inst.id);
        if (!el) return false;
        el.dispatchEvent(new CustomEvent(inst.event, { bubbles: true }));
        return true;
      }
      case 'Log':
        console.log(`%c[EXBA-LOG] ${inst.message}`, 'color: #a5b4fc');
        return true;
      case 'Anomaly':
        console.error(
          `%c[EXBA-ANOMALY] ${inst.code}: ${inst.details}`,
          'background: #ef4444; color: white; padding: 2px 4px; border-radius: 4px;',
        );
        return true;
    }
  }

  /**
   * Schedules a retry for instructions that failed due to missing elements.
   * Implements a two-stage retry strategy with backoff.
   * @param failed Array of failed LLIR instructions
   */
  private static scheduleRetry(failed: LLIR[]) {
    IRProcessor.pendingInstructions.push(...failed);

    if (IRProcessor.retryTimer) return;

    IRProcessor.retryTimer = setTimeout(() => {
      IRProcessor.retryTimer = null;
      const batch = IRProcessor.pendingInstructions.splice(0);
      if (batch.length === 0) return;

      EXBA.log('IR_RETRY', { count: batch.length });
      const stillFailed: LLIR[] = [];

      for (const inst of batch) {
        const ok = IRProcessor.execute(inst);
        if (!ok) stillFailed.push(inst);
      }

      if (
        stillFailed.length > 0 &&
        IRProcessor.pendingInstructions.length < 30
      ) {
        IRProcessor.pendingInstructions.push(...stillFailed);
        IRProcessor.retryTimer = setTimeout(() => {
          IRProcessor.retryTimer = null;
          const final = IRProcessor.pendingInstructions.splice(0);
          for (const inst of final) {
            IRProcessor.execute(inst);
          }
        }, 200);
      }
    }, 50);
  }
}
