import { ExbaComponent } from '@core/lifecycle/component';
import { styles } from '@shell/theme/styles';
import { t } from '@shell/theme/styles';

/**
 * A demo component for the Fullscreen API.
 * 
 * Demonstrates:
 * - Entering and exiting fullscreen mode for specific elements.
 * - Monitoring fullscreen state changes.
 * 
 * @extends ExbaComponent
 */
export class FullscreenDemo extends ExbaComponent {
  static styles = {
    container: 'padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; max-width: 600px; margin: 0 auto;',
    box: `width: 100%; height: 300px; background: ${t.zinc900a}; border: 2px dashed ${t.zinc700}; border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; color: ${t.zinc400}; transition: all 0.3s;`,
    btn: `padding: 0.75rem 1.5rem; background: ${t.indigo600}; color: white; border: none; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: background 0.2s;`,
    fullscreen: 'background: #000 !important; border: none !important; border-radius: 0 !important; color: #fff !important;'
  };

  /**
   * Renders the fullscreen control and target box.
   */
  render() {
    const isFS = !!document.fullscreenElement;
    return `
      <div class="${this.constructor.styles.container}">
        <div class="${styles.viewHeading}">Fullscreen API Demo</div>
        <div id="fs-box" class="${this.constructor.styles.box} ${isFS ? 'fullscreen' : ''}">
          ${isFS ? 'THIS BOX IS FULLSCREEN' : 'Element Content'}
        </div>
        <button id="fs-toggle" class="${this.constructor.styles.btn}">
          ${isFS ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        </button>
      </div>
    `;
  }

  /**
   * Attaches fullscreen toggle logic on mount.
   */
  protected onMount() {
    const btn = this.shadowRoot?.getElementById('fs-toggle');
    const box = this.shadowRoot?.getElementById('fs-box');

    btn?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        box?.requestFullscreen().catch(err => {
          alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    });

    document.addEventListener('fullscreenchange', () => this.render());
  }
}

customElements.define('exba-fullscreen-demo', FullscreenDemo);
