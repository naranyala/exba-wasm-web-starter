import { ExbaComponent } from '@core/lifecycle/component';
import { styles, t } from '@shell/theme/styles';

/**
 * A demo component for the Clipboard API.
 *
 * Demonstrates:
 * - Copying text to the system clipboard.
 * - Reading text from the clipboard.
 *
 * @extends ExbaComponent
 */
export class ClipboardDemo extends ExbaComponent {
  static styles = {
    container:
      'padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; max-width: 500px; margin: 0 auto;',
    input: `width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid ${t.zinc800}; background: ${t.zinc900}; color: white; font-family: inherit;`,
    btn: `width: 100%; padding: 0.75rem; background: ${t.indigo600}; color: white; border: none; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: background 0.2s;`,
    result: `width: 100%; padding: 1rem; background: #000; border-radius: 0.5rem; font-family: monospace; font-size: 0.875rem; color: ${t.indigo300}; min-height: 50px; white-space: pre-wrap;`,
  };

  /**
   * Renders the clipboard interaction UI.
   */
  render() {
    return `
      <div class="${this.constructor.styles.container}">
        <div class="${styles.viewHeading}">Clipboard API Demo</div>
        <input type="text" id="copy-input" class="${this.constructor.styles.input}" placeholder="Type something to copy..." value="EXBA Framework is Awesome!">
        <button id="copy-btn" class="${this.constructor.styles.btn}">Copy to Clipboard</button>
        <div style="width: 100%; height: 1px; background: ${t.zinc800}; margin: 0.5rem 0;"></div>
        <button id="paste-btn" class="${this.constructor.styles.btn}" style="background: ${t.zinc800}; color: ${t.zinc200};">Paste from Clipboard</button>
        <div id="paste-result" class="${this.constructor.styles.result}">[Clipboard content will appear here]</div>
      </div>
    `;
  }

  /**
   * Initializes clipboard handlers on mount.
   */
  protected onMount() {
    const copyBtn = this.shadowRoot?.getElementById('copy-btn');
    const pasteBtn = this.shadowRoot?.getElementById('paste-btn');
    const input = this.shadowRoot?.getElementById(
      'copy-input',
    ) as HTMLInputElement;
    const result = this.shadowRoot?.getElementById('paste-result');

    copyBtn?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(input.value);
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => {
          copyBtn.innerText = originalText;
        }, 2000);
      } catch (err) {
        alert('Failed to copy');
      }
    });

    pasteBtn?.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (result) result.innerText = text || '[Clipboard is empty]';
      } catch (err) {
        alert('Failed to read clipboard. Make sure you granted permission.');
      }
    });
  }
}
