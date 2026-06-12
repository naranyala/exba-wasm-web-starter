import { ExbaComponent } from '@core/lifecycle/component';
import { styles, t } from '@shell/theme/styles';

/**
 * A demo component for the Screen Wake Lock API.
 *
 * Demonstrates:
 * - Requesting a wake lock to prevent the screen from dimming or locking.
 * - Handling wake lock releases and visibility changes.
 *
 * @extends ExbaComponent
 */
export class WakeLockDemo extends ExbaComponent {
  static styles = {
    container:
      'padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; max-width: 600px; margin: 0 auto;',
    statusCard: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800}; border-radius: 1.5rem; padding: 2rem; width: 100%; text-align: center; display: flex; flex-direction: column; gap: 1rem;`,
    indicator: `width: 20px; height: 20px; border-radius: 50%; margin: 0 auto;`,
    active: 'background: #fbbf24; box-shadow: 0 0 15px #fbbf24;',
    inactive: 'background: #3f3f46;',
    btn: `padding: 0.75rem 1.5rem; background: ${t.indigo600}; color: white; border: none; border-radius: 0.75rem; font-weight: 600; cursor: pointer; transition: background 0.2s;`,
  };

  private wakeLock: any = null;

  /**
   * Renders the wake lock control UI.
   */
  render() {
    const isActive = !!this.state.active;
    return `
      <div class="${this.constructor.styles.container}">
        <div class="${styles.viewHeading}">Screen Wake Lock API Demo</div>
        <div class="${this.constructor.styles.statusCard}">
          <div class="${this.constructor.styles.indicator} ${isActive ? this.constructor.styles.active : this.constructor.styles.inactive}"></div>
          <div style="font-size: 1.125rem; font-weight: 700; color: ${isActive ? '#fbbf24' : t.zinc400}">
            ${isActive ? 'WAKE LOCK ACTIVE' : 'WAKE LOCK INACTIVE'}
          </div>
          <p style="font-size: 0.8125rem; color: ${t.zinc500};">The screen will not dim or lock while active.</p>
        </div>
        <button id="wake-toggle" class="${this.constructor.styles.btn}">
          ${isActive ? 'Release Wake Lock' : 'Request Wake Lock'}
        </button>
      </div>
    `;
  }

  /**
   * Attaches wake lock request handler on mount.
   */
  protected onMount() {
    const btn = this.shadowRoot?.getElementById('wake-toggle');
    btn?.addEventListener('click', () => this.toggleWakeLock());

    document.addEventListener('visibilitychange', () => {
      if (this.wakeLock !== null && document.visibilityState === 'visible') {
        this.requestWakeLock();
      }
    });
  }

  /**
   * Toggles the wake lock state.
   */
  private async toggleWakeLock() {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
      this.setState({ active: false });
    } else {
      await this.requestWakeLock();
    }
  }

  /**
   * Requests a new wake lock.
   */
  private async requestWakeLock() {
    if (!('wakeLock' in navigator)) {
      alert('Wake Lock API is not supported in this browser.');
      return;
    }

    try {
      this.wakeLock = await (navigator as any).wakeLock.request('screen');
      this.setState({ active: true });

      this.wakeLock.addEventListener('release', () => {
        this.wakeLock = null;
        this.setState({ active: false });
      });
    } catch (err: any) {
      alert(`${err.name}, ${err.message}`);
    }
  }
}
