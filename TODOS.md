# Project TODOs

## Phase 1: Core Infrastructure
- [x] Define shared TypeScript interfaces for WASM exports and imports.
- [x] Implement `MemoryManager` class in TS for robust allocation tracking.
- [x] Implement `malloc`/`free` wrappers in Zig (shared utility for all modules).

## Phase 2: Memory Bridge & Capability System
- [x] Implement `HostBridge` class in TS to act as the capability gatekeeper.
- [x] Update `WasmLoader` to handle memory integration, initialization lifecycle, and capability injection.
- [x] Migrate existing `HostAPI` functions to the new `HostBridge` pattern.

## Phase 3: Declarative Layer
- [ ] Implement `ReactiveStateProxy`: Auto-sync TS state changes to WASM memory.
- [ ] Develop Decorator set (`@Component`, `@State`, `@WasmMethod`).

## Phase 4: Advanced Abstractions & DX
- [ ] Centralize WASM Lifecycle management.
- [ ] Implement `WasmComponent` base class for native Custom Element support.
- [ ] Integration testing for end-to-end component reactivity.
