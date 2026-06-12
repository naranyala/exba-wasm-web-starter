import { ExbaComponent } from '@core/lifecycle/component';
import { styles } from '@shell/theme/styles';

/**
 * A manager component for browser LocalStorage data.
 *
 * Demonstrates:
 * - Interacting with the Web Storage API (CRUD operations).
 * - Real-time list synchronization with local storage state.
 * - Dynamic form handling within an EXBA component.
 *
 * @extends ExbaComponent
 */
export class StorageDemo extends ExbaComponent {
  static props = {};

  static styles = {
    container:
      'display: flex; flex-direction: column; align-items: center; gap: 2rem; padding: 2rem; max-width: 600px; margin: 0 auto;',
    form: 'display: flex; gap: 0.5rem; width: 100%;',
    input:
      'flex: 1; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #333; background: #18181b; color: white;',
    btn: 'padding: 0.5rem 1rem; cursor: pointer; border-radius: 0.5rem; border: none; background: #6366f1; color: white;',
    list: 'width: 100%; border: 1px solid #333; border-radius: 0.75rem; overflow: hidden;',
    item: 'display: flex; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #333; background: #09090b;',
    delBtn: 'color: #ef4444; cursor: pointer; font-weight: bold;',
  };

  /**
   * Renders the storage management form and data list.
   */
  render() {
    return `
      <div class="${this.constructor.styles.container}">
        <div class="${styles.viewHeading}">Web Storage API Demo</div>
        <p style="color: #a1a1aa; text-align: center;">Manage data in your browser's LocalStorage.</p>
        <div class="${this.constructor.styles.form}">
          <input type="text" id="storage-key" class="${this.constructor.styles.input}" placeholder="Key">
          <input type="text" id="storage-val" class="${this.constructor.styles.input}" placeholder="Value">
          <button id="storage-save" class="${this.constructor.styles.btn}">Save</button>
        </div>
        <div id="storage-list" class="${this.constructor.styles.list}"></div>
      </div>
    `;
  }

  /**
   * Loads the current storage state and initializes form listeners on mount.
   */
  protected onMount() {
    this.refreshList();

    const saveBtn = this.shadowRoot?.getElementById('storage-save');
    saveBtn?.addEventListener('click', () => {
      const key = (
        this.shadowRoot?.getElementById('storage-key') as HTMLInputElement
      )?.value;
      const val = (
        this.shadowRoot?.getElementById('storage-val') as HTMLInputElement
      )?.value;
      if (key) {
        localStorage.setItem(key, val || '');
        this.refreshList();
        const keyEl = this.shadowRoot?.getElementById(
          'storage-key',
        ) as HTMLInputElement;
        const valEl = this.shadowRoot?.getElementById(
          'storage-val',
        ) as HTMLInputElement;
        if (keyEl) keyEl.value = '';
        if (valEl) valEl.value = '';
      }
    });
  }

  /**
   * Re-queries LocalStorage and updates the display list.
   */
  private refreshList() {
    const listEl = this.shadowRoot?.getElementById('storage-list');
    if (!listEl) return;

    const items = Object.keys(localStorage)
      .map(
        (key) => `
      <div class="${this.constructor.styles.item}">
        <span><strong>${key}</strong>: ${localStorage.getItem(key)}</span>
        <span class="${this.constructor.styles.delBtn}" data-key="${key}">✕</span>
      </div>
    `,
      )
      .join('');

    listEl.innerHTML =
      items ||
      '<div style="padding: 1rem; text-align: center; color: #71717a;">No data stored</div>';

    listEl
      .querySelectorAll(`.${this.constructor.styles.delBtn}`)
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-key');
          if (key) {
            localStorage.removeItem(key);
            this.refreshList();
          }
        });
      });
  }
}
