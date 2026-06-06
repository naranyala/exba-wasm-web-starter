import './style.css'
import './components/tab-bar/index';
import { BAEX } from './core/baex';
import { BaexGreeting } from './components/baex-greeting/index';
import { StatusBar } from './components/status-bar/index';
import { ReactiveStateProxy } from './state/proxy';
import { setupBridge } from './bridge/manager';
import { initApp, renderTabBar } from './app/view';
import { MENU_ITEMS } from './app/constants';
import { fuzzySearch } from './app/utils';

BAEX.register('baex-greeting', BaexGreeting);
BAEX.register('status-bar', StatusBar);

// Initialize Reactive State
const appState = new ReactiveStateProxy({
  counter: 0,
  user: 'Developer'
}, {
  onPropertyUpdate: (prop, value) => {
    const bundle = {
      version: '1.0.0',
      hlir: { type: 'UIUpdate' as const, target_screen: 'GlobalState', state: prop },
      llir: [
        { type: 'Log' as const, message: `State ${prop} changed to ${value}` },
        { type: 'UpdateText' as const, id: `state-${prop}`, text: String(value) }
      ]
    };
    BAEX.dispatchIR(bundle);
  }
});

function updateStatusBar() {
  const statusBar = document.getElementById('app-status-bar');
  if (statusBar) {
    // These are placeholders for the actual counts
    statusBar.setAttribute('primitives', '5');
    statusBar.setAttribute('wasm-functions', '12');
  }
}

// Application State
const tabs = new Map(); // id -> { label, action }
let activeTabId: string | null = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupBridge();
  updateStatusBar();

  const tabBar = document.getElementById('main-tab-bar') as any;
  if (tabBar) {
    tabBar.addEventListener('tab-selected', (e: any) => {
      const tabId = e.detail;
      activeTabId = tabId;
      const tab = tabs.get(tabId);
      if (tab) tab.action();
      renderTabBar(tabs, activeTabId);
    });
  }

  (window as any).dispatchMenuAction = (id: string) => {
    const item = MENU_ITEMS.find(i => i.id === id);
    if (item) {
      tabs.set(item.id, { label: item.label, action: item.action });
      activeTabId = item.id;
      item.action();
      renderTabBar(tabs, activeTabId);
    }
  };

  (window as any).triggerBaexAction = async (actionId: string) => {
    await BAEX.callBridge('process_action', actionId);
  };

  (window as any).incrementCounter = () => {
    appState.value.counter++;
  };
});
