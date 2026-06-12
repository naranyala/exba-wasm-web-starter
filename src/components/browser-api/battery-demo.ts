import { ExbaComponent } from '@core/lifecycle/component';
import { styles, t } from '@shell/theme/styles';

/**
 * A demo component for the Battery Status API.
 *
 * Demonstrates:
 * - Monitoring battery level and charging status.
 * - Reactive UI updates when battery state changes.
 *
 * @extends ExbaComponent
 */
export class BatteryDemo extends ExbaComponent {
  static styles = {
    container:
      'padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; max-width: 600px; margin: 0 auto;',
    batteryCard: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800}; border-radius: 1.5rem; padding: 2.5rem; width: 100%; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem;`,
    levelWrapper:
      'position: relative; width: 120px; height: 180px; border: 4px solid #3f3f46; border-radius: 12px; padding: 4px;',
    levelFill:
      'width: 100%; background: #22c55e; border-radius: 4px; position: absolute; bottom: 4px; left: 4px; right: 4px; transition: height 0.5s ease;',
    info: `font-size: 1.5rem; font-weight: 800; color: ${t.white};`,
    status: `font-size: 0.875rem; color: ${t.zinc400};`,
  };

  /**
   * Renders the battery status UI.
   */
  render() {
    const level = this.state.level ?? 0;
    const isCharging = this.state.charging ?? false;
    const fillHeight = `calc(${level * 100}% - 8px)`;

    return `
      <div class="${this.constructor.styles.container}">
        <div class="${styles.viewHeading}">Battery Status API Demo</div>
        <div class="${this.constructor.styles.batteryCard}">
          <div class="${this.constructor.styles.levelWrapper}">
            <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); width: 40px; height: 8px; background: #3f3f46; border-radius: 4px 4px 0 0;"></div>
            <div class="${this.constructor.styles.levelFill}" style="height: ${fillHeight}; background: ${level < 0.2 ? '#ef4444' : '#22c55e'}"></div>
          </div>
          <div>
            <div class="${this.constructor.styles.info}">${Math.round(level * 100)}%</div>
            <div class="${this.constructor.styles.status}">${isCharging ? '⚡ Charging' : '🔋 Discharging'}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initializes battery monitoring on mount.
   */
  protected async onMount() {
    if (!('getBattery' in navigator)) {
      alert('Battery Status API is not supported in this browser.');
      return;
    }

    try {
      const battery = await (navigator as any).getBattery();

      const updateBattery = () => {
        this.setState({
          level: battery.level,
          charging: battery.charging,
        });
      };

      updateBattery();

      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);

      this.activeSubscriptions.push(() => {
        battery.removeEventListener('levelchange', updateBattery);
        battery.removeEventListener('chargingchange', updateBattery);
      });
    } catch (e) {
      console.error('Battery API error', e);
    }
  }
}
