import './style.css';
import './components/tab-bar/index';
import { MENU_ITEMS } from './app/constants';
import { initApp, renderTabBar } from './app/view-grid';
import { getExposedFunctions, setupBridge } from './bridge/manager';
import { ExbaGreeting } from './components/exba-greeting/index';
import { WasmModal } from './components/modal/index';
import { StatusBar } from './components/status-bar/index';
import { EXBA } from './core/exba';
import { ReactiveStateProxy } from './state/proxy';

EXBA.register('exba-greeting', ExbaGreeting);
EXBA.register('status-bar', StatusBar);
EXBA.register('wasm-modal', WasmModal);

const appState = new ReactiveStateProxy(
  { counter: 0 },
  {
    onPropertyUpdate: (prop, value) => {
      if (prop === 'counter') {
        const el = document.getElementById('state-counter');
        if (el) el.innerText = `Counter: ${value}`;
      }
    },
  },
);

async function waitForApp() {
  return new Promise<HTMLElement>((resolve, reject) => {
    const el = document.getElementById('app');
    if (el) return resolve(el);

    let attempts = 0;
    const maxAttempts = 50;
    const check = () => {
      const el = document.getElementById('app');
      if (el) return resolve(el);
      if (++attempts >= maxAttempts) {
        return reject(
          new Error(
            `#app element not found after ${maxAttempts * 100}ms. Check that index.html contains a <div id="app"> element.`,
          ),
        );
      }
      setTimeout(check, 100);
    };
    check();
  });
}

function renderError(
  phase: string,
  message: string,
  error: unknown,
  onRetry?: () => void,
) {
  const app = document.getElementById('app');
  if (!app) return;

  const err = error instanceof Error ? error : new Error(String(error));
  const stack = err.stack
    ? err.stack
        .split('\n')
        .slice(0, 5)
        .map((l) => l.trim())
        .join('\n')
    : '';

  app.innerHTML = `
    <div style="
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #18181b; color: #e4e4e7; font-family: Inter, system-ui, sans-serif;
      padding: 2rem;
    ">
      <div style="max-width: 560px; width: 100%;">
        <div style="
          background: rgba(220, 38, 38, 0.1); border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1rem;
        ">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
            <span style="color: #ef4444; font-weight: 600; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">
              ${phase}
            </span>
          </div>
          <p style="margin: 0 0 0.75rem; color: #d4d4d8; font-size: 0.9375rem; line-height: 1.5;">
            ${message}
          </p>
          ${
            stack
              ? `<pre style="
              margin: 0; padding: 0.75rem; background: #09090b; border-radius: 0.5rem;
              font-size: 0.75rem; font-family: 'SF Mono', 'Fira Code', monospace;
              color: #71717a; overflow-x: auto; line-height: 1.6; white-space: pre-wrap;
              word-break: break-word;
            ">${stack}</pre>`
              : ''
          }
        </div>
        ${
          onRetry
            ? `<button id="error-retry" style="
            padding: 0.5rem 1.25rem; background: #4f46e5; color: white; border: none;
            border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer;
            font-family: inherit; transition: background 0.15s;
          ">Retry</button>`
            : ''
        }
      </div>
    </div>
  `;

  if (onRetry) {
    const btn = app.querySelector<HTMLButtonElement>('#error-retry');
    btn?.addEventListener('click', onRetry);
    btn?.addEventListener('mouseenter', () => {
      if (btn) btn.style.background = '#4338ca';
    });
    btn?.addEventListener('mouseleave', () => {
      if (btn) btn.style.background = '#4f46e5';
    });
  }
}

async function bootstrap() {
  await waitForApp();

  try {
    await setupBridge();
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : 'Unknown error during WASM initialization';
    renderError(
      'Bridge Init Failed',
      `Could not initialize the WASM bridge. ${msg}`,
      e,
      () => bootstrap(),
    );
    throw e;
  }

  try {
    initApp();
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : 'Unknown error during app rendering';
    renderError(
      'Render Failed',
      `The application UI failed to render. ${msg}`,
      e,
    );
    throw e;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await bootstrap();
  } catch (e) {
    console.error('[EXBA] Fatal initialization error:', e);
    return;
  }

  const tabs = new Map<string, any>();
  let activeTabId: string | null = null;

  const statusBar = document.getElementById('app-status-bar');
  if (statusBar) {
    statusBar.addEventListener('show-modal', () => {
      const modal = document.createElement('wasm-modal');
      modal.setAttribute('functions', JSON.stringify(getExposedFunctions()));
      document.body.appendChild(modal);
    });
  }

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
    const item = MENU_ITEMS.find((i) => i.id === id);
    if (item) {
      tabs.set(item.id, { label: item.label, action: item.action });
      activeTabId = item.id;
      item.action();
      renderTabBar(tabs, activeTabId);
    }
  };

  (window as any).triggerExbaAction = async (actionId: string) => {
    try {
      await EXBA.callBridge('process_action', actionId);
    } catch (e) {
      console.error(`[EXBA] Bridge action "${actionId}" failed:`, e);
    }
  };

  (window as any).incrementCounter = () => {
    appState.value.counter++;
  };
});
