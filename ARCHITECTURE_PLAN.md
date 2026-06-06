# Pivot Plan: Rust-Powered Custom Element Framework

## 1. Goal
Create a lightweight, high-performance UI framework using native Web Components (Custom Elements) where the business logic and state management are handled by Rust-compiled WASM modules.

## 2. Architecture
- **Host (TypeScript):** Provides standard Custom Element infrastructure and a secure "Bridge" to expose browser capabilities to Rust.
- **Provider (Rust/WASM):** Contains core logic, state objects, and DOM-transformation directives. Compiled to WASM.
- **Bridge:** A shared memory interface for passing state (JSON serialized or structured data) between TypeScript and Rust.

## 3. Migration Steps
1. **Clean:** Remove Zig-related files and build scripts.
2. **Setup:** Initialize a Rust project (`cargo init --lib`) within a new `wasm-src` directory.
3. **Core:** Develop a `Component` base class in TS that handles `observedAttributes` and life-cycle methods, communicating with Rust via the bridge.
4. **Logic:** Implement core Rust logic to manipulate component state.
