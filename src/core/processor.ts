import { EXBA } from './exba';
import { IRBundleSchema, type LLIR } from './schema';

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

export class IRProcessor {
  private static pendingInstructions: LLIR[] = [];
  private static retryTimer: ReturnType<typeof setTimeout> | null = null;

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

    if (validatedBundle.hlir) {
      EXBA.log('IR_HLIR_ANALYSIS', validatedBundle.hlir);
    }

    EXBA.log('IR_LLIR_DISPATCH', validatedBundle.llir);

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

      // Give up after 3 retries (instructions accumulate across retries)
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
