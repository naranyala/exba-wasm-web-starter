# EXBA -- Extended Browser API

![x-sword-humanoid-bee](./x-sword-humanoid-bee.png)

A browser-native framework for building web applications with WASM-powered computation, structured intermediate representation, and signal-based reactivity. No virtual DOM. No framework runtime. Just the platform, extended.

---

## Table of Contents

- [Philosophy](#philosophy)
- [What EXBA Is](#what-exba-is)
- [Architecture](#architecture)
- [The IR Pipeline](#the-ir-pipeline)
- [Key Modules](#key-modules)
- [Project Structure](#project-structure)
- [Development](#development)
- [Tech Stack](#tech-stack)
- [Project Status](#project-status)

---

## Philosophy

### The Browser Is the Platform

Modern web development has accumulated layers of abstraction that distance developers from the browser's native capabilities. Virtual DOMs, compilers, and framework-specific runtimes sit between the developer and the DOM. These tools solve real problems, but they also introduce complexity, bundle size, and a perpetual dependency on the framework's release cycle.

EXBA starts from a different premise: the browser already provides everything needed to build interactive applications. Custom Elements give you components with lifecycle hooks. Shadow DOM gives you style encapsulation. The DOM API gives you direct mutation. WebAssembly gives you near-native computation. The question is not whether the browser is capable, but whether the surrounding architecture is designed to use those capabilities effectively.

### Computation Belongs in WASM, Rendering Belongs in the Browser

There is a natural boundary between what should be computed and what should be rendered. EXBA draws this line explicitly. Business logic, data transformation, algorithmic computation, and state transitions are the domain of WebAssembly. The browser handles layout, painting, user interaction, and visual feedback.

This separation is not merely an optimization. It is a structural decision that shapes the entire framework. When computation moves to WASM, it becomes portable, testable, and independent of the JavaScript event loop. When rendering stays in the browser, it benefits from the platform's native optimizations for layout, compositing, and accessibility.

### Intermediate Representation as a Contract

The bridge between WASM and the browser is not a loose collection of function calls. It is a structured Intermediate Representation. When WASM produces a result, it returns an IRBundle -- a validated, versioned package of instructions that describe exactly what the browser should do.

This IR has two layers:

- **HLIR (High-Level IR)** describes intent. A screen should update. A notification should appear. A navigation should occur. These are semantic instructions that describe what changed, not how to change it.

- **LLIR (Low-Level IR)** describes action. Set this element's text. Change that attribute. Dispatch this event. These are atomic DOM operations that the processor executes in order.

The IR pipeline means that WASM never touches the DOM directly. It produces a description of what should happen. The browser-side processor executes that description. This creates a clear contract between two runtimes that speak different languages.

### Signals Without Ceremony

Reactivity in EXBA is based on signals, not on component lifecycle hooks. When state changes, all subscribers are notified. Components that depend on a piece of state re-render. Components that do not, do not. There are no dependency arrays to maintain, no effect cleanup functions to remember, and no stale closure problems.

The signal system uses JavaScript's Proxy to intercept property access and mutation. When a property is set, the change is batched via microtask and dispatched to all subscribers in a single flush. This means multiple property changes in the same synchronous block produce one re-render, not five.

### Error Boundaries Are Not Optional

A component that crashes takes down the entire application. EXBA treats error boundaries as a first-class concern. Every component that extends ExbaComponent gets a safe update wrapper. If render() throws, the component shows a fallback message instead of propagating the error. The rest of the application continues to function.

This is not a feature you opt into. It is the default behavior of the base class. The framework assumes that things will go wrong and provides the infrastructure to recover gracefully.

### Shadow DOM Is Not a Limitation, It Is a Feature

Many frameworks treat Shadow DOM as an obstacle to work around. EXBA treats it as a structural advantage. Shadow DOM provides style encapsulation by default. It prevents CSS leakage between components. It creates a clear boundary between a component's internal structure and the outside world.

The IR processor is aware of Shadow DOM. When it needs to find an element by ID, it searches light DOM first, then walks all shadow roots. This means WASM can target any element in the application by ID, regardless of where it lives in the component tree. The encapsulation of Shadow DOM is preserved without sacrificing the ability to coordinate across components.

---

## What EXBA Is

EXBA is three things combined:

1. **Browser-native web components.** Custom elements with Shadow DOM, lifecycle hooks, and CSS encapsulation. No virtual DOM diffing. No framework-specific template syntax. Just standard Web Components extended with a structured base class.

2. **WASM module integration with an IR pipeline.** Computation-heavy logic runs in WebAssembly. The results flow back to the browser as structured IR instructions. A processor validates and executes those instructions against the DOM. The two runtimes communicate through a typed bridge with a clear contract.

3. **Signal-based reactivity.** State changes propagate to subscribed components automatically. The Proxy-based signal system batches updates via microtask, deduplicates identical values, and notifies only the components that care about a given piece of state.

---

## Architecture

```
+-------------------------------------------------------------+
|                       Browser DOM                            |
|                                                              |
|  +-----------+  +-----------+  +---------------+             |
|  | <tab-bar> |  | <sidebar> |  | <status-bar>  |             |
|  | (Shadow)  |  | (Light)   |  |   (Shadow)    |             |
|  +-----+-----+  +-----+-----+  +-------+-------+             |
|        |               |                |                      |
|  +-----+---------------+----------------+-------+             |
|  |              ExbaComponent (base)            |             |
|  |   shadow DOM . render() . safeUpdate()       |             |
|  +---------------------+------------------------+             |
|                        |                                      |
|  +---------------------+------------------------+             |
|  |           ReactiveStateProxy (signals)        |             |
|  |   Proxy . microtask batching . subscribe()    |             |
|  +---------------------+------------------------+             |
|                        |                                      |
|  +---------------------+------------------------+             |
|  |              ExbaBridge (WASM bridge)         |             |
|  |   call(method, ...args) . on(event, cb)       |             |
|  +---------------------+------------------------+             |
|                        |                                      |
|  +---------------------+------------------------+             |
|  |           WebAssembly Module (Rust)            |             |
|  |   greet . process_action . add . fibonacci     |             |
|  +------------------------------------------------+            |
+-------------------------------------------------------------+
```

### Data Flow

1. User interacts with a web component (click, input, keyboard event).
2. Component calls `ExbaBridge.call(method, ...args)` through the EXBA singleton.
3. The bridge dispatches to the corresponding WASM function.
4. WASM executes the computation and returns an `IRBundle` (or a direct value for simple operations like `add`).
5. `IRProcessor` validates the bundle against the Zod schema, then executes each LLIR instruction in order.
6. DOM mutations are applied via `resolveElement()`, which searches light DOM and all shadow roots.
7. State changes trigger `EXBA.notify()` which dispatches to all subscribers, causing component re-renders.

### The IR Pipeline

The IR pipeline is the central architectural pattern of EXBA. It solves the problem of how two fundamentally different runtimes (WASM and the browser) can communicate without one directly manipulating the other's domain.

**Why an IR?** Direct function calls from WASM to the DOM would couple the WASM module to the browser's DOM structure. WASM would need to know element IDs, attribute names, and event types. This makes WASM untestable outside a browser, and it makes the DOM structure a compile-time dependency of the WASM module.

The IR breaks this coupling. WASM produces a description of what should change. The browser-side processor decides how to apply those changes. The WASM module can be tested by inspecting its IR output without ever touching a DOM. The processor can be tested by feeding it synthetic IR bundles without loading WASM.

**IRBundle structure:**

```typescript
interface IRBundle {
  version: string;         // Schema version for forward compatibility
  hlir: HLIR | null;       // High-level intent (optional)
  llir: LLIR[];            // Low-level DOM operations (required)
}
```

**HLIR types (intent):**

| Type | Fields | Purpose |
|------|--------|---------|
| `UIUpdate` | `target_screen`, `state` | Declares that a screen's state should change |
| `SystemNotification` | `level`, `msg` | Requests a system-level notification |
| `ExternalLink` | `url`, `target` | Requests navigation to an external URL |

**LLIR types (action):**

| Type | Fields | Purpose |
|------|--------|---------|
| `UpdateText` | `id`, `text` | Sets the textContent of an element |
| `SetAttribute` | `id`, `attr`, `value` | Sets an attribute on an element |
| `TriggerEvent` | `id`, `event` | Dispatches a CustomEvent on an element |
| `Log` | `message` | Logs a message to the browser console |
| `Anomaly` | `code`, `details` | Reports an error condition with a code |

**Retry queue:** When an LLIR instruction targets an element that does not yet exist in the DOM (e.g., because a component has not finished rendering), the instruction is queued and retried. The processor makes up to 3 attempts at 50ms and 200ms intervals before dropping the instruction. This handles the race condition between asynchronous WASM execution and DOM rendering without requiring explicit synchronization.

**Validation:** Every IR bundle is validated against a Zod schema before execution. Invalid bundles are rejected with a formatted error. This means WASM bugs that produce malformed IR are caught at the boundary, not silently applied to the DOM.

---

## Key Modules

| Module | Path | Purpose |
|--------|------|---------|
| `EXBA` | `src/core/exba.ts` | Central singleton. Holds the WASM bridge reference, manages subscriptions, emits events, logs IR pipeline activity. The coordination point for the entire framework. |
| `ExbaComponent` | `src/core/component.ts` | Abstract base class for all web components. Provides Shadow DOM attachment, a `render()` contract, `safeUpdate()` error boundary, `subscribeToState()` for reactive updates, and automatic cleanup on disconnect. |
| `IRProcessor` | `src/core/processor.ts` | Validates and executes IR bundles. Resolves elements across light DOM and shadow roots. Manages a retry queue for instructions targeting elements that are not yet rendered. |
| `ExbaBridge` | `src/bridge/types.ts` | Interface defining the bridge contract: `call<T>(method, ...args)` for invoking WASM functions, and `on(event, callback)` for WASM-to-JS event channel. |
| `bridge/manager` | `src/bridge/manager.ts` | Sets up the bridge by initializing WASM and mapping TypeScript method calls to WASM exports via a dynamic dispatch switch. |
| `ReactiveStateProxy` | `src/state/proxy.ts` | Proxy-based signal system. Intercepts property sets, deduplicates identical values (including NaN), batches notifications via microtask, and dispatches to subscribers. |
| `IR Schemas` | `src/core/schema.ts` | Zod schemas for HLIR, LLIR, and IRBundle. Also contains the `escapeHtml()` XSS protection utility. |
| `Styles` | `src/styles.ts` | Centralized Goober CSS-in-JS classes. ~60 named exports covering layout, components, buttons, inputs, and utility classes. All styles use a shared design token system. |

---

## Project Structure

```
baex-web-wasm-goobercss/
  src/
    core/
      exba.ts              # Central singleton
      component.ts         # ExbaComponent base class
      processor.ts         # IR processor with retry queue
      schema.ts            # Zod schemas + escapeHtml
    bridge/
      manager.ts           # WASM bridge setup + dynamic dispatch
      types.ts             # ExbaBridge interface
    state/
      proxy.ts             # ReactiveStateProxy (signals)
    components/
      tab-bar/             # Shadow DOM tab bar component
      status-bar/          # Shadow DOM status bar component
      modal/               # WASM modal overlay component
      exba-greeting/       # Example greeting component
    app/
      constants.ts         # Menu items + WASM action definitions
      utils.ts             # updateResult, fuzzySearch, toggleSection
      view-grid.ts         # Main layout (sidebar + content)
    styles.ts              # Goober CSS classes (design tokens + ~60 exports)
    main.ts                # Bootstrap, error handling, event wiring
    style.css              # Global reset + body styles
  wasm-src/
    src/
      lib.rs               # WASM entry point (greet, add, fibonacci, process_action, process_ir)
      ir.rs                # IR type definitions (HLIR, LLIR, IRBundle, IRCommand, IRResult)
      actions.rs           # Action registry (maps action IDs to IR bundles)
    Cargo.toml
  public/
    wasm/                  # wasm-pack output (generated)
  index.html
  rsbuild.config.ts
  vitest.config.ts
  biome.json
```

---

## Development

### Prerequisites

- [Bun](https://bun.sh/) (package manager and runtime)
- [Rust](https://rustup.rs/) with the `wasm32-unknown-unknown` target
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)

### Commands

```bash
# Install dependencies
bun install

# Start dev server (browser-only, no WASM compilation)
bun run dev

# Build for production (compiles WASM + bundles with Rsbuild)
bun run build

# Preview production build locally
bun run preview

# Run tests (vitest with jsdom)
bun run test

# Lint and auto-fix (Biome)
bun run check

# Format code (Biome)
bun run format

# Generate API documentation
bun run docs:gen

# Serve generated documentation
bun run docs:serve
```

### Build Pipeline

The build process has two stages:

1. **WASM compilation:** `wasm-pack build --target web --out-dir ../public/wasm` compiles the Rust source in `wasm-src/` to a WebAssembly module. The output includes the `.wasm` binary and JavaScript glue code (`wasm_logic.js`).

2. **Application bundling:** Rsbuild bundles the TypeScript source, resolves imports, and produces the final distributable in `dist/`. The WASM module is copied as a static asset.

---

## Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Language | TypeScript | Component logic, state management, IR processing, bridge communication |
| Components | Web Components (Custom Elements v1) | Browser-native component model with Shadow DOM |
| Styling | Goober | CSS-in-JS with co-located styles and design tokens |
| State | Proxy-based signals | Reactive state with microtask batching and deduplication |
| Validation | Zod | Runtime schema validation for IR bundles |
| WASM | Rust via wasm-pack | Computation, IR generation, action registry |
| Tracing | tracing + tracing-wasm | Structured logging in Rust with browser console output |
| Build | Rsbuild + wasm-pack | TypeScript bundling and WASM compilation |
| Linting | Biome | Code quality, formatting, import organization |
| Testing | Vitest + jsdom | Unit tests with DOM simulation |

---

## Project Status

EXBA is in active development. Phase 1 (BAEX to EXBA rename, documentation) is complete. Phase 2 (WASM integration, signal reactivity, web component improvements, code quality, error handling) is substantially complete. Phase 3 (accessibility, TypeScript vs WASM evaluation, advanced features) is planned.

See [TODOS.md](./TODOS.md) for the detailed development roadmap and current progress.
