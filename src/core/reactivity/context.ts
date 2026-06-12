/**
 * Context API for EXBA Framework
 * Allows sharing state across the component tree without prop-drilling.
 */

/**
 * Unique identifier for a context provider.
 */
export type ContextKey = string;

/**
 * The data structure held within a context.
 */
export interface ContextValue {
  [key: string]: unknown;
}

const providers = new Map<ContextKey, WeakMap<HTMLElement, unknown>>();

/**
 * Registers an element as a provider for a specific context key.
 *
 * @param element The DOM element that provides the context.
 * @param key The unique key for this context.
 * @param value The value to be shared with children.
 */
export function provideContext<T>(
  element: HTMLElement,
  key: ContextKey,
  value: T,
): void {
  if (!providers.has(key)) {
    providers.set(key, new WeakMap());
  }
  providers.get(key)!.set(element, value);
}

/**
 * Consumes a context value by searching up the DOM tree from the target element.
 *
 * Traverses ancestors until an element registered via `provideContext`
 * with the matching key is found.
 *
 * @param element The starting element for the search.
 * @param key The context key to look for.
 * @returns The found context value, or undefined if no provider exists in the hierarchy.
 */
export function consumeContext<T>(
  element: HTMLElement,
  key: ContextKey,
): T | undefined {
  let current: HTMLElement | null = element;
  while (current) {
    const providerMap = providers.get(key);
    if (providerMap && providerMap.has(current)) {
      return providerMap.get(current) as T;
    }
    current = (current.getRootNode() as any).host || current.parentElement;
  }
  return undefined;
}

/**
 * A declarative Web Component wrapper that provides context to its children.
 *
 * Usage:
 * `<exba-context-provider key="user" value='{"name": "Alice"}'>...</exba-context-provider>`
 */
export class ContextProvider extends HTMLElement {
  static props = {
    value: { type: Object, default: {} },
    key: { type: String, required: true },
  };

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const key = this.getAttribute('key') || 'default';
    const value = JSON.parse(this.getAttribute('value') || '{}');
    provideContext(this, key, value);

    // Render slot for children
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = '<slot></slot>';
    }
  }
}

customElements.define('exba-context-provider', ContextProvider);

// Legacy export for compatibility
export const Context = {
  provide: provideContext,
  consume: consumeContext,
};
