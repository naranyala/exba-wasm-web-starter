import { MENU_ITEMS, CODE_EXAMPLES } from './constants';
import { fuzzySearch, toggleSection } from './utils';

export function renderTabBar(tabs: Map<string, any>, activeTabId: string | null) {
  const tabBar = document.querySelector('tab-bar') as any;
  if (tabBar) {
    tabBar.setAttribute('tabs', JSON.stringify(Array.from(tabs.entries()).map(([id, { label }]) => ({ id, label }))));
    if (activeTabId) tabBar.setActive(activeTabId);
  }
}

export function renderMenu(items: typeof MENU_ITEMS) {
  const grid = document.querySelector<HTMLDivElement>('#menu-grid');
  if (!grid) return;
  grid.innerHTML = items.map(item => `
    <div class="group flex flex-col items-center justify-center aspect-square p-6 bg-zinc-800 border border-zinc-700 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:bg-zinc-700 hover:border-indigo-500 hover:shadow-xl" onclick="window.dispatchMenuAction('${item.id}')">
      <div class="text-4xl mb-3 group-hover:scale-110 transition-transform">${item.icon}</div>
      <div class="text-sm font-medium text-zinc-300 group-hover:text-white">${item.label}</div>
    </div>
  `).join('');
}

export function renderExamples() {
  const container = document.querySelector<HTMLDivElement>('#examples-container');
  if (!container) return;
  container.innerHTML = CODE_EXAMPLES.map(ex => `
    <div class="mb-6 bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
      <div class="px-4 py-2 bg-zinc-700 text-xs font-mono text-zinc-400 flex justify-between items-center">
        <span>${ex.title}</span>
        <span class="uppercase">${ex.language}</span>
      </div>
      <pre class="p-4 overflow-x-auto text-sm font-mono text-indigo-300 bg-zinc-900"><code>${ex.code}</code></pre>
    </div>
  `).join('');
}

export function initApp() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  app.innerHTML = `
    <!-- Native Web Component Tab Bar -->
    <tab-bar id="main-tab-bar"></tab-bar>
    <div class="p-4 flex flex-col items-center gap-4 bg-zinc-800 border-b border-zinc-700">
      <baex-greeting name="Developer"></baex-greeting>
      <div id="greeting-box" class="text-sm font-mono text-zinc-400">IR Output will appear here...</div>
      <div id="state-counter" class="text-xs text-indigo-300">Counter: 0</div>
      <div class="flex gap-2">
        <button 
          onclick="window.triggerBaexAction('hello')"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-500 transition-colors"
        >
          Trigger IR Action
        </button>
        <button 
          onclick="window.incrementCounter()"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-500 transition-colors"
        >
          Increment State
        </button>
        <button 
          onclick="window.triggerBaexAction('error_test')"
          class="px-4 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-500 transition-colors"
        >
          Simulate Anomaly
        </button>
      </div>
    </div>

    <div class="min-h-screen bg-zinc-900 text-zinc-100 p-0 pt-16">
      <div class="w-full max-w-5xl mx-auto p-8" id="main-content">
        <!-- Main Content Area -->
        <div id="view-container">
          <div class="mb-8 flex flex-col items-center gap-4">
            <input 
              type="text" 
              id="menu-search" 
              class="w-full max-w-md px-4 py-3 text-lg rounded-xl border-2 border-zinc-700 bg-zinc-800 focus:border-indigo-500 outline-none transition-all placeholder-zinc-500" 
              placeholder="Search tools..." 
              autofocus 
            />
            <div id="execution-log" class="text-sm font-mono text-indigo-400 opacity-50 transition-opacity min-h-[1.5rem]">
              Click a module to see output here
            </div>
          </div>

          <div class="space-y-4">
            <div class="border border-zinc-700 rounded-2xl overflow-hidden bg-zinc-800/50">
              <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors" onclick="window.toggleSection('wasm-section')">
                <h2 class="text-xl font-semibold flex items-center gap-2"><span class="text-indigo-400">⚡</span> Wasm & Native Modules</h2>
                <span id="arrow-wasm-section" class="transition-transform duration-200 text-zinc-500">▼</span>
              </div>
              <div id="wasm-section" class="p-6 border-t border-zinc-700">
                <div id="menu-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6"></div>
              </div>
            </div>

            <div class="border border-zinc-700 rounded-2xl overflow-hidden bg-zinc-800/50">
              <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors" onclick="window.toggleSection('examples-section')">
                <h2 class="text-xl font-semibold flex items-center gap-2"><span class="text-emerald-400">📄</span> Code Examples</h2>
                <span id="arrow-examples-section" class="transition-transform duration-200 text-zinc-500">▼</span>
              </div>
              <div id="examples-section" class="p-6 border-t border-zinc-700 hidden">
                <div id="examples-container" class="space-y-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <status-bar id="app-status-bar"></status-bar>
  `;

  const searchInput = document.querySelector<HTMLInputElement>('#menu-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      const filtered = fuzzySearch(query, MENU_ITEMS);
      renderMenu(filtered);
    });
  }

  (window as any).toggleSection = toggleSection;

  renderMenu(MENU_ITEMS);
  renderExamples();
}
