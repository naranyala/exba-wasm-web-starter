import { ExbaComponent } from '@core/lifecycle/component';
import { styles } from '@shell/theme/styles';

/**
 * An interactive drawing board component using the Canvas 2D API.
 * 
 * Demonstrates:
 * - Handling mouse events for freehand drawing.
 * - Customizing stroke styles (color, width).
 * - Direct manipulation of the Canvas context.
 * 
 * @extends ExbaComponent
 */
export class CanvasDemo extends ExbaComponent {
  static props = {};

  static styles = {
    container:
      'display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem; max-width: 800px; margin: 0 auto;',
    canvas:
      'background: #000; border-radius: 0.75rem; cursor: crosshair; border: 1px solid #333;',
    toolbar: 'display: flex; gap: 1rem; align-items: center;',
    btn: 'padding: 0.5rem 1rem; cursor: pointer; border-radius: 0.5rem; border: none; background: #6366f1; color: white;',
  };

  private isDrawing = false;

  /**
   * Renders the canvas and its drawing toolbar.
   */
  render() {
    return `
      <div class="${this.constructor.styles.container}">
        <div class="${styles.viewHeading}">Canvas 2D API Demo</div>
        <p style="color: #a1a1aa; text-align: center;">Interactive drawing board. Draw something!</p>
        <canvas id="draw-canvas" width="600" height="400" class="${this.constructor.styles.canvas}"></canvas>
        <div class="${this.constructor.styles.toolbar}">
          <input type="color" id="color-picker" value="#6366f1">
          <input type="range" id="brush-size" min="1" max="20" value="5">
          <button id="clear-canvas" class="${this.constructor.styles.btn}">Clear</button>
        </div>
      </div>
    `;
  }

  /**
   * Initializes canvas event listeners for drawing on mount.
   */
  protected onMount() {
    const canvas = this.shadowRoot?.getElementById(
      'draw-canvas',
    ) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const colorPicker = this.shadowRoot?.getElementById(
      'color-picker',
    ) as HTMLInputElement;
    const brushSize = this.shadowRoot?.getElementById(
      'brush-size',
    ) as HTMLInputElement;
    const clearBtn = this.shadowRoot?.getElementById('clear-canvas');

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const startDraw = (e: MouseEvent) => {
      this.isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(e.offsetX, e.offsetY);
    };

    const draw = (e: MouseEvent) => {
      if (!this.isDrawing) return;
      ctx.strokeStyle = colorPicker?.value || '#6366f1';
      ctx.lineWidth = Number(brushSize?.value || 5);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    };

    const stopDraw = () => {
      this.isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);

    clearBtn?.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  }
}

customElements.define('exba-canvas-demo', CanvasDemo);
