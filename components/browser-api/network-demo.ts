import { ExbaComponent } from '@core/lifecycle/component';
import { styles } from '@shell/theme/styles';
import { t } from '@shell/theme/styles';

/**
 * A demo component for the Network Information API.
 * 
 * Demonstrates:
 * - Detecting connection type (wifi, cellular, etc.).
 * - Monitoring effective bandwidth and round-trip time.
 * - Reactive UI updates on network state changes.
 * 
 * @extends ExbaComponent
 */
export class NetworkDemo extends ExbaComponent {
  static styles = {
    container: 'padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 2rem; max-width: 600px; margin: 0 auto;',
    card: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800}; border-radius: 1.5rem; padding: 2rem; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;`,
    item: 'display: flex; flex-direction: column; gap: 0.5rem; align-items: center;',
    label: `font-size: 0.75rem; color: ${t.zinc500}; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;`,
    value: `font-size: 1.25rem; font-weight: 600; color: ${t.indigo300};`
  };

  /**
   * Renders the network status dashboard.
   */
  render() {
    const net = this.state.network || {};
    return `
      <div class="${this.constructor.styles.container}">
        <div class="${styles.viewHeading}">Network Information API Demo</div>
        <div class="${this.constructor.styles.card}">
          <div class="${this.constructor.styles.item}">
            <span class="${this.constructor.styles.label}">Effective Type</span>
            <span class="${this.constructor.styles.value}">${net.effectiveType || 'Unknown'}</span>
          </div>
          <div class="${this.constructor.styles.item}">
            <span class="${this.constructor.styles.label}">Downlink</span>
            <span class="${this.constructor.styles.value}">${net.downlink || 0} Mbps</span>
          </div>
          <div class="${this.constructor.styles.item}">
            <span class="${this.constructor.styles.label}">RTT</span>
            <span class="${this.constructor.styles.value}">${net.rtt || 0} ms</span>
          </div>
          <div class="${this.constructor.styles.item}">
            <span class="${this.constructor.styles.label}">Data Saver</span>
            <span class="${this.constructor.styles.value}">${net.saveData ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initializes network monitoring on mount.
   */
  protected onMount() {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (!conn) {
      alert('Network Information API is not supported in this browser.');
      return;
    }

    const updateNetwork = () => {
      this.setState({
        network: {
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData
        }
      });
    };

    updateNetwork();
    conn.addEventListener('change', updateNetwork);

    this.activeSubscriptions.push(() => {
      conn.removeEventListener('change', updateNetwork);
    });
  }
}

