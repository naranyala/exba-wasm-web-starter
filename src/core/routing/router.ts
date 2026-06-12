/**
 * Defines a single application route.
 */
export interface Route {
  /** The URL path for this route */
  path: string;
  /** The HTML tag name of the component to render (e.g., 'home-component') */
  component: string;
  /** Optional static properties to pass to the component */
  props?: Record<string, any>;
}

/**
 * A lightweight client-side router for EXBA applications.
 *
 * Maps URL paths to Web Components and renders them into a target container.
 * Supports passing properties to components via HTML attributes and synchronizes
 * with the browser's history API.
 */
export class Router {
  private routes: Map<string, Route> = new Map();
  private currentPath: string = '/';
  private container: HTMLElement;

  /**
   * Initializes a new Router.
   * @param containerId The ID of the DOM element where components should be rendered
   */
  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
  }

  /**
   * Registers a new route in the router.
   * @param route The route definition object
   */
  register(route: Route) {
    this.routes.set(route.path, route);
  }

  /**
   * Navigates to a specific path and renders the associated component.
   * @param path The URL path to navigate to
   * @param params Optional dynamic properties to pass to the target component
   */
  async navigate(path: string, params?: Record<string, any>) {
    this.currentPath = path;
    const route = this.routes.get(path);

    if (!route) {
      console.error(`Route not found: ${path}`);
      return;
    }

    // Clear container and render component
    this.container.innerHTML = '';
    const el = document.createElement(route.component);

    // Apply props as attributes
    const props = { ...route.props, ...params };
    for (const [key, value] of Object.entries(props)) {
      el.setAttribute(
        key,
        typeof value === 'object' ? JSON.stringify(value) : String(value),
      );
    }

    this.container.appendChild(el);

    // Update URL if needed (optional)
    window.history.pushState({}, '', path);
  }

  /**
   * Returns the currently active path.
   * @returns The current path string
   */
  getCurrentPath() {
    return this.currentPath;
  }
}
