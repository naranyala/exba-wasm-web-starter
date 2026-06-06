import { IRBundleSchema, type LLIR } from './schema';
import { BAEX } from './baex';

export class IRProcessor {
  static process(bundle: any) {
    const result = IRBundleSchema.safeParse(bundle);
    
    if (!result.success) {
      console.error('%c[BAEX IR][VALIDATION_ERROR]', 'color: #ef4444; font-weight: bold;', result.error.format());
      return;
    }

    const validatedBundle = result.data;
    BAEX.log('IR_PIPELINE_START', { version: validatedBundle.version });

    if (validatedBundle.hlir) {
      BAEX.log('IR_HLIR_ANALYSIS', validatedBundle.hlir);
    }

    BAEX.log('IR_LLIR_DISPATCH', validatedBundle.llir);
    validatedBundle.llir.forEach(inst => {
      this.execute(inst);
    });

    BAEX.log('IR_PIPELINE_END', validatedBundle.version);
  }

  private static execute(inst: LLIR) {
    BAEX.log('IR_EXECUTE', inst);
    switch (inst.type) {
      case 'UpdateText':
        const textEl = document.getElementById(inst.id);
        if (textEl) textEl.innerText = inst.text;
        break;
      case 'SetAttribute':
        const attrEl = document.getElementById(inst.id);
        if (attrEl) attrEl.setAttribute(inst.attr, inst.value);
        break;
      case 'TriggerEvent':
        const eventEl = document.getElementById(inst.id);
        if (eventEl) eventEl.dispatchEvent(new CustomEvent(inst.event));
        break;
      case 'Log':
        console.log(`%c[BAEX-LOG] ${inst.message}`, 'color: #a5b4fc');
        break;
      case 'Anomaly':
        console.error(`%c[BAEX-ANOMALY] ${inst.code}: ${inst.details}`, 'background: #ef4444; color: white; padding: 2px 4px; border-radius: 4px;');
        break;
    }
  }
}
