import { globalBus } from './EventBus';

export interface Route {
  path: string;
  component?: () => string;
  action?: () => void;
  title?: string;
}

export class Router {
  private routes: Route[] = [];
  private currentPath = '';
  private container: HTMLElement | null = null;
  private _basePath = '';

  get basePath(): string {
    return this._basePath;
  }

  setBasePath(path: string): void {
    this._basePath = path.replace(/\/+$/, '');
  }

  setContainer(el: HTMLElement): void {
    this.container = el;
  }

  register(routes: Route[]): void {
    this.routes.push(...routes);
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  navigate(path: string): void {
    const fullPath = this._basePath ? `${this._basePath}${path}` : path;
    history.pushState(null, '', fullPath);
    this._resolve(fullPath);
  }

  replace(path: string): void {
    const fullPath = this._basePath ? `${this._basePath}${path}` : path;
    history.replaceState(null, '', fullPath);
    this._resolve(fullPath);
  }

  start(): void {
    window.addEventListener('popstate', () => {
      this._resolve(window.location.pathname);
    });
    this._resolve(window.location.pathname);
  }

  private _resolve(pathname: string): void {
    const stripped = this._basePath
      ? '/' + pathname.slice(this._basePath.length).replace(/^\/+/, '')
      : pathname;

    for (const route of this.routes) {
      const match = this._matchRoute(route.path, stripped);
      if (match) {
        this.currentPath = route.path;
        if (route.title) document.title = route.title;
        globalBus.emit('route:change', {
          path: route.path,
          params: match.params,
        });

        if (route.action) {
          route.action();
        } else if (route.component && this.container) {
          this.container.innerHTML = route.component();
        }
        return;
      }
    }

    globalBus.emit('route:not-found', { path: stripped });
  }

  private _matchRoute(
    pattern: string,
    path: string,
  ): { params: Record<string, string> } | null {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return { params };
  }
}

export const globalRouter = new Router();
