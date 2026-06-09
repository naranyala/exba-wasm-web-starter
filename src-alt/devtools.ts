import { css } from 'goober';
import { WasmBridge } from './framework/WasmBridge.js';
import { modalBackdrop, modalContent } from './styles.js';

/**
 * Styles for the BAEX Developer Tools inspector.
 * Uses a dark-themed, mono-spaced aesthetic to mimic system logs.
 */
export const devToolsStyles = {
  header: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--zinc-700);
    margin-bottom: 1rem;
    h3 { margin: 0; color: var(--indigo-500); font-family: 'SF Mono', 'Fira Code', monospace; font-size: 1rem; }
  `,
  layerSection: css`
    margin-bottom: 1rem;
    padding: 0.875rem;
    background: var(--zinc-800);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--indigo-500);
    h4 { margin: 0 0 0.5rem; font-size: 0.75rem; color: var(--zinc-400); text-transform: uppercase; letter-spacing: 0.05em; }
    .layer-content { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.75rem; color: var(--zinc-300); line-height: 1.5; }
    .tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.65rem;
      margin-right: 4px;
      background: var(--zinc-700);
    }
    .tag-wasm { color: #facc15; }
    .tag-rust { color: #f97316; }
    .tag-native { color: #22c55e; }
  `,
  layerDetail: css`
    display: flex;
    justify-content: space-between;
    padding: 3px 0;
    border-bottom: 1px solid rgba(63, 63, 70, 0.2);
    &:last-child { border-bottom: none; }
    .label { color: var(--zinc-400); }
    .value { color: var(--zinc-100); }
  `,
};

/**
 * Renders and displays the BAEX Developer Tools inspector.
 * The inspector provides a visual trace of the IR pipeline and a listing of available Bridge APIs.
 */
export function showBaexDevTools() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) return;

  const backdrop = document.createElement('div');
  backdrop.className = modalBackdrop;
  backdrop.id = 'devtools-backdrop';

  const content = document.createElement('div');
  content.className = modalContent;

  const irData = {
    jsLayer: {
      framework: 'BAEX-SPA v1.0',
      reactivity: 'Proxy-based Deep State',
      rendering: 'Declarative Template String',
      bridge: 'IPC-Invoke / Wasm-Bridge',
    },
    wasmLayer: {
      module: 'wasm_rust.wasm',
      target: 'web',
      primitives: Object.keys(WasmBridge).reduce(
        (acc, cat) => acc + Object.keys((WasmBridge as any)[cat]).length,
        0,
      ),
      exportType: 'ESM',
    },
    rustLayer: {
      compiler: 'rustc 1.75+',
      optimizations: 'release (LTO enabled)',
      memory: 'Linear Wasm Memory',
      core_crates: ['napi', 'rusqlite', 'serde'],
    },
    nativeLayer: {
      ffi: 'napi-rs / Node-API',
      db_engine: 'SQLite 3.x (Bundled)',
      storage: 'app.db (userData)',
      binary: 'index.node',
    },
  };

  const createLayerHtml = (title: string, data: any, tagClass: string) => `
    <div class="${devToolsStyles.layerSection}">
      <h4>${title}</h4>
      <div class="layer-content">
        <span class="tag ${tagClass}">L${title.split(' ')[0]}</span>
        ${Object.entries(data)
          .map(
            ([k, v]) => `
          <div class="${devToolsStyles.layerDetail}">
            <span class="label">${k}:</span>
            <span class="value">${v}</span>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>
  `;

  const createApiHtml = () => {
    const categories = Object.entries(WasmBridge);
    return categories
      .map(
        ([catName, methods]) => `
      <div class="${devToolsStyles.layerSection}" style="border-left-color: #a855f7;">
        <h4>API: ${catName.toUpperCase()}</h4>
        <div class="layer-content">
          ${Object.entries(methods)
            .map(([methodName, methodFn]) => {
              const fnStr = methodFn.toString();
              const argsMatch = fnStr.match(/\\((.*?)\\)/);
              const args = argsMatch ? argsMatch[1] : '';
              return `
              <div class="${devToolsStyles.layerDetail}">
                <span class="label" style="color: #a855f7; font-weight: bold;">${methodName}(${args})</span>
                <span class="value" style="font-size: 0.65rem; opacity: 0.6;">async Promise&lt;any&gt;</span>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    `,
      )
      .join('');
  };

  content.innerHTML = `
    <div class="${devToolsStyles.header}">
      <h3>BAEX IR Inspector</h3>
      <button id="close-devtools" style="background: none; border: none; color: var(--zinc-400); cursor: pointer; font-size: 1.5rem; padding: 0.25rem; line-height: 1;">&times;</button>
    </div>
    <div style="overflow-y: auto;">
      <div style="margin-bottom: 1.5rem;">
        ${createLayerHtml('JavaScript Layer', irData.jsLayer, 'tag-wasm')}
        ${createLayerHtml('Wasm Bridge', irData.wasmLayer, 'tag-wasm')}
        ${createLayerHtml('Rust Core', irData.rustLayer, 'tag-rust')}
        ${createLayerHtml('Native FFI', irData.nativeLayer, 'tag-native')}
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 0.8rem; color: var(--zinc-400; margin-bottom: 0.75rem; font-family: 'SF Mono', 'Fira Code', monospace;">BRIDGE API</h3>
        ${createApiHtml()}
      </div>

      <div class="${devToolsStyles.layerSection}" style="border-left-color: var(--red-500);">
        <h4>Pipeline Trace</h4>
        <div class="layer-content" style="text-align: center; font-size: 0.7rem; color: var(--zinc-400);">
          JS → IPC → Native-Rust → SQLite → FileSystem
        </div>
      </div>
    </div>
  `;

  backdrop.appendChild(content);
  app.appendChild(backdrop);

  content
    .querySelector('#close-devtools')
    ?.addEventListener('click', () => backdrop.remove());
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove();
  });
}
