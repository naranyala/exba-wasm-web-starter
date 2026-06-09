# EXBA Development Roadmap

## Phase 1 — Foundation ✅

> Rename BAEX → EXBA, establish project documentation, clean up naming.

- [x] Rename `src/core/baex.ts` → `src/core/exba.ts`
- [x] Rename `src/baex.test.ts` → `src/exba.test.ts`
- [x] Rename `src/components/baex-greeting/` → `src/components/exba-greeting/`
- [x] Rename class `BAEX` → `EXBA`
- [x] Rename interface `BaexBridge` → `ExbaBridge`
- [x] Rename class `BaexComponent` → `ExbaComponent`
- [x] Rename class `BaexGreeting` → `ExbaGreeting`
- [x] Update all import paths (`baex` → `exba`)
- [x] Update all string literals (log prefixes, UI text, error messages)
- [x] Create `README.md` with project vision and architecture
- [x] Create `TODOS.md` with development roadmap
- [x] Build verification

---

## Phase 2 — Improvements

> Address architectural gaps across the three pillars: web components, WASM integration, and signal-based reactivity.

### 2.1 WASM Integration

- [x] Expose all WASM functions dynamically through the bridge (now exposes `greet`, `process_action`, `process_ir`, `add`, `fibonacci`)
- [x] Implement `ExbaBridge.on()` for WASM→JS event channel (delegates to `EXBA.addEventListener`)
- [ ] Add proper type narrowing for WASM return types (currently all `any`)
- [x] Remove dead `EngineApi` interface and unused bridge types

### 2.2 Signal-Based Reactivity

- [ ] Replace `innerHTML` re-rendering with targeted DOM updates (current `setState()` destroys the entire shadow DOM tree on every state change)
- [ ] Scope subscriptions per-component instead of global flat namespace (currently all state keys share one `Map<string, Set<callback>>`)
- [x] Add microtask batching to `ReactiveStateProxy` (batches via `queueMicrotask` + `enqueueNotify/flush`)
- [x] Remove `immer` dependency — shallow spread `{ ...current, [prop]: value }` replaces `produce`
- [x] Fix `NaN !== NaN` deduplication issue via `isSameValue()` helper in Proxy set trap

### 2.3 Web Components

- [x] Make `IRProcessor` shadow-DOM-aware (`resolveElement()` searches light DOM + all shadow roots, with retry queue)
- [ ] Standardize on `ExbaComponent` as the single base class (currently 3 different patterns)
- [ ] Fix `ExbaGreeting` to react to attribute changes (declares `observedAttributes` but has no `attributeChangedCallback`)
- [x] Fix event listener accumulation in `modal` (stores `boundHandler`, cleans up in `disconnectedCallback`)
- [x] Add XSS escaping via `escapeHtml()` utility in `core/schema.ts`

### 2.4 Code Quality

- [x] Remove dead code: `src/app/view.ts`, `src/counter.ts`, `src/types/bridge.d.ts`, `src/core/decorators.ts`, `src/vite-env.d.ts`, `src/typescript.svg`, empty `src/types/` directory
- [x] Remove dead import: `IRProcessor` in `modal/index.ts`
- [x] Fix dead code in `main.ts` (cleaned up bootstrap, removed dead `updateStatusBar`)
- [x] Fix `constants.ts` — replaced Electron API stubs with actual WASM bridge calls
- [x] Exclude legacy dirs (`archive/`, `src-alt/`) from vitest and biome

### 2.5 Accessibility

- [ ] Add ARIA roles and labels to all components
- [ ] Add keyboard navigation to tab-bar and menu items
- [ ] Add focus management for modal overlay
- [ ] Use semantic HTML elements where appropriate

### 2.6 Error Handling

- [x] Add error boundaries in components (`safeUpdate()` wraps `render()` in try/catch, shows fallback)
- [x] Add retry queue for missed IR instructions (3 retries at 50ms/200ms intervals)
- [x] Split bridge init vs render error reporting in `main.ts` with styled error cards
- [x] Add `waitForApp()` timeout (50 attempts × 100ms) with clear error message

---

## Phase 3+ — Future

> Long-term goals and experimental features.

- [ ] TypeScript vs WASM evaluation — document which logic belongs where
- [ ] Service worker for offline WASM caching
- [ ] Hot module replacement for WASM modules
- [ ] Cross-component state composition (scoped reactive contexts)
- [ ] A11y audit and keyboard-first navigation
