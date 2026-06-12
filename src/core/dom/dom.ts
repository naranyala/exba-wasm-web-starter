import { EXBA } from '@core/lifecycle/exba';
import { ResilienceManager } from '@core/lifecycle/resilience';

/**
 * The resulting structure of an `html` tagged template literal.
 * Contains static strings and dynamic interpolated values.
 */
export interface TemplateResult {
  /** The static parts of the template */
  strings: TemplateStringsArray;
  /** The dynamic values to be inserted into the template */
  values: any[];
}

/**
 * Tagged template literal for creating reactive HTML templates.
 *
 * Example: `html"<div>Hello ${name}</div>"`
 *
 * @param strings Static segments of the template.
 * @param values Dynamic expressions.
 * @returns A TemplateResult object.
 */
export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): TemplateResult {
  return { strings, values };
}

/**
 * Efficiently updates a DOM container to match a new template or HTML string.
 *
 * Implements a two-tier strategy:
 * 1. **Primary (WASM)**: High-performance diffing performed in Rust (if available).
 * 2. **Fallback (TS)**: Virtual-to-Real DOM synchronization performed in TypeScript.
 *
 * The algorithm performs granular updates to text content, attributes, and classes
 * rather than replacing entire elements.
 *
 * @param container The DOM element or ShadowRoot to update.
 * @param template The new HTML string or TemplateResult to apply.
 */
export async function patch(
  container: HTMLElement | ShadowRoot,
  template: string | TemplateResult,
) {
  const flatValues: any[] = [];
  const htmlString =
    typeof template === 'string'
      ? template
      : renderTemplate(template, flatValues);

  // --- Tier 1: WASM Implementation ---
  if (ResilienceManager.getActiveTier() === 'wasm' && EXBA.bridge) {
    try {
      const oldHtml = container.innerHTML;
      const response = await EXBA.api.process_ir(
        JSON.stringify({
          type: 'PerformDiff',
          payload: { old_html: oldHtml, new_html: htmlString },
        }),
      );
      if (response && response.type === 'DiffResult') {
        applyDomInstructions(container, response.payload);
        ResilienceManager.reportSuccess();
        if (typeof template !== 'string') {
          bindEvents(container, flatValues);
        }
        return; // Success! Skip Tier 2 fallback.
      }
    } catch (e) {
      ResilienceManager.reportFailure(e);
      // Fallback to Tier 2 is automatic
    }
  }

  // --- Tier 2: TS Fallback (Current Implementation) ---
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const newNodes = [
    ...Array.from(doc.head.childNodes),
    ...Array.from(doc.body.childNodes),
  ];

  syncNodes(container, newNodes);

  // Bind event listeners if we have template values
  if (typeof template !== 'string') {
    bindEvents(container, flatValues);
  }
}

function renderTemplate(result: TemplateResult, flatValues: any[]): string {
  return result.strings.reduce((acc, str, i) => {
    const val = result.values[i];
    let valStr = '';

    if (val === undefined || val === null) {
      valStr = '';
    } else {
      // 1. Check if this is a property binding (e.g. .items=)
      const propMatch = str.match(/\.([a-zA-Z0-9_-]+)\s*=\s*['"]?$/i);
      if (propMatch) {
        const propName = propMatch[1];
        const cleanStr = str.replace(/\.([a-zA-Z0-9_-]+)\s*=\s*['"]?$/i, '');
        const targetIndex = flatValues.length;
        flatValues.push(val);
        valStr = `data-exba-prop-${propName}="${targetIndex}"`;
        return acc + cleanStr + valStr;
      }

      // 2. Check if this is an event handler attribute (e.g. onclick= or @click=)
      const eventMatch = str.match(/(?:on|@)([a-zA-Z0-9_-]+)\s*=\s*['"]?$/i);
      if (eventMatch) {
        const eventName = eventMatch[1].toLowerCase();
        const cleanStr = str.replace(
          /(?:on|@)[a-zA-Z0-9_-]+\s*=\s*['"]?$/i,
          '',
        );
        const targetIndex = flatValues.length;
        flatValues.push(val);
        valStr = `data-exba-evt-${eventName}="${targetIndex}"`;
        return acc + cleanStr + valStr;
      }

      // 3. Handle TemplateResult directly (nested template)
      if (
        val &&
        typeof val === 'object' &&
        'strings' in val &&
        'values' in val
      ) {
        valStr = renderTemplate(val, flatValues);
      }
      // 4. Handle Array (which may contain TemplateResults or primitives)
      else if (Array.isArray(val)) {
        valStr = val
          .map((item) => {
            if (
              item &&
              typeof item === 'object' &&
              'strings' in item &&
              'values' in item
            ) {
              return renderTemplate(item, flatValues);
            }
            return String(item);
          })
          .join('');
      } else if (typeof val === 'function') {
        valStr = String(val);
      } else {
        valStr = String(val);
      }
    }

    return acc + str + valStr;
  }, '');
}

function findCaseInsensitiveProp(el: HTMLElement, propName: string): string {
  const lowerName = propName.toLowerCase();
  let current = el;
  while (current && current !== HTMLElement.prototype) {
    const keys = Object.getOwnPropertyNames(current);
    for (const key of keys) {
      if (key.toLowerCase() === lowerName) {
        return key;
      }
    }
    current = Object.getPrototypeOf(current);
  }
  // Fallback to static props if it's an ExbaComponent
  const compClass = el.constructor as any;
  if (compClass && compClass.props) {
    const key = Object.keys(compClass.props).find(
      (k) => k.toLowerCase() === lowerName,
    );
    if (key) return key;
  }
  return propName;
}

function bindEvents(parent: HTMLElement | ShadowRoot, values: any[]) {
  const elements =
    parent instanceof ShadowRoot
      ? parent.querySelectorAll('*')
      : [parent, ...Array.from(parent.querySelectorAll('*'))];

  for (const el of elements) {
    if (!(el instanceof HTMLElement)) continue;

    const attrNames = el.getAttributeNames();
    for (const attr of attrNames) {
      // Event bindings
      if (attr.startsWith('data-exba-evt-')) {
        const eventName = attr.substring('data-exba-evt-'.length);
        const valIndex = Number.parseInt(el.getAttribute(attr) || '', 10);
        const handler = values[valIndex];

        if (typeof handler === 'function') {
          const existingHandlers = (el as any)._exba_handlers || {};
          if (existingHandlers[eventName]) {
            el.removeEventListener(eventName, existingHandlers[eventName]);
          }

          el.addEventListener(eventName, handler);
          existingHandlers[eventName] = handler;
          (el as any)._exba_handlers = existingHandlers;
        }
        el.removeAttribute(attr);
      }
      // Property bindings
      else if (attr.startsWith('data-exba-prop-')) {
        const propName = attr.substring('data-exba-prop-'.length);
        const valIndex = Number.parseInt(el.getAttribute(attr) || '', 10);
        const val = values[valIndex];

        const realPropName = findCaseInsensitiveProp(el, propName);
        (el as any)[realPropName] = val;
        el.removeAttribute(attr);
      }
    }
  }
}

function syncNodes(parent: HTMLElement | ShadowRoot, newNodes: Node[]) {
  const oldNodes = Array.from(parent.childNodes);

  // Fallback to index-based diffing if no nodes have keys
  const hasKeys = newNodes.some(
    (n) => n instanceof HTMLElement && n.hasAttribute('key'),
  );

  if (!hasKeys) {
    const max = Math.max(newNodes.length, oldNodes.length);

    for (let i = 0; i < max; i++) {
      const oldNode = oldNodes[i];
      const newNode = newNodes[i];

      // 1. If no old node, append the new one
      if (!oldNode) {
        if (newNode) parent.appendChild(newNode.cloneNode(true));
        continue;
      }

      // 2. If no new node, remove the old one
      if (!newNode) {
        parent.removeChild(oldNode);
        continue;
      }

      // 3. If nodes are incompatible types or tags, replace entirely
      if (
        oldNode.nodeType !== newNode.nodeType ||
        oldNode.nodeName !== newNode.nodeName
      ) {
        parent.replaceChild(newNode.cloneNode(true), oldNode);
        continue;
      }

      // 4. Handle text nodes
      if (oldNode.nodeType === Node.TEXT_NODE) {
        if (oldNode.textContent !== newNode.textContent) {
          oldNode.textContent = newNode.textContent || '';
        }
        continue;
      }

      // 5. Handle element nodes
      if (oldNode instanceof HTMLElement && newNode instanceof HTMLElement) {
        updateAttributes(oldNode, newNode);
        if (!oldNode.hasAttribute('data-persist')) {
          syncNodes(oldNode, Array.from(newNode.childNodes));
        }
      }
    }
    return;
  }

  // --- Keyed Reconciliation ---
  const oldKeyedMap = new Map<string, Node>();
  const oldUnkeyed: Node[] = [];

  for (const node of oldNodes) {
    if (node instanceof HTMLElement && node.hasAttribute('key')) {
      oldKeyedMap.set(node.getAttribute('key')!, node);
    } else {
      oldUnkeyed.push(node);
    }
  }

  let unkeyedIndex = 0;
  for (let i = 0; i < newNodes.length; i++) {
    const newNode = newNodes[i];
    let matchedNode: Node | null = null;

    if (newNode instanceof HTMLElement && newNode.hasAttribute('key')) {
      const key = newNode.getAttribute('key')!;
      if (oldKeyedMap.has(key)) {
        matchedNode = oldKeyedMap.get(key)!;
        oldKeyedMap.delete(key);
      }
    } else if (unkeyedIndex < oldUnkeyed.length) {
      matchedNode = oldUnkeyed[unkeyedIndex++];
    }

    if (matchedNode) {
      if (
        matchedNode.nodeType === newNode.nodeType &&
        matchedNode.nodeName === newNode.nodeName
      ) {
        if (matchedNode.nodeType === Node.TEXT_NODE) {
          if (matchedNode.textContent !== newNode.textContent) {
            matchedNode.textContent = newNode.textContent || '';
          }
        } else if (
          matchedNode instanceof HTMLElement &&
          newNode instanceof HTMLElement
        ) {
          updateAttributes(matchedNode, newNode);
          if (!matchedNode.hasAttribute('data-persist')) {
            syncNodes(matchedNode, Array.from(newNode.childNodes));
          }
        }
      } else {
        matchedNode = newNode.cloneNode(true);
      }
    } else {
      matchedNode = newNode.cloneNode(true);
    }

    const currentAtPos = parent.childNodes[i];
    if (currentAtPos !== matchedNode) {
      if (currentAtPos) {
        parent.insertBefore(matchedNode, currentAtPos);
      } else {
        parent.appendChild(matchedNode);
      }
    }
  }

  for (const node of oldKeyedMap.values()) {
    parent.removeChild(node);
  }

  while (unkeyedIndex < oldUnkeyed.length) {
    parent.removeChild(oldUnkeyed[unkeyedIndex++]);
  }
}

function updateAttributes(oldEl: HTMLElement, newEl: HTMLElement) {
  const oldAttrs = oldEl.getAttributeNames();
  const newAttrs = newEl.getAttributeNames();

  // Remove stale attributes
  for (const attr of oldAttrs) {
    if (!newAttrs.includes(attr)) {
      oldEl.removeAttribute(attr);
    }
  }

  // Update changed attributes
  for (const attr of newAttrs) {
    const newVal = newEl.getAttribute(attr);
    if (oldEl.getAttribute(attr) !== newVal) {
      oldEl.setAttribute(attr, newVal || '');
    }
  }

  // Handle value property for inputs/textareas
  if (
    (oldEl instanceof HTMLInputElement ||
      oldEl instanceof HTMLTextAreaElement) &&
    (newEl instanceof HTMLInputElement || newEl instanceof HTMLTextAreaElement)
  ) {
    if (oldEl.value !== newEl.value) {
      oldEl.value = newEl.value;
    }
  }
}

function applyDomInstructions(
  container: HTMLElement | ShadowRoot,
  instructions: any[],
) {
  const createdNodes = new Map<string, Node>();

  const findNode = (path: string): Node => {
    if (createdNodes.has(path)) {
      return createdNodes.get(path)!;
    }
    return findNodeByPath(container, path);
  };

  for (const inst of instructions) {
    const type = inst.type;
    const payload = inst.payload;

    switch (type) {
      case 'CreateElement': {
        const { id, tag } = payload;
        let node: Node;
        if (tag === '#text') {
          node = document.createTextNode('');
        } else {
          node = document.createElement(tag);
        }
        createdNodes.set(id, node);
        break;
      }
      case 'SetAttribute': {
        const { id, attr, value } = payload;
        const el = findNode(id);
        if (el instanceof HTMLElement) {
          el.setAttribute(attr, value);
        }
        break;
      }
      case 'RemoveAttribute': {
        const { id, attr } = payload;
        const el = findNode(id);
        if (el instanceof HTMLElement) {
          el.removeAttribute(attr);
        }
        break;
      }
      case 'SetText': {
        const { id, text } = payload;
        const el = findNode(id);
        el.textContent = text;
        break;
      }
      case 'AppendChild': {
        const { parent_id, child_id } = payload;
        const parent = findNode(parent_id);
        const child = findNode(child_id);
        parent.appendChild(child);
        break;
      }
      case 'RemoveChild': {
        const { parent_id, child_id } = payload;
        const parent = findNode(parent_id);
        const child = findNode(child_id);
        parent.removeChild(child);
        break;
      }
      case 'ReplaceChild': {
        const { parent_id, old_id, new_id } = payload;
        const parent = findNode(parent_id);
        const oldChild = findNode(old_id);
        const newChild = findNode(new_id);
        parent.replaceChild(newChild, oldChild);
        break;
      }
    }
  }
}

function findNodeByPath(root: HTMLElement | ShadowRoot, path: string): Node {
  if (path === '') return root;
  const parts = path.split('/').map(Number);
  let current: Node = root;
  for (const idx of parts) {
    if (!current.childNodes[idx]) {
      throw new Error(`Node not found at index-path: ${path} at step: ${idx}`);
    }
    current = current.childNodes[idx];
  }
  return current;
}
