import { html } from '@core/dom/dom';
import { ExbaComponent } from '@core/lifecycle/component';
import { EXBA } from '@core/lifecycle/exba';
import { t } from '@shell/theme/styles';

/**
 * Scaffolding for the Sample Task Web Component.
 * Powered by the EXBA Rust WebAssembly state engine.
 *
 * @extends ExbaComponent
 */
export class SampleTaskComponent extends ExbaComponent {
  static useShadow = true;

  static props = {
    // Define observed attributes here (e.g., config: 'string')
    status: 'string',
  };

  static styles = {
    container: `padding: 2rem; width: 100%; max-width: 800px; margin: 0 auto; font-family: system-ui, sans-serif; color: ${t.zinc100};`,
    card: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); backdrop-filter: blur(8px); display: flex; flex-direction: column; gap: 1rem;`,
    title: `font-size: 1.5rem; font-weight: 700; color: ${t.indigo400};`,
    btn: `padding: 0.5rem 1rem; background: ${t.indigo600}; border: none; border-radius: 0.5rem; color: ${t.white}; font-weight: 600; cursor: pointer; transition: background 0.2s; &:hover { background: ${t.indigo500}; }`,
    input: `padding: 0.5rem; background: ${t.zinc850}; border: 1px solid ${t.zinc700}; border-radius: 0.5rem; color: ${t.zinc100}; outline: none;`,
  };

  protected async onMount() {
    this.setState({ data: 'Loading state from WASM...' });
    await this.fetchFromWasm();
  }

  private async fetchFromWasm() {
    try {
      const response = await EXBA.api.process_ir(
        JSON.stringify({
          type: 'SampleTaskFetch',
          payload: null,
        }),
      );
      if (response.type === 'SampleTaskData') {
        this.setState({ status: response.payload.status });
      }
    } catch (e) {
      console.error('Failed to communicate with WASM:', e);
    }
  }

  private async sendToWasm(text: string) {
    try {
      const response = await EXBA.api.process_ir(
        JSON.stringify({
          type: 'SampleTaskSubmit',
          payload: { input: text },
        }),
      );
      if (response.type === 'SampleTaskData') {
        this.setState({ status: response.payload.status });
      }
    } catch (e) {
      console.error('Failed to post data to WASM:', e);
    }
  }

  render() {
    const statusText = this.state.status || 'No status received';
    return html`
      <div class="container">
        <div class="card">
          <h1 class="title">Sample Task Feature</h1>
          <p style="color: ${t.zinc400}; font-size: 0.9rem;">
            This component communicates with the Rust WASM engine to query and mutate state.
          </p>
          <div style="padding: 1rem; background: ${t.zinc800}; border-radius: 0.5rem; font-family: monospace;">
            WASM Engine Status: <span style="color: ${t.emerald400}; font-weight: bold;">${statusText}</span>
          </div>
          <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
            <input id="action-input" class="input" type="text" placeholder="Type new state..." />
            <button class="btn" onclick="
              const input = this.getRootNode().getElementById('action-input');
              if (input && input.value) {
                this.getRootNode().host.sendToWasm(input.value);
                input.value = '';
              }
            ">Mutate WASM State</button>
          </div>
        </div>
      </div>
    `;
  }
}
