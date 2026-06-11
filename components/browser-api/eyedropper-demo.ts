import { ExbaComponent } from '@core/lifecycle/component';
import { styles } from '@shell/theme/styles';
import { t } from '@shell/theme/styles';

/**
 * A demo component for the EyeDropper API.
 * 
 * Demonstrates:
 * - Activating the browser's color picker tool.
 * - Sampling colors from any pixel on the screen.
 * - Reactive UI updates with the sampled color.
 * 
 * @extends ExbaComponent
 */
export class EyeDropperDemo extends ExbaComponent {
  static styles = {
    container: 'padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; max-width: 600px; margin: 0 auto;',
    colorPreview: `width: 150px; height: 150px; border-radius: 50%; border: 4px solid ${t.zinc800}; background: #333; transition: all 0.3s; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);`,
    btn: `padding: 0.75rem 1.5rem; background: ${t.indigo600}; color: white; border: none; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: background 0.2s;`,
    hex: `font-family: monospace; font-size: 1.5rem; font-weight: 800; color: ${t.white};`
  };

  /**
   * Renders the eyedropper control UI.
   */
  render() {
    const color = this.state.color || '#333333';
    return `
      <div class="${this.constructor.styles.container}">
        <div class="${styles.viewHeading}">EyeDropper API Demo</div>
        <p style="color: #a1a1aa; text-align: center;">Sample any color from your screen using the native tool.</p>
        <div class="${this.constructor.styles.colorPreview}" style="background: ${color}"></div>
        <div class="${this.constructor.styles.hex}">${color.toUpperCase()}</div>
        <button id="drop-btn" class="${this.constructor.styles.btn}">Open EyeDropper</button>
      </div>
    `;
  }

  /**
   * Attaches eyedropper activation logic on mount.
   */
  protected onMount() {
    const btn = this.shadowRoot?.getElementById('drop-btn');
    btn?.addEventListener('click', () => this.pickColor());
  }

  /**
   * Activates the EyeDropper tool and updates state with the result.
   */
  private async pickColor() {
    if (!('EyeDropper' in window)) {
      alert('EyeDropper API is not supported in this browser (Use Chrome/Edge).');
      return;
    }

    const eyeDropper = new (window as any).EyeDropper();
    try {
      const result = await eyeDropper.open();
      this.setState({ color: result.sRGBHex });
    } catch (e) {
      console.log('EyeDropper cancelled or failed');
    }
  }
}

