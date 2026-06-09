import { globalBus } from './EventBus';
import { createReactiveState } from './ReactiveState';
import { createSignal, type Signal } from './Signal';

/**
 * Defines lifecycle hooks that can be registered for a BAEX component.
 */
export interface LifecycleHooks<C extends HTMLElement> {
  /** Called when the component is first added to the DOM. */
  onMount?: (instance: C) => void;
  /** Called whenever the component's state changes and a re-render occurs. */
  onUpdate?: (instance: C) => void;
  /** Called when the component is removed from the DOM. */
  onDestroy?: (instance: C) => void;
  /** Called when one of the observed attributes is changed. */
  onAttributeChange?: (
    instance: C,
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) => void;
}

/**
 * Configuration for a BAEX component.
 */
export interface ComponentConfig<S extends object> {
  /** The custom element name (e.g., 'baex-button'). */
  name: string;
  /** The initial reactive state of the component. */
  initialState: S;
  /** The render function that produces HTML based on the current state. */
  render: (state: S, helpers: ComponentHelpers<S>) => string;
  /** Optional reducer function for handling state updates via dispatch. */
  reducer?: (state: S, action: any) => S;
  /** Optional lifecycle hooks for the component. */
  hooks?: LifecycleHooks;
  /** List of attribute names that should trigger onAttributeChange. */
  observedAttributes?: string[];
}

/**
 * Helper methods provided to the render function to interact with the component.
 */
export interface ComponentHelpers<S> {
  /** Updates the component state. Can be a partial state or a reducer-like function. */
  setState: (update: Partial<S> | ((prev: S) => S)) => void;
  /** Dispatches an action to the component's reducer. */
  dispatch: (action: any) => void;
  /** Emits a custom event via the global EventBus. */
  emit: <T>(event: string, data: T) => void;
  /** Subscribes to an event via the global EventBus. */
  on: <T>(event: string, listener: (data: T) => void) => () => void;
}

/**
 * Registers a new custom element as a BAEX component.
 *
 * @param config - The configuration for the component including its name, state, and render logic.
 */
export function defineComponent<S extends object>(config: ComponentConfig<S>) {
  const { name, initialState, render, hooks, observedAttributes } = config;

  customElements.define(
    name,
    class extends HTMLElement {
      private state: S;
      private signals = new Map<string, Signal<any>>();
      private shadow: ShadowRoot;
      private unmountListeners: (() => void)[] = [];
      private _mounted = false;

      static get observedAttributes() {
        return observedAttributes ?? [];
      }

      constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });

        // Initialize state with deep reactivity and signal integration
        this.state = this.createDeepReactiveState(initialState);

        // Define helpers first
        this.helpers = {
          setState: (update: Partial<S> | ((prev: S) => S)) => {
            const nextState =
              typeof update === 'function'
                ? (update as (prev: S) => S)(this.state)
                : update;

            Object.assign(this.state, nextState);
            this.update();
          },
          dispatch: (action: any) => {
            if (config.reducer) {
              const nextState = config.reducer(this.state, action);
              Object.assign(this.state, nextState);
              this.update();
            } else {
              console.warn(
                `[BAEX] Component ${name} received dispatch but has no reducer.`,
              );
            }
          },
          emit: this.emit,
          on: this.on,
        };

        // Expose helpers on the instance for access in hooks
        (this as any).setState = this.helpers.setState;
        (this as any).dispatch = this.helpers.dispatch;
      }

      private createDeepReactiveState(obj: any, path: string = ''): any {
        if (obj === null || typeof obj !== 'object') return obj;

        const signalsMap: any = {};
        const proxy = new Proxy(obj, {
          get: (target, prop) => {
            const key = prop as string;
            const currentPath = path ? `${path}.${key}` : key;
            const value = Reflect.get(target, prop);

            if (value !== null && typeof value === 'object') {
              return this.createDeepReactiveState(value, currentPath);
            }
            return value;
          },
          set: (target, prop, value) => {
            const key = prop as string;
            const currentPath = path ? `${path}.${key}` : key;

            // Ensure a signal exists for this path
            if (!this.signals.has(currentPath)) {
              this.signals.set(currentPath, createSignal(value));
            }

            this.signals.get(currentPath)!.value = value;
            return Reflect.set(target, prop, value);
          },
        });

        // Pre-populate signals for initial state
        for (const key in obj) {
          const currentPath = path ? `${path}.${key}` : key;
          const val = obj[key];
          if (val !== null && typeof val === 'object') {
            this.createDeepReactiveState(val, currentPath);
          } else {
            this.signals.set(currentPath, createSignal(val));
          }
        }

        return proxy;
      }

      connectedCallback() {
        this._mounted = true;
        this.update();
        hooks?.onMount?.(this);
      }

      disconnectedCallback() {
        this._mounted = false;
        hooks?.onDestroy?.(this);
        this.unmountListeners.forEach((fn) => fn());
        this.unmountListeners = [];
      }

      attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null,
      ) {
        hooks?.onAttributeChange?.(this, name, oldValue, newValue);
      }

      private emit = <T>(event: string, data: T) => {
        globalBus.emit(`${this.localName}:${event}`, data);
      };

      private on = <T>(event: string, listener: (data: T) => void) => {
        const unsub = globalBus.on(event, listener);
        this.unmountListeners.push(unsub);
        return unsub;
      };

      private helpers: ComponentHelpers<S> = this.helpers;

      /**
       * Triggers a re-render of the component by executing the render function
       * and updating the shadow DOM.
       */
      update() {
        const html = render(this.state, this.helpers);
        if (this.shadow.innerHTML !== html) {
          this.shadow.innerHTML = html;
          this.bindSignals();
          if (this._mounted) {
            hooks?.onUpdate?.(this);
          }
        }
      }

      private bindSignals() {
        const bindings = this.shadow.querySelectorAll('[data-bind]');
        bindings.forEach((el) => {
          const path = el.getAttribute('data-bind');
          if (path) {
            const sig = this.signals.get(path);
            if (sig) {
              const unsub = sig.subscribe((val) => {
                el.textContent = String(val);
              });
              this.unmountListeners.push(unsub);
            }
          }
        });
      }

      /**
       * Returns the current reactive state of the component.
       */
      getComponentState(): S {
        return this.state;
      }
    },
  );
}
