/**
 * A registry of open tabs in the application.
 * Maps a unique tab identifier to its display label and activation action.
 */
export const tabs = new Map<string, { label: string; action: () => void }>();

/**
 * Application-level state for tab management.
 */
export const state = {
  /** The identifier of the currently active tab, or null if no tab is selected. */
  activeTabId: null as string | null,
};

/**
 * The key used for persisting tab state in browser local storage.
 */
export const STORAGE_KEY = 'baex-tabs';

/**
 * Persists the current set of open tabs and the active tab identifier to local storage.
 */
export function saveTabState() {
  const data = {
    tabs: Array.from(tabs.entries()).map(([id, { label }]) => ({ id, label })),
    activeTabId: state.activeTabId,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save tab state:', e);
  }
}

/**
 * Restores the application tab state from local storage.
 *
 * @returns The saved state object containing tabs and activeTabId, or null if no state exists.
 */
export function restoreTabState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved?.tabs?.length) return null;
    return saved;
  } catch (e) {
    console.error('Failed to restore tab state:', e);
    return null;
  }
}

/**
 * Synchronizes the internal tab state with the `<tab-bar>` custom element.
 * Triggers a save to local storage and updates the component attributes.
 */
export function renderTabBar() {
  saveTabState();
  const tabBar = document.querySelector('tab-bar') as HTMLElement;
  if (tabBar) {
    const tabList = Array.from(tabs.entries()).map(([id, { label }]) => ({
      id,
      label,
    }));
    tabBar.setAttribute('tabs', JSON.stringify(tabList));
    (tabBar as any).setActive(state.activeTabId);
    tabBar.style.display = tabList.length > 0 ? 'flex' : 'none';
  }
}
