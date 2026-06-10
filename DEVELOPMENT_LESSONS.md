# EXBA Framework Development Lessons

This document compiles architectural insights, engineering lessons, and debugging discoveries made during the development and stabilization of the EXBA Web Framework.

---

## 1. Third-Party DOM Integration & The Patcher Conflict (`data-persist`)

### The Challenge
EXBA uses a tree-diffing patcher (`syncNodes` in `dom.ts`) to perform updates on component Shadow DOMs. When a component’s state changes, the entire template is re-rendered and reconciled against the existing DOM.
When integrating third-party graph/visualization libraries (like `Cytoscape.js` or `Vis-Network`) that dynamically render canvases, SVGs, or custom sub-trees inside a container:
1. The initial template renders an empty target element: `<div id="vis-container"></div>`.
2. The library mounts its canvas inside this container.
3. Upon state changes, the patcher compares the new empty virtual element (`<div></div>`) against the active DOM element populated with canvas structures.
4. The patcher removes the canvas elements to match the new virtual template, breaking the rendering.

### The Solution
We introduced a `data-persist` attribute check in the DOM patcher:
```typescript
if (!oldNode.hasAttribute('data-persist')) {
  syncNodes(oldNode, Array.from(newNode.childNodes));
}
```
Adding `data-persist` to the graph container instructs the patcher to update attributes but preserve all children, allowing third-party libraries to maintain complete ownership of their sub-trees.

---

## 2. Static Getter Context in Class Inheritance

### The Challenge
EXBA uses a declarative property system where subclasses define observed props statically:
```typescript
class MyComponent extends ExbaComponent {
  static props = { name: 'string', count: 'number' };
}
```
Originally, `ExbaComponent` mapped observed attributes using:
```typescript
static get observedAttributes() {
  return Object.keys(ExbaComponent.props || {});
}
```
This resulted in `observedAttributes` always returning an empty array for subclasses, because it queried `ExbaComponent.props` directly rather than the subclass.

### The Solution
In JavaScript/TypeScript, the `this` context inside a static method or getter refers to the class constructor on which the method was invoked (the subclass). Changing the query to `this.props` resolved the issue:
```typescript
static get observedAttributes() {
  return Object.keys(this.props || {});
}
```
This ensures custom elements properly observe their subclass-defined properties.

---

## 3. String Interpolation Syntax Bugs

### The Challenge
Static style tokens containing theme template placeholders were defined using single quotes:
```typescript
static styles = {
  container: 'color: ${t.zinc100};'
}
```
Single quotes (`'...'`) treat template expressions as literal text, preventing color interpolation and resulting in broken style rules.

### The Solution
Always use backticks (`` `...` ``) for strings containing template placeholders (`${}`) to guarantee execution-time interpolation.

---

## 4. Two-Tier Resilient Fallbacks

### The Challenge
Relying entirely on Rust-WASM core bridges can lead to rendering failures if WASM compilation fails, target targets are missing, or network layers lag.

### The Solution
Always design local client-side fallbacks (e.g. `localStorage` backup mechanisms) inside TypeScript components to ensure the UI remains fully interactive even when WASM-bindgen or compiling targets are unavailable.
