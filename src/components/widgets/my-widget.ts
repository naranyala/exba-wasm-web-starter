import { html } from '@core/dom/dom';
import { ExbaComponent } from '@core/lifecycle/component';
import { t } from '@shell/theme/styles';

/**
 * Scaffolding for the My Widget Widget Component.
 * Pure TypeScript reactive component without WASM back-channel bindings.
 *
 * @extends ExbaComponent
 */
export class MyWidgetComponent extends ExbaComponent {
  static useShadow = true;

  count = this.useSignal(0);

  static props = {
    title: 'string',
  };

  static styles = {
    container: `padding: 2rem; width: 100%; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif; color: ${t.zinc100};`,
    card: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); backdrop-filter: blur(8px); display: flex; flex-direction: column; gap: 1rem;`,
    title: `font-size: 1.5rem; font-weight: 700; color: ${t.indigo400};`,
    btn: `padding: 0.5rem 1rem; background: ${t.indigo600}; border: none; border-radius: 0.5rem; color: ${t.white}; font-weight: 600; cursor: pointer; transition: background 0.2s; &:hover { background: ${t.indigo500}; }`,
  };

  protected onMount() {
    this.shadowRoot?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('btn-inc')) {
        this.count.value++;
      }
    });
  }

  render() {
    return html`
      <div class="container">
        <div class="card">
          <h1 class="title">My Widget Widget</h1>
          <p style="color: ${t.zinc400}; font-size: 0.9rem;">
            This is a pure client-side TypeScript component utilizing EXBA reactive signals.
          </p>
          <div style="padding: 1rem; background: ${t.zinc800}; border-radius: 0.5rem; font-family: monospace;">
            Count: <span class="counter-val" style="color: ${t.emerald400}; font-weight: bold;">${this.count.value}</span>
          </div>
          <button class="btn btn-inc">Increment</button>
        </div>
      </div>
    `;
  }
}
