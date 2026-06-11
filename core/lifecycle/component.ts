import { Context } from '@core/reactivity/context';
import { patch, type TemplateResult } from '@core/dom/dom';
import { EXBA } from '@core/lifecycle/exba';
import { effect, untrack, signal, flushQueue } from '@core/reactivity';

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
  [key: string]: 'string' | 'number' | 'boolean' | 'json';
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
  protected state: ComponentState = {};
  
  private renderEffectDispose: (() => void) | null = null;
  private _updateTrigger = signal(0);

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
  }

  /**
   * Standard Web Component callback to determine which attributes to observe.
   * Derived automatically from the static `props` definition.
   */
  static get observedAttributes() {
    return Object.keys(this.props || {});
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

    const propType = (this.constructor as typeof ExbaComponent).props[name];
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
          try {
            value = JSON.parse(newValue || 'null');
          } catch {
            value = null;
          }
          break;
      }
    }

    this.setState({ [name]: value });
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
      }
    }

    if (changed.length === 0) return;

    this.state = { ...this.state, ...newState };
    this._updateTrigger.value++;
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
        ? (this.getRootNode() as ShadowRoot).querySelector(`slot[name="${name}"]`)
        : null;
    return slot ? slot.innerHTML : '';
  }

  private setupRenderEffect() {
    if (this.renderEffectDispose) return;

    const root = this.shadowRoot || this;
    if (!root) return;

    this.renderEffectDispose = effect(() => {
      // Depend on updateTrigger for manual updates
      this._updateTrigger.value;

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
    this._updateTrigger.value++;
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
  protected useSignal<T>(initialValue: T, key?: string) {
    return EXBA.createSignal(initialValue, key);
  }
}
