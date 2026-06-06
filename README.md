# BAEX Framework

BAEX is a high-performance web framework that bridges native browser Custom Elements with computational logic written in Rust via a stratified Intermediate Representation (IR).

## Core Architecture

The framework utilizes a decoupled architecture to ensure stability and performance:

### 1. Stratified Intermediate Representation (IR)
Instead of direct DOM manipulation from WASM, BAEX uses two layers of IR:
- High-Level IR (HLIR): Defines the intent of an action (e.g., UIUpdate, SystemNotification).
- Low-Level IR (LLIR): Defines concrete browser mutations (e.g., UpdateText, SetAttribute, TriggerEvent).

This allows the business logic to remain agnostic of the final rendering implementation.

### 2. Reactive State Model
BAEX implements a reactive state system using a Proxy-based approach:
- Immutable State: Leverages Immer to ensure state transitions are predictable.
- Subscription Model: Components can subscribe to specific state keys and automatically re-render when those values change.
- Automatic IR Dispatch: State changes can automatically trigger IR bundles to synchronize the UI.

### 3. Component System
Built on native Web Components:
- BaexComponent: A base class that provides built-in state subscription and WASM bridge access.
- Decorators: Provides @Component, @State, and @WasmMethod for improved developer experience.

## Technical Stack

- Frontend: TypeScript, Rsbuild, Tailwind CSS
- Backend: Rust, wasm-bindgen, serde
- State: Immer, Zod (for IR validation)
- Testing: Vitest

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
