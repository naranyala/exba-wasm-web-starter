# EXBA Framework (Extended Browser Api)

EXBA is a modular web framework designed to bridge Rust-powered business logic with a reactive TypeScript frontend. It utilizes a WebAssembly-first architecture to deliver high-performance state management and surgical UI updates.

## Architecture

The codebase follows a Modular Layered Architecture to ensure strict separation of concerns and maintainability.

### Layered Structure

*   **core/**: The EXBA Framework Engine. Contains reactivity (Signals/Effects), DOM patching, routing, and base component lifecycle logic.
*   **wasm/**: The Native Logic Layer. High-performance Rust code compiled to WebAssembly. Manages canonical state and business rules.
*   **bridge/**: The Interop Layer. Handles the communication between TypeScript and the WebAssembly module.
*   **shell/**: The Application Orchestrator. Manages the main entry point, global configurations, and the theme system.
*   **components/**: The UI Library.
    *   `shell/`: Dashboard components like the status bar and tab bar.
    *   `widgets/`: Reusable primitives such as accordions and date pickers.
    *   `demos/`: High-level feature demonstrations including Kanban and Mindmaps.
*   **utils/**: Generic TypeScript utility helpers used across the project.
*   **tools/**: Internal development tools, including the API documentation generator.

## Core Concepts

### Signal-Based Reactivity
EXBA uses a granular reactivity system. Signals are lightweight value holders that automatically notify subscribers when their values change.

### Surgical DOM Patching
Instead of re-rendering entire components, EXBA's patching engine performs targeted updates to text content, attributes, and classes. It supports a two-tier execution model where high-performance diffing can be performed in Rust.

### WASM-First Interop
Business logic resides in Rust. The TypeScript layer communicates with Rust through a type-safe bridge, allowing for direct execution of native methods.

## Advanced Meta-Functionality

The EXBA Framework includes advanced meta-functionalities that enable complex UI development patterns:

### 1. Component Composition Engine

The framework provides a sophisticated component composition system that supports:
- **Dynamic component factories** for creating reusable component families
- **Slot-based content projection** for flexible component layouts
- **Component composition APIs** for building complex UIs from simpler components
- **Runtime component registration** for dynamic component loading

```typescript
// Composable component with slots
export class ComposableLayout extends ExbaComponent {
  static slots = ['header', 'content', 'sidebar', 'footer'];
  
  render() {
    return html`
      <div class="layout">
        <slot name="header"></slot>
        <div class="main-content">
          <slot name="content"></slot>
          <slot name="sidebar"></slot>
        </div>
        <slot name="footer"></slot>
      </div>
    `;
  }
}

// Component factory for dynamic creation
export class ComponentFactory {
  createComponent(descriptor: ComponentDescriptor): ExbaComponent;
  compose(components: ComponentDescriptor[]): ExbaComponent;
  registerComponent(name: string, factory: ComponentFactory): void;
}
```

### 2. State Management Middleware Pipeline

EXBA implements a comprehensive state management middleware system that enables:
- **State validation and transformation** before applying changes
- **State persistence** with automatic serialization
- **State history** for undo/redo functionality
- **State middleware composition** for cross-cutting concerns

```typescript
// State middleware interface
export interface StateMiddleware {
  onStateChange?(state: any, action: StateAction): any;
  beforeStateChange?(state: any, action: StateAction): boolean;
  afterStateChange?(state: any, action: StateAction): void;
  onError?(error: Error, state: any, action: StateAction): void;
}

// State store with middleware support
export class StateStore {
  use(middleware: StateMiddleware): StateStore;
  compose(...middlewares: StateMiddleware[]): StateStore;
  dispatch(action: StateAction): void;
  getState(): any;
  subscribe(listener: StateListener): () => void;
  replace(nextState: any): void;
  reset(): void;
}

// Validation middleware example
export const validationMiddleware: StateMiddleware = {
  beforeStateChange(state, action) {
    if (action.type === 'UPDATE') {
      const errors = validateStateChange(state, action.payload);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
    }
    return true;
  }
};
```

### 3. Virtual DOM with Custom Directives

EXBA provides a Virtual DOM engine that supports:
- **Custom directive system** for extending component capabilities
- **Intersection observer directives** for performance optimization
- **Click-outside directives** for improved UX
- **Custom element lifecycle hooks** for advanced interactions

```typescript
// Virtual DOM engine
export class VirtualDOM {
  createVNode(element: any, props: any, children: any): VNode;
  patch(oldVNode: VNode, newVNode: VNode, container: HTMLElement): void;
  createDirective(name: string, handler: Function): Directive;
  createComponentVNode(component: typeof ExbaComponent, props: any): VNode;
}

// Custom directive system
export class DirectiveSystem {
  register(name: string, directive: Directive): void;
  apply(directive: Directive, vnode: VNode, container: HTMLElement): void;
  createDirectiveInstance(directive: Directive, vnode: VNode): DirectiveInstance;
}

// Intersection observer directive example
export const intersectionDirective: Directive = {
  bind(vnode, el, { threshold = 0, root = null }) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            vnode.component?.setState({ visible: true });
          } else {
            vnode.component?.setState({ visible: false });
          }
        });
      },
      { threshold, root }
    );
    el._intersectionObserver = observer;
    observer.observe(el);
  },
  unbind(vnode, el) {
    if (el._intersectionObserver) {
      el._intersectionObserver.disconnect();
      delete el._intersectionObserver;
    }
  }
};
```

### 4. Advanced Routing System

EXBA includes a sophisticated routing system that supports:
- **Nested route handling** for complex application structures
- **Route guards and authentication** for secure navigation
- **Route transitions and animations** for smooth user experiences
- **Route middleware and validation** for advanced routing logic

```typescript
// Route definition
export interface Route {
  path: string;
  component: typeof ExbaComponent;
  props?: Record<string, any>;
  redirect?: string;
  children?: Route[];
  meta?: RouteMeta;
}

// Route meta information
export interface RouteMeta {
  title?: string;
  icon?: string;
  hidden?: boolean;
  requiresAuth?: boolean;
  roles?: string[];
  permissions?: string[];
  keepAlive?: boolean;
  transition?: TransitionConfig;
  middleware?: RouteMiddleware[];
}

// Route guard system
export class RouteGuard {
  private guards: Array<(to: Route, from: Route) => boolean> = [];
  
  use(guard: (to: Route, from: Route) => boolean): void {
    this.guards.push(guard);
  }
  
  canNavigate(to: Route, from: Route): boolean {
    return this.guards.every(guard => guard(to, from) !== false);
  }
}
```

### 5. Event Composition System

EXBA provides an advanced event composition system that enables:
- **Event composition and chaining** for complex event flows
- **Event filtering and transformation** for data processing
- **Event debouncing and throttling** for performance optimization
- **Event middleware pipeline** for cross-cutting concerns

```typescript
// Event composer for complex event flows
export class EventComposer {
  static pipe<T>(source: EventEmitter, ...transformers: Function[]): EventEmitter {
    const composed = new EventEmitter();
    
    source.on((payload) => {
      let data = payload;
      transformers.forEach(transformer => {
        data = transformer(data);
      });
      composed.emit(data);
    });
    
    return composed;
  }
  
  static filter<T>(source: EventEmitter, predicate: (data: T) => boolean): EventEmitter {
    const filtered = new EventEmitter();
    
    source.on((data) => {
      if (predicate(data)) {
        filtered.emit(data);
      }
    });
    
    return filtered;
  }
  
  static debounce<T>(source: EventEmitter, wait: number): EventEmitter {
    const debounced = new EventEmitter();
    let timeout: NodeJS.Timeout;
    
    source.on((data) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        debounced.emit(data);
      }, wait);
    });
    
    return debounced;
  }
}
```

### 6. Lifecycle Management System

EXBA includes a comprehensive lifecycle management system that enables:
- **Lifecycle middleware pipeline** for cross-cutting concerns
- **Async lifecycle composition** for complex initialization sequences
- **Lifecycle event system** for advanced component lifecycle management
- **Lifecycle debugging and profiling** for development and optimization

```typescript
// Lifecycle middleware
export interface LifecycleMiddleware {
  beforeMount?(component: ExbaComponent): void;
  mounted?(component: ExbaComponent): void;
  beforeUpdate?(component: ExbaComponent, oldState: any, newState: any): void;
  updated?(component: ExbaComponent): void;
  beforeUnmount?(component: ExbaComponent): void;
  unmounted?(component: ExbaComponent): void;
  error?(component: ExbaComponent, error: Error): void;
}

// Lifecycle manager
export class LifecycleManager {
  private middlewares: Array<LifecycleMiddleware> = [];
  private lifecycles: Map<string, Map<LifecycleHook, Function[]>> = new Map();
  
  use(middleware: LifecycleMiddleware): void {
    this.middlewares.push(middleware);
  }
  
  on(componentId: string, hook: LifecycleHook, handler: Function): void {
    if (!this.lifecycles.has(componentId)) {
      this.lifecycles.set(componentId, new Map());
    }
    const hooks = this.lifecycles.get(componentId)!;
    if (!hooks.has(hook)) {
      hooks.set(hook, []);
    }
    hooks.get(hook)!.push(handler);
  }
  
  emit(componentId: string, hook: LifecycleHook, ...args: any[]): void {
    const hooks = this.lifecycles.get(componentId);
    if (hooks && hooks.has(hook)) {
      hooks.get(hook)!.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in lifecycle hook ${hook} for component ${componentId}:`, error);
        }
      });
    }
    
    // Apply middlewares
    this.middlewares.forEach(middleware => {
      const methodName = hook as string;
      if (typeof middleware[methodName] === 'function') {
        (middleware as any)[methodName](...args);
      }
    });
  }
}
```

### 7. Theme & Accessibility System

EXBA provides a comprehensive theme and accessibility system that enables:
- **Theming system** for consistent application styling
- **Accessibility compliance** for inclusive user experiences
- **Dynamic theme switching** for user preference support
- **Accessibility testing** for quality assurance

```typescript
// Theme configuration
export interface ThemeConfig {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
  transitions: Record<string, string>;
}

// Accessibility configuration
export interface AccessibilityConfig {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
}

// Theme manager
export class ThemeManager {
  private config: ThemeConfig;
  private accessibility: AccessibilityConfig;
  private listeners: Array<(theme: ThemeConfig) => void> = [];
  
  constructor(config: ThemeConfig, accessibility: AccessibilityConfig) {
    this.config = config;
    this.accessibility = accessibility;
  }
  
  setTheme(theme: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...theme };
    this.notify();
  }
  
  getTheme(): ThemeConfig {
    return this.config;
  }
  
  setAccessibility(options: Partial<AccessibilityConfig>): void {
    this.accessibility = { ...this.accessibility, ...options };
    this.notify();
  }
  
  getAccessibility(): AccessibilityConfig {
    return this.accessibility;
  }
  
  private notify(): void {
    this.listeners.forEach(listener => listener(this.config));
  }
  
  subscribe(listener: (theme: ThemeConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}
```

### 8. Performance Optimization System

EXBA includes a performance optimization system that enables:
- **Performance metrics collection** for monitoring and optimization
- **Component performance profiling** for identifying bottlenecks
- **Event performance monitoring** for optimizing event handling
- **Middleware performance tracking** for optimizing cross-cutting concerns

```typescript
// Performance metrics
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  eventHandlers: number;
  middlewareCount: number;
}

// Performance monitor
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    eventHandlers: 0,
    middlewareCount: 0
  };
  
  startMeasure(): void {
    this.metrics.renderTime = performance.now();
  }
  
  endMeasure(): number {
    const endTime = performance.now();
    this.metrics.renderTime = endTime - this.metrics.renderTime;
    return this.metrics.renderTime;
  }
  
  updateMetrics(updates: Partial<PerformanceMetrics>): void {
    Object.assign(this.metrics, updates);
  }
  
  getMetrics(): PerformanceMetrics {
    return this.metrics;
  }
  
  reset(): void {
    this.metrics = {
      renderTime: 0,
      memoryUsage: 0,
      componentCount: 0,
      eventHandlers: 0,
      middlewareCount: 0
    };
  }
}
```

## Code Examples

### Advanced Component with Slots

```typescript
// Composable dashboard layout
export class DashboardLayout extends ExbaComponent {
  static slots = ['header', 'sidebar', 'content', 'footer'];
  
  static styles = {
    container: 'display: grid; grid-template-areas: "header header" "sidebar content" "footer footer"; gap: 1rem;',
    header: 'grid-area: header;',
    sidebar: 'grid-area: sidebar;',
    content: 'grid-area: content;',
    footer: 'grid-area: footer;'
  };
  
  render() {
    return html`
      <div class="container">
        <div class="header"><slot name="header"></slot></div>
        <div class="sidebar"><slot name="sidebar"></slot></div>
        <div class="content"><slot name="content"></slot></div>
        <div class="footer"><slot name="footer"></slot></div>
      </div>
    `;
  }
}

// Usage example
<exba-dashboard-layout>
  <exba-dashboard-header slot="header">
    <h1>Dashboard</h1>
  </exba-dashboard-header>
  <exba-navigation slot="sidebar">
    <nav>Navigation links...</nav>
  </exba-navigation>
  <exba-dashboard-content slot="content">
    <exba-kanban-board />
  </exba-dashboard-content>
  <exba-dashboard-footer slot="footer">
    <p>Footer content...</p>
  </exba-dashboard-footer>
</exba-dashboard-layout>
```

### State Management with Middleware

```typescript
// Component with state middleware
export class AdvancedComponent extends ExbaComponent {
  static useShadow = true;
  
  protected onMount() {
    // Initialize state with middleware
    this.setState({ data: [], loading: false, error: null });
    
    // Fetch data with error handling
    this.fetchData();
  }
  
  private async fetchData() {
    try {
      this.setState({ loading: true });
      const data = await this.api.getData();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }
  
  render() {
    const { data, loading, error } = this.state;
    
    if (loading) {
      return html`<div>Loading...</div>`;
    }
    
    if (error) {
      return html`<div>Error: ${error.message}</div>`;
    }
    
    return html`
      <div class="component">
        <h2>Data List</h2>
        <div class="data-list">
          ${data.map(item => html`
            <div class="data-item">
              <h3>${item.title}</h3>
              <p>${item.description}</p>
            </div>
          `)}
        </div>
      </div>
    `;
  }
}
```

### Advanced Routing with Guards

```typescript
// Protected route component
export class ProtectedRoute extends ExbaComponent {
  static props = {
    requireAuth: 'boolean',
    roles: 'string',
    redirect: 'string'
  };
  
  protected onMount() {
    this.checkAuth();
  }
  
  private async checkAuth() {
    if (this.state.requireAuth) {
      const isAuthenticated = await this.auth.isAuthenticated();
      const userRoles = await this.auth.getUserRoles();
      
      if (!isAuthenticated) {
        this.navigate(this.state.redirect || '/login');
        return;
      }
      
      if (this.state.roles && !userRoles.includes(this.state.roles)) {
        this.navigate('/unauthorized');
        return;
      }
    }
  }
  
  render() {
    return this.state.requireAuth && !this.auth.isAuthenticated()
      ? html`<div>Redirecting...</div>`
      : html`<slot></slot>`;
  }
}

// Route configuration
export const routes: Route[] = [
  { path: '/', component: HomeComponent },
  { path: '/dashboard', component: DashboardComponent, requireAuth: true },
  { path: '/admin', component: AdminPanel, requireAuth: true, roles: 'admin' },
  { path: '/login', component: LoginComponent, redirect: '/' },
  { path: '*', component: NotFoundComponent }
];
```

## Getting Started

### Installation

Install dependencies:
```bash
bun install
```

### Development

Build the WebAssembly module and start the dev server:
```bash
bun run build
bun run dev
```

### Testing

Execute the test suite:
```bash
bun run test
```

## API Documentation

The project includes a custom documentation generator located in `tools/docs-api-generator`. It parses both TypeScript and Rust sources to generate an interactive documentation site.

Generate documentation:
```bash
bun run docs:gen
```

Serve documentation:
```bash
bun run docs:serve
```

## Advanced Features

### Component Composition

EXBA's component composition system enables:
- **Dynamic component factories** for creating reusable component families
- **Slot-based content projection** for flexible component layouts
- **Component composition APIs** for building complex UIs from simpler components
- **Runtime component registration** for dynamic component loading

### State Management Middleware

The state management middleware system enables:
- **State validation and transformation** before applying changes
- **State persistence** with automatic serialization
- **State history** for undo/redo functionality
- **State middleware composition** for cross-cutting concerns

### Virtual DOM with Custom Directives

The Virtual DOM engine supports:
- **Custom directive system** for extending component capabilities
- **Intersection observer directives** for performance optimization
- **Click-outside directives** for improved UX
- **Custom element lifecycle hooks** for advanced interactions

### Advanced Routing

The advanced routing system supports:
- **Nested route handling** for complex application structures
- **Route guards and authentication** for secure navigation
- **Route transitions and animations** for smooth user experiences
- **Route middleware and validation** for advanced routing logic

### Event Composition

The event composition system enables:
- **Event composition and chaining** for complex event flows
- **Event filtering and transformation** for data processing
- **Event debouncing and throttling** for performance optimization
- **Event middleware pipeline** for cross-cutting concerns

### Lifecycle Management

The lifecycle management system enables:
- **Lifecycle middleware pipeline** for cross-cutting concerns
- **Async lifecycle composition** for complex initialization sequences
- **Lifecycle event system** for advanced component lifecycle management
- **Lifecycle debugging and profiling** for development and optimization

### Theme & Accessibility

The theme and accessibility systems enable:
- **Theming system** for consistent application styling
- **Accessibility compliance** for inclusive user experiences
- **Dynamic theme switching** for user preference support
- **Accessibility testing** for quality assurance

### Performance Optimization

The performance optimization system enables:
- **Performance metrics collection** for monitoring and optimization
- **Component performance profiling** for identifying bottlenecks
- **Event performance monitoring** for optimizing event handling
- **Middleware performance tracking** for optimizing cross-cutting concerns

## Benefits

### Enhanced Developer Experience
- Intuitive component composition
- Rich state management capabilities
- Advanced routing and navigation
- Comprehensive lifecycle management

### Improved Application Architecture
- Separation of concerns
- Composable components
- Middleware pipeline for cross-cutting concerns
- Enhanced testability and maintainability

### Better User Experience
- Smooth transitions and animations
- Accessibility compliance
- Performance optimization
- Responsive design support

### Enterprise-Grade Features
- State persistence and history
- Advanced event handling
- Theme management
- Performance monitoring

## Migration Guide

### From Basic to Advanced Usage

#### Basic Component
```typescript
// Basic component
export class SimpleComponent extends ExbaComponent {
  static props = { title: 'string' };
  render() { return html`<div>${this.state.title}</div>`; }
}
```

#### Advanced Component with Composition
```typescript
// Advanced component with composition
export class AdvancedComponent extends ExStateComponent {
  static slots = ['header', 'content', 'footer'];
  static props = { title: 'string', data: 'object' };
  
  render() {
    return html`
      <div class="component">
        <slot name="header"></slot>
        <div class="content">
          ${this.renderContent()}
        </div>
        <slot name="footer"></slot>
      </div>
    `;
  }
  
  private renderContent() {
    return this.state.data
      ? html`<div>Data: ${JSON.stringify(this.state.data)}</div>`
      : html`<div>No data available</div>`;
  }
}
```

#### State Management with Middleware
```typescript
// Component with state middleware
export class StatefulComponent extends ExbaComponent {
  protected onMount() {
    this.setState({ data: [], loading: false, error: null });
    this.fetchData();
  }
  
  private async fetchData() {
    try {
      this.setState({ loading: true });
      const data = await this.api.getData();
      this.setState({ data, loading: false });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  }
}
```

## Conclusion

The EXBA Framework's advanced meta-functionality transforms it from a basic component library into a comprehensive application development platform. By introducing advanced composition, state management, routing, and lifecycle management capabilities, the framework can now handle complex, enterprise-grade user interfaces while maintaining backward compatibility and providing a clear migration path for existing applications.

This enhancement positions the EXBA Framework as a competitive alternative to established frameworks like React, Vue, and Angular, offering unique advantages in Web Component-based development while providing the meta-functionalities needed for modern application development.
