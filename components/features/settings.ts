import { ExbaComponent } from '@core/lifecycle/component';
import { ease, t } from '@shell/theme/styles';

const STYLES = `
  .container {
    padding: 2rem;
    color: ${t.zinc100};
    font-family: inherit;
  }
  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: ${t.zinc200};
  }
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: ${t.zinc800a};
    border-radius: 0.75rem;
    margin-bottom: 0.75rem;
    border: 1px solid ${t.zinc700};
  }
  .label {
    font-size: 0.9375rem;
    color: ${t.zinc300};
  }
  .toggle {
    width: 2.5rem;
    height: 1.25rem;
    background: ${t.zinc700};
    border-radius: 1rem;
    position: relative;
    cursor: pointer;
    transition: background ${ease};
  }
  .toggle.active {
    background: ${t.indigo600};
  }
  .toggle::after {
    content: '';
    position: absolute;
    width: 1rem;
    height: 1rem;
    background: ${t.white};
    border-radius: 50%;
    top: 0.125rem;
    left: 0.125rem;
    transition: transform ${ease};
  }
  .toggle.active::after {
    transform: translateX(1.25rem);
  }
`;

/**
 * A reactive settings dashboard component with interactive toggles.
 * 
 * Demonstrates the use of boolean properties and local state to create 
 * interactive control elements. Features include:
 * - Dark mode toggle.
 * - Notifications toggle.
 * - Auto-update toggle.
 * 
 * @extends ExbaComponent
 */
export class SettingsComponent extends ExbaComponent {
  /**
   * Observed properties for the Settings component.
   */
  static props = {
    /** Whether dark mode is enabled */
    darkMode: 'boolean',
    /** Whether notifications are enabled */
    notifications: 'boolean',
    /** Whether automatic updates are enabled */
    autoUpdate: 'boolean',
  };

  static styles = STYLES;

  /**
   * Renders the settings dashboard with interactive toggles.
   */
  render() {
    const {
      darkMode = true,
      notifications = false,
      autoUpdate = true,
    } = this.state;
    return `
      <div class="container">
        <div class="title">Settings</div>
        <div class="setting-item">
          <span class="label">Dark Mode</span>
          <div class="toggle ${darkMode ? 'active' : ''}" onclick="this.getRootNode().host.setState({ darkMode: ${!darkMode} })"></div>
        </div>
        <div class="setting-item">
          <span class="label">Notifications</span>
          <div class="toggle ${notifications ? 'active' : ''}" onclick="this.getRootNode().host.setState({ notifications: ${!notifications} })"></div>
        </div>
        <div class="setting-item">
          <span class="label">Auto Update</span>
          <div class="toggle ${autoUpdate ? 'active' : ''}" onclick="this.getRootNode().host.setState({ autoUpdate: ${!autoUpdate} })"></div>
        </div>
      </div>
    `;
  }
}

