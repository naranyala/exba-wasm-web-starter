# EXBA Framework

EXBA is a high-performance, WebAssembly-first web framework designed to bridge Rust-powered business logic with a reactive TypeScript frontend. It is optimized for applications requiring complex state transitions, heavy computation, and surgical UI updates.

## Architecture: Two-Tier Execution Model

EXBA utilizes a dual-tier execution model to balance native performance with browser flexibility:

1. **Tier 1: Rust-WASM Core (The Brain)**:
   - Manages the canonical state and core business rules.
   - Generates Intermediate Representation (IR) bundles for DOM mutations.
   - Performs computationally intensive tree diffing and data processing.

2. **Tier 2: TypeScript Shell (The Interface)**:
   - Reactive components with surgical DOM updates via a tree-diffing patcher.
   - Type-safe proxy bridge for zero-configuration WebAssembly method calls.
   - Resilient fallback logic (such as local storage state caching) to maintain reactivity if the WebAssembly engine is unavailable.

### Third-Party DOM Persistence

The framework's virtual DOM patcher supports the `data-persist` attribute. When applied to container elements, it instructs the patcher to preserve dynamically injected sub-trees. This allows seamless integration of third-party libraries (such as Cytoscape.js and Vis-Network) without their DOM states being overwritten during component state updates.

## Key Features

- **Surgical Reactivity**: Signal-based state management with automatic dependency tracking, computed states, and batching.
- **Unified Component Pattern**: Class-based Web Components with static property declarations and scoped, auto-injected style objects.
- **WASM Bridge**: Direct execution of Rust methods via `EXBA.api.methodName(...)`.
- **Tagged Templates**: Structured templates compiled via the `html` tagged literal for efficient DOM patching.
- **Robust Persistence**: Built-in persistence layers for application sessions, navigation, and user data.

## Getting Started

### Installation

Install dependencies using your preferred package manager:

```bash
bun install
```

### Development Workflow

Build the WebAssembly module and start the development server:

```bash
bun run build
bun run dev
```

### Verification

Run the integration and core test suite:

```bash
bun run test
```

## Technical Stack

- **Core**: Rust (wasm-bindgen, serde)
- **Frontend**: TypeScript, Custom Web Components
- **Styling**: Unified Goober-based design tokens
- **Build System**: Rsbuild / Rspack
- **Test Suite**: Vitest (integration and unit testing)

## Code Example: Reactive Component

The following example demonstrates a custom component with static properties, scoped styles, and lifecycle hooks:

```typescript
import { ExbaComponent, html } from '../framework';

export class MyCounter extends ExbaComponent {
  // Define observed properties
  static props = { initial: 'number' };

  // Define scoped stylesheet rules
  static styles = {
    container: 'padding: 1rem; border: 1px solid var(--exba-border);',
    btn: 'background: var(--exba-primary); color: white; border-radius: 0.5rem; padding: 0.5rem 1rem;'
  };

  protected onMount() {
    this.count = this.useSignal(this.state.initial || 0);
  }

  render() {
    return html`
      <div class="container">
        <h3>Count: ${this.count.value}</h3>
        <button class="btn" onclick="this.getRootNode().host.count.value++">
          Increment
        </button>
      </div>
    `;
  }
}
```

## Component Library

The repository contains pre-built reactive component demonstrations:

- **Kanban Board**: Drag-and-drop task workflow with local storage persistence and card editing capability.
- **Mindmap (Cytoscape.js)**: Interactive graph visualization utilizing the COSE layout physics engine with dynamic node addition and image export.
- **Mindmap (Vis-Network)**: Interactive spring physics simulator with canvas export capabilities.
- **Monthly Date Picker**: Month-by-month calendar view with quick presets and date selection.
- **Activity Feed**: Signal-driven event tracking component logging system changes.
- **Web Neofetch**: Hardware and operating system metrics collector.
- **UI Primitives**: Accordions, Drawers, and Tab Bars with persistent state selectors.
