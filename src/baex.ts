import { z } from 'zod';

/**
 * BAEX Framework Core
 * A lightweight bridge between Rust WASM and Custom Elements
 */

export const HLIRSchema = z.union([
  z.object({ type: z.literal('UIUpdate'), target_screen: z.string(), state: z.string() }),
  z.object({ type: z.literal('SystemNotification'), level: z.string(), msg: z.string() }),
  z.object({ type: z.literal('ExternalLink'), url: z.string(), target: z.string() }),
]);

export const LLIRSchema = z.union([
  z.object({ type: z.literal('UpdateText'), id: z.string(), text: z.string() }),
  z.object({ type: z.literal('SetAttribute'), id: z.string(), attr: z.string(), value: z.string() }),
  z.object({ type: z.literal('TriggerEvent'), id: z.string(), event: z.string() }),
  z.object({ type: z.literal('Log'), message: z.string() }),
  z.object({ type: z.literal('Anomaly'), code: z.string(), details: z.string() }),
]);

export const IRBundleSchema = z.object({
  version: z.string(),
  hlir: HLIRSchema.nullable(),
  llir: z.array(LLIRSchema),
});

export type HLIR = z.infer<typeof HLIRSchema>;
export type LLIR = z.infer<typeof LLIRSchema>;
export interface IRBundle {
  version: string;
  hlir: HLIR | null;
  llir: LLIR[];
}

export interface BaexBridge {
  call<T>(method: string, ...args: any[]): Promise<T>;
  on(event: string, callback: (data: any) => void): void;
}

// =============================================================================
// BAEX FRAMEWORK RULES:
// 1. ALL mutations MUST go through the IRProcessor.
// 2. ANOMALIES are treated as critical interrupts and logged with high priority.
// 3. VERSIONING: The processor must check IRBundle.version for compatibility.
// =============================================================================

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

// Decorators
export function Component(tagName: string) {
  return function (constructor: Function) {
    BAEX.register(tagName, constructor as any);
  };
}

export function State(target: any, propertyKey: string) {
  BAEX.log('DECORATOR_STATE', { propertyKey });
}

export function WasmMethod(methodName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      BAEX.log('WASM_METHOD_INVOKE', { methodName, args });
      return BAEX.callBridge(methodName, ...args);
    };
    return descriptor;
  };
}

export class BAEX {
  static bridge: BaexBridge | null = null;
  static DEBUG = true;
  static wasmModule: any = null;
  static subscriptions = new Map<string, Set<(val: any) => void>>();

  static log(phase: string, message: any) {
    if (this.DEBUG) {
      console.log(`%c[BAEX IR][${phase}]`, 'color: #818cf8; font-weight: bold;', message);
    }
  }

  static subscribe(key: string, callback: (val: any) => void) {
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(callback);
    return () => this.subscriptions.get(key)?.delete(callback);
  }

  static notify(key: string, value: any) {
    this.subscriptions.get(key)?.forEach(cb => cb(value));
  }

  static async initWasm(initFn: any) {
    this.log('WASM_INIT_START', {});
    try {
      this.wasmModule = await initFn();
      this.log('WASM_INIT_SUCCESS', { module: this.wasmModule });
    } catch (e) {
      this.log('WASM_INIT_ERROR', e);
      throw e;
    }
  }

  static setBridge(bridge: BaexBridge) {
    this.bridge = bridge;
  }

  static register(tagName: string, componentClass: new () => HTMLElement) {
    if (!customElements.get(tagName)) {
      customElements.define(tagName, componentClass);
    }
  }

  static async callBridge<T>(method: string, ...args: any[]): Promise<T> {
    if (!this.bridge) {
      throw new Error('BAEX Bridge not initialized');
    }
    this.log('BRIDGE_CALL', { method, args });
    const result = await this.bridge.call<T>(method, ...args);
    this.log('BRIDGE_RESPONSE', result);
    return result;
  }

  static dispatchIR(bundle: IRBundle) {
    IRProcessor.process(bundle);
  }
}

export abstract class BaexComponent extends HTMLElement {
  protected activeSubscriptions: Array<() => void> = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  abstract render(): string;

  connectedCallback() {
    this.update();
  }

  disconnectedCallback() {
    this.activeSubscriptions.forEach(unsub => unsub());
    this.activeSubscriptions = [];
  }

  attributeChangedCallback() {
    this.update();
  }

  update() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.render();
    }
  }

  protected subscribeToState(key: string, callback: (val: any) => void) {
    const unsub = BAEX.subscribe(key, (val) => {
      callback(val);
      this.update();
    });
    this.activeSubscriptions.push(unsub);
  }

  protected async callWasm<T>(method: string, ...args: any[]): Promise<T> {
    return BAEX.callBridge<T>(method, ...args);
  }
}
