import { patch, type TemplateResult } from '@core/dom/dom';
import { EXBA } from '@core/lifecycle/exba';
import { effect, flushQueue, signal, untrack, memo, type Signal, type Memo } from '@core/reactivity';
import { Context } from '@core/reactivity/context';
import { reactive } from '@core/reactivity/proxy';

/**
 * Configuration for a component defined via `defineComponent`.
 */
export interface ComponentConfig {
  tagName: string;
  props?: ComponentProps;
  styles?: Record<string, string> | string;
  useShadow?: boolean;
  render: (this: ExbaComponent) => string | TemplateResult;
  onMount?: (this: ExbaComponent) => void;
  onUpdate?: (this: ExbaComponent, changedProps: string[]) => void;
  onUnmount?: (this: ExbaComponent) => void;
}

/**
 * Represents the internal reactive state of a component.
 */
export interface ComponentState {
  [key: string]: any;
}

/**
 * Defines the property types for automatic attribute-to-prop conversion.
 */
export interface ComponentProps {
  [key: string]:
    | 'string'
    | 'number'
    | 'boolean'
    | 'json'
    | 'object'
    | 'function'
    | 'any';
}

/**
 * Base class for all EXBA Web Components.
 *
 * Provides reactive state management, lifecycle hooks, Shadow DOM support,
 * scoped styling, and easy integration with the WASM bridge.
 *
 * @extends HTMLElement
 */
export abstract class ExbaComponent extends HTMLElement {
  /** Array of unsubscription functions to be called when the component is unmounted */
  protected activeSubscriptions: Array<() => void> = [];
  /** Internal reactive state object */
  protected state: ComponentState = reactive({});

  private renderEffectDispose: (() => void) | null = null;

  /**
   * Define the properties the component should observe.
   * Attributes with these names will be automatically synchronized with component state.
   * Example: static props = { count: 'number', name: 'string' };
   */
  static props: ComponentProps = {};

  /**
   * Define the scoped styles for the component as an object or a raw CSS string.
   * If an object is provided, keys are class names and values are CSS rules.
   * Example: static styles = { container: 'padding: 1rem; color: red;' };
   */
  static styles: Record<string, string> | string = {};

  /**
   * Define if the component should use Shadow DOM.
   * Defaults to true. If false, the component renders directly into its innerHTML.
   */
  static useShadow = true;

  constructor() {
    super();
    if ((this.constructor as typeof ExbaComponent).useShadow) {
      this.attachShadow({ mode: 'open' });
    }

    // Define reactive getters and setters for declared properties
    const props = (this.constructor as typeof ExbaComponent).props || {};
    for (const key of Object.keys(props)) {
      if (!(key in this)) {
        Object.defineProperty(this, key, {
          get: () => {
            return this.state[key];
          },
          set: (val: any) => {
            this.setState({ [key]: val });
          },
          configurable: true,
          enumerable: true,
        });
      }
    }
  }

  /**
   * Standard Web Component callback to determine which attributes to observe.
   * Derived automatically from the static `props` definition.
   */
  static get observedAttributes() {
    return Object.keys((this as any).props || {});
  }

  /**
   * Standard Web Component callback for attribute changes.
   * Performs automatic type conversion based on the static `props` definition.
   */
  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if (oldValue === newValue) return;

    const props = (this.constructor as typeof ExbaComponent).props || {};
    const realPropName =
      Object.keys(props).find((k) => k.toLowerCase() === name.toLowerCase()) ||
      name;
    const propType = props[realPropName];
    let value: any = newValue;

    if (propType) {
      switch (propType) {
        case 'number':
          value = Number(newValue);
          break;
        case 'boolean':
          value = newValue === 'true' || newValue === '';
          break;
        case 'json':
        case 'object':
          try {
            value =
              typeof newValue === 'string'
                ? JSON.parse(newValue || 'null')
                : newValue;
          } catch {
            value = null;
          }
          break;
        case 'function':
        case 'any':
          value = newValue;
          break;
      }
    }

    this.setState({ [realPropName]: value });
  }

  /**
   * The core rendering method. Must be implemented by subclasses.
   * Should return a string of HTML or a TemplateResult (from `html` tag).
   */
  abstract render(): string | TemplateResult;

  /**
   * Called when the component is first inserted into the DOM.
   * Ideal for initializing data fetching or starting timers.
   */
  protected onMount(): void {}

  /**
   * Called whenever the component state changes.
   * @param changedProps Array of property keys that were modified
   */
  protected onUpdate(_changedProps: string[]): void {}

  /**
   * Called just before the component is removed from the DOM.
   * Ideal for clearing timers or manual event listeners.
   */
  protected onUnmount(): void {}

  /**
   * Standard Web Component callback for when the element enters the DOM.
   */
  connectedCallback() {
    this.setupRenderEffect();
    this.onMount();
  }

  /**
   * Standard Web Component callback for when the element leaves the DOM.
   */
  disconnectedCallback() {
    this.onUnmount();
    this.cleanup();
  }

  /**
   * Automatically unsubscribes from all reactive signals and effects.
   */
  private cleanup() {
    if (this.renderEffectDispose) {
      this.renderEffectDispose();
      this.renderEffectDispose = null;
    }
    this.activeSubscriptions.forEach((unsub) => unsub());
    this.activeSubscriptions = [];
  }

  /**
   * Updates the component state and triggers an efficient DOM re-render.
   * Only re-renders if the state has actually changed.
   * @param newState Partial state object containing keys to update
   */
  setState(newState: Partial<ComponentState>) {
    const changed: string[] = [];
    for (const key in newState) {
      if (this.state[key] !== newState[key]) {
        changed.push(key);
        this.state[key] = newState[key];
      }
    }

    if (changed.length === 0) return;

    flushQueue();
    this.onUpdate(changed);
  }

  /**
   * Registers a reactive effect that is automatically cleaned up on unmount.
   * @param key The signal key to watch
   * @param callback Function to call when the signal changes
   * @returns Unsubscription function
   */
  protected createEffect(key: string, callback: (val: any) => void) {
    const unsub = EXBA.subscribe(key, (val) => {
      callback(val);
    });
    this.activeSubscriptions.push(unsub);
    return unsub;
  }

  /**
   * Emits a custom DOM event from the component.
   * @param eventName Name of the event
   * @param detail Optional payload for the event
   */
  protected emit(eventName: string, detail?: any) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Access values from a Context Provider higher up the component tree.
   * @param contextId Unique ID of the context to consume
   * @returns The current context value, or null if not found
   */
  protected useContext<T>(contextId: string): T | null {
    return Context.consume<T>(this, contextId) || null;
  }

  /**
   * Accesses the content of a named slot.
   * @param name Slot name (defaults to 'default')
   */
  protected slot(name: string = 'default'): string {
    const slot =
      this.getRootNode() instanceof ShadowRoot
        ? (this.getRootNode() as ShadowRoot).querySelector(
            `slot[name="${name}"]`,
          )
        : null;
    return slot ? slot.innerHTML : '';
  }

  private setupRenderEffect() {
    if (this.renderEffectDispose) return;

    const root = this.shadowRoot || this;
    if (!root) return;

    this.renderEffectDispose = effect(() => {
      console.log(`[EXBA] Rendering <${this.tagName.toLowerCase()}>`);
      try {
        const htmlOutput = this.render();

        // Generate style block from styles object or string
        const stylesObj = (this.constructor as typeof ExbaComponent).styles;
        let styleContent = '';
        if (typeof stylesObj === 'string') {
          styleContent = stylesObj;
        } else if (stylesObj) {
          styleContent = Object.entries(stylesObj)
            .map(([cls, rules]) => `.${cls} { ${rules} }`)
            .join('\n');
        }
        const styleTag = styleContent ? `<style>${styleContent}</style>` : '';

        let finalOutput: string | TemplateResult;
        if (typeof htmlOutput === 'string') {
          finalOutput = `${styleTag}${htmlOutput}`;
        } else {
          const newStrings = [...htmlOutput.strings] as any;
          newStrings[0] = styleTag + newStrings[0];
          finalOutput = { ...htmlOutput, strings: newStrings };
        }

        untrack(() => {
          patch(root, finalOutput).catch((e) => {
            console.error(
              `[EXBA] Render error in <${this.tagName.toLowerCase()}>:`,
              e,
            );
            root.innerHTML = `
              <div style="padding: 0.5rem; color: #ef4444; font-size: 0.8125rem; font-family: monospace;">
                Render error: ${e instanceof Error ? e.message : String(e)}
              </div>
            `;
          });
        });
      } catch (e) {
        console.error(
          `[EXBA] Render error in <${this.tagName.toLowerCase()}>:`,
          e,
        );
        root.innerHTML = `
          <div style="padding: 0.5rem; color: #ef4444; font-size: 0.8125rem; font-family: monospace;">
            Render error: ${e instanceof Error ? e.message : String(e)}
          </div>
        `;
      }
    });
  }

  private safeUpdate() {
    // No-op: state is now reactive
  }

  /**
   * Helper to automatically sync a global signal key to local component state.
   * @param key The signal key to subscribe to
   */
  protected subscribeToState(key: string) {
    const unsub = EXBA.subscribe(key, (val) => {
      this.setState({ [key]: val });
    });
    this.activeSubscriptions.push(unsub);
  }

  /**
   * Async helper to call a method on the WASM bridge.
   * @param method Name of the Rust function to call
   * @param args Arguments to pass
   */
  protected async callWasm<T>(method: string, ...args: any[]): Promise<T> {
    return EXBA.callBridge<T>(method, ...args);
  }

  // ─── Functional Hooks ──────────────────────────────────────

  /**
   * Creates a reactive signal that is scoped to this component's lifecycle.
   * Changes to this signal will trigger a component update.
   * @param initialValue Starting value
   * @param key Optional unique key
   */
  protected useSignal<T>(initialValue: T, key?: string): Signal<T> {
    return EXBA.createSignal(initialValue, key);
  }

  /**
   * Creates a derived reactive value that is cached and only recomputes when dependencies change.
   * @param fn Computation function
   */
  protected useMemo<T>(fn: () => T): Memo<T> {
    return memo(fn);
  }

  /**
   * Creates an auto-tracking effect that runs whenever its dependencies change.
   * The effect is automatically cleaned up when the component is unmounted.
   * @param fn Effect function
   */
  protected useEffect(fn: (onCleanup: (cleanupFn: () => void) => void) => void) {
    const dispose = effect(fn);
    this.activeSubscriptions.push(dispose);
    return dispose;
  }
}

/**
 * Functionally defines and registers a new ExbaComponent.
 * 
 * This serves as a decorator-free alternative to extending ExbaComponent.
 * 
 * @param config Component configuration
 * @returns The created component class
 */
export function defineComponent(config: ComponentConfig) {
  class Component extends ExbaComponent {
    static props = config.props || {};
    static styles = config.styles || {};
    static useShadow = config.useShadow ?? true;

    render() {
      return config.render.call(this);
    }

    protected onMount() {
      config.onMount?.call(this);
    }

    protected onUpdate(changedProps: string[]) {
      config.onUpdate?.call(this, changedProps);
    }

    protected onUnmount() {
      config.onUnmount?.call(this);
    }
  }

  if (!customElements.get(config.tagName)) {
    customElements.define(config.tagName, Component);
  }

  return Component;
}
