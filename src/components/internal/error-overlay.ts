import { ExbaComponent } from '@core/lifecycle/component';
import { html } from '@core/dom/dom';

/**
 * A critical error overlay that captures and displays unhandled framework or application errors.
 * Provides a technical breakdown and a recovery path.
 */
export class ErrorOverlay extends ExbaComponent {
  static props = {
    title: 'string',
    message: 'string',
    stack: 'string'
  };

  static styles = {
    overlay: `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(9, 9, 11, 0.95);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      backdrop-filter: blur(8px);
      font-family: Inter, system-ui, sans-serif;
    `,
    container: `
      max-width: 640px;
      width: 100%;
      background: #18181b;
      border: 1px solid #ef4444;
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `,
    header: `
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      color: #ef4444;
    `,
    title: `
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `,
    message: `
      color: #e4e4e7;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    `,
    stack: `
      background: #09090b;
      border-radius: 0.5rem;
      padding: 1rem;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.75rem;
      color: #71717a;
      overflow: auto;
      max-height: 200px;
      white-space: pre-wrap;
      border: 1px solid #27272a;
      margin-bottom: 2rem;
    `,
    actions: `
      display: flex;
      gap: 1rem;
    `,
    button: `
      padding: 0.75rem 1.5rem;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        background: #dc2626;
        transform: translateY(-1px);
      }
    `,
    secondaryButton: `
      padding: 0.75rem 1.5rem;
      background: #27272a;
      color: #d4d4d8;
      border: 1px solid #3f3f46;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      &:hover {
        background: #3f3f46;
        color: white;
      }
    `
  };

  render() {
    const title = (this as any).title || 'System Exception';
    const message = (this as any).message || 'An unhandled error has occurred in the application.';
    const stack = (this as any).stack || '';

    return html`
      <div class="overlay">
        <div class="container">
          <header class="header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h2 class="title">${title}</h2>
          </header>
          
          <p class="message">${message}</p>
          
          ${stack ? html`<pre class="stack">${stack}</pre>` : ''}
          
          <div class="actions">
            <button class="button" @click="${() => window.location.reload()}">Reload Application</button>
            <button class="secondaryButton" @click="${() => this.remove()}">Dismiss</button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('exba-error-overlay', ErrorOverlay);
