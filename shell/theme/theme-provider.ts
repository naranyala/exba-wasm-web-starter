import { ExbaComponent } from '@core/lifecycle/component';
import { Context } from '@core/reactivity/context';

/**
 * Available theme modes for the application.
 * 'system' follows the browser's preferred color scheme.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Represents the current state of the theme.
 */
export interface ThemeState {
  /** The currently active theme mode */
  mode: ThemeMode;
  /** Map of color keys to their CSS variable values */
  colors: Record<string, string>;
}

const Themes = {
  light: {
    background: '#ffffff',
    foreground: '#1a1a1a',
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    border: '#e2e8f0',
    muted: '#f1f5f9',
  },
  dark: {
    background: '#0f172a',
    foreground: '#f8fafc',
    primary: '#60a5fa',
    secondary: '#94a3b8',
    accent: '#a78bfa',
    border: '#1e293b',
    muted: '#1e293b',
  },
};

/**
 * A Web Component that manages the application's theme.
 * 
 * It applies theme colors as CSS custom properties (e.g., `--exba-primary`)
 * to the document root and provides theme information to its children
 * via the Context API.
 * 
 * @extends ExbaComponent
 */
export class ThemeProvider extends ExbaComponent {
  /** Observed properties for the ThemeProvider */
  static props = {
    /** The initial theme mode to use ('light', 'dark', or 'system') */
    initialMode: { type: 'string', default: 'system' },
  };

  /** Scoped styles for the ThemeProvider */
  static styles = {
    themeWrapper: 'display: contents;',
  };

  /** Internal state tracking the current theme mode */
  private currentMode: ThemeMode = 'system';

  /**
   * Initializes the theme on component mount.
   */
  protected onMount() {
    this.currentMode = (this.state.initialMode as ThemeMode) || 'system';
    this.applyTheme();
  }

  /**
   * Resolves the current theme, sets CSS variables on the document root,
   * and provides the 'theme' context to children.
   */
  private applyTheme() {
    const mode = this.resolveMode();
    const colors = Themes[mode];

    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--exba-${key}`, value);
    });

    Context.provide(this, 'theme', {
      mode,
      colors,
      setMode: (m: ThemeMode) => this.updateMode(m),
    });
  }

  /**
   * Determines whether to use 'light' or 'dark' mode based on preferences.
   * @returns The resolved theme mode ('light' or 'dark')
   */
  private resolveMode(): ThemeMode {
    if (this.currentMode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return this.currentMode;
  }

  /**
   * Updates the theme mode and triggers a re-application of styles.
   * @param mode The new theme mode
   */
  private updateMode(mode: ThemeMode) {
    this.currentMode = mode;
    this.applyTheme();
    this.setState({ mode: this.currentMode });
  }

  /**
   * Renders the ThemeProvider's wrapper and slot.
   */
  render() {
    return `<div class="theme-wrapper">
      <slot></slot>
    </div>`;
  }
}

customElements.define('exba-theme-provider', ThemeProvider);
