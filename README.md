# BAEX Framework

<!-- ![bee-holding-axe](./bee-holding-axe.jpg) -->

<img src="./bee-holding-axe.jpg" width="30%" align="center">

BAEX is a high-performance web framework that bridges native browser Custom Elements with computational logic written in Rust via a unified Intermediate Representation (IR).

## Core Architecture

BAEX is structured in layered tiers to separate UI declaration, state reactivity, and heavy computational logic.

### 1. UI Layer (Web Components)
The framework leverages native **Custom Elements** to ensure browser compatibility and encapsulation.
- **`defineComponent`**: A factory that wraps the `HTMLElement` lifecycle.
- **Shadow DOM**: Every component uses an isolated Shadow Root for styling and DOM containment.
- **Lifecycle Management**: Integrated hooks for `onMount`, `onUpdate`, `onDestroy`, and `onAttributeChange`.

### 2. Reactivity Layer (Signals & Proxies)
State management is handled via a hybrid Signal-Proxy system:
- **Reactive State**: Components use a Proxy-wrapped state. Mutating state automatically triggers associated signals.
- **Fine-grained Bindings**: The `data-bind` attribute allows specific DOM elements to subscribe to signals, minimizing the need for full re-renders.
- **Functional Reducers**: Supports optional reducer patterns for predictable state transitions.

### 3. Communication Layer (EventBus)
To avoid "prop drilling" and tight coupling between disparate components:
- **Global EventBus**: A typed publish-subscribe system allows components to communicate asynchronously.
- **Scoped Events**: Events can be namespaced to specific components (e.g., `component-name:event-name`).

### 4. Logic Bridge (Rust/WASM IR)
Computational heavy lifting is offloaded to Rust via a high-performance bridge:
- **Unified IR**: Communication happens through an Intermediate Representation (IR), ensuring type safety across the JS/WASM boundary.
- **Command-Result Pattern**: TypeScript dispatches `IRCommand` and receives `IRResult`, auto-generated from Rust source via `ts-rs`.
- **WasmBridge**: A functional wrapper that handles serialization and error mapping.

### 5. Templating Layer
A lightweight runtime compiler transforms templates into executable JavaScript:
- **Dynamic Interpolation**: `{{value}}` tags are converted into reactive bindings.
- **Expression Evaluation**: Supports basic logic markers (e.g., `{{#condition}}`) to control rendering.
- **Caching**: Compiled templates are cached to avoid redundant parsing.

## How It Works: The Data Flow

1. **Definition**: You define a component via `defineComponent`, providing an `initialState` and a `render` function.
2. **Initialization**: Upon mounting, BAEX creates a **Reactive Proxy** of the state. Each property in the state is linked to a **Signal**.
3. **Rendering**:
   - The `render` function generates an HTML string.
   - The `TemplateCompiler` replaces `{{var}}` with `<span data-bind="var"></span>`.
   - The result is injected into the Shadow DOM via `innerHTML`.
4. **Binding**: The framework scans the newly injected DOM for `data-bind` attributes and connects those elements directly to the corresponding **Signals**.
5. **Reactive Loop**:
   - When `setState` or a `reducer` modifies the state, the Proxy triggers the Signal.
   - The Signal notifies only the specific DOM elements bound to that variable, updating their `textContent` without re-rendering the entire component.
6. **WASM Integration**: For complex logic, the component calls `WasmBridge.call()`. The request is serialized to JSON, processed by Rust, and the result is returned to the JS state, triggering the reactive loop.

## Potential Flaws & Technical Debt

While high-performance, the current architecture has several known limitations:

### 🚩 Performance Bottlenecks
- **DOM Thrashing**: The current `update()` method uses `innerHTML` for full renders. This destroys DOM state (e.g., input focus, cursor position) and is computationally expensive.
- **Serialization Overhead**: Every call to Rust goes through `JSON.stringify` and `JSON.parse`, which becomes a bottleneck for high-frequency data exchange.
- **Linear Scanning**: `bindSignals()` performs a `querySelectorAll` on every full update, which scales poorly with complex DOM trees.

### 🚩 Security Concerns
- **XSS Risk**: The `TemplateCompiler` uses `new Function()` to execute compiled templates. If template strings are sourced from user-provided content, this is a critical vulnerability.
- **Injection**: `innerHTML` usage in the render cycle requires strict sanitization of state variables to prevent HTML injection.

### 🚩 Developer Experience (DX)
- **Runtime Compilation**: Templates are compiled in the browser. This increases initial load time and prevents build-time optimizations (like minification of template logic).
- **Manual Cleanup**: While the framework handles `unmountListeners`, complex event subscriptions to the `EventBus` still require careful lifecycle management to avoid memory leaks.

## Technical Stack

- **Frontend**: TypeScript, Rsbuild, goober (CSS-in-JS)
- **Backend**: Rust, wasm-bindgen, serde, ts-rs
- **State**: Reactive Proxies / Signals
- **Testing**: Vitest

## Setup

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Run the test suite:
```bash
npm run test
```
