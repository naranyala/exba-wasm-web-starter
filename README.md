# Custom WASM-Oriented Web Framework

![bee-holding-axe](./bee-holding-axe.png)

A high-performance web framework bridging native browser Custom Elements with computational logic written in Rust.

## Architecture

- **Host (TypeScript)**: Manages DOM lifecycle, event handling, and renders UI via Custom Elements.
- **Provider (Rust/WASM)**: High-performance business logic, state management, and data transformations, compiled to WASM.
- **Styling**: CSS-in-JS using `goober` for modular, performant styles, with `clsx` for dynamic class management.

## Feature List

- **Native Custom Elements**: Framework-agnostic UI components based on standard Web Components.
- **Rust WASM Integration**: Seamless bidirectional communication between TypeScript and Rust.
- **CSS-in-JS Styling**: Performant, scoped styling with `goober`.
- **Lightweight Core**: Minimal overhead with no dependency on heavy virtual DOM libraries.

## Upcoming Features (In-Development)

- **Declarative Bindings**: Introduce decorators like `@Component`, `@State`, and `@WasmMethod` to simplify TS-Rust bindings.
- **WASM-Based Router**: Moving route management logic into Rust for faster page transitions.
- **Enhanced Bridge**: Type-safe automated serialization/deserialization of complex data structures between Rust and TypeScript.
- **Server-Side Rendering (SSR)**: Experimental support for hydrating Rust-managed state on the server.

## Setup

Install the dependencies:

```bash
npm install
```

## Get started

Start the dev server:

```bash
npm run dev
```

Build the app for production:

```bash
npm run build
```
