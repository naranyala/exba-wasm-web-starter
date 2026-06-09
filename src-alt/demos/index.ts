import L from 'leaflet';

/**
 * Definition of a demo item in the application's showcase.
 */
export interface DemoItem {
  /** Icon representing the demo (e.g., emoji). */
  icon: string;
  /** Display label for the demo. */
  label: string;
  /** Unique identifier for the demo. */
  id: string;
  /** Activation function that renders the demo into the dynamic view. */
  action: () => void;
}

/**
 * Registry of all available demo components and tools.
 */
export const demoRegistry: DemoItem[] = [
  {
    icon: '🗺️',
    label: 'Leaflet Map',
    id: 'leaflet-map',
    action: () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML =
        '<div id="map" style="height: 500px; border-radius: var(--radius-lg); overflow: hidden;"></div>';
      const map = L.map('map').setView([51.505, -0.09], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
    },
  },
  {
    icon: '💬',
    label: 'Modal Dialog',
    id: 'modal-demo',
    action: () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = `
        <div style="max-width: 32rem; margin: 2rem auto; text-align: center;">
          <h2 style="font-size: 1.25rem; font-weight: 700; margin: 0 0 1rem;">Modal Demo</h2>
          <p style="color: var(--zinc-400); font-size: 0.875rem; margin-bottom: 1.5rem;">Click the button to open a dialog modal.</p>
          <button id="demo-open-modal" class="addButton" style="padding: 0.625rem 1.5rem;">Open Modal</button>
        </div>
        <div id="demo-modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; display:none; align-items:center; justify-content:center; padding:1rem;">
          <div style="background:var(--zinc-900); border:1px solid var(--zinc-700); border-radius:var(--radius-xl); padding:2rem; max-width:28rem; width:100%; text-align:center; box-shadow:0 25px 50px rgba(0,0,0,0.5);">
            <h3 style="margin:0 0 0.75rem; font-size:1.125rem; color:var(--zinc-100);">Hello from Modal!</h3>
            <p style="color:var(--zinc-400); font-size:0.875rem; margin-bottom:1.5rem;">This is a simple modal dialog built with inline HTML and styles.</p>
            <button id="demo-close-modal" class="crudButton" style="padding:0.5rem 1.25rem;">Close</button>
          </div>
        </div>
      `;
      requestAnimationFrame(() => {
        const openBtn = view.querySelector('#demo-open-modal');
        const overlay = view.querySelector('#demo-modal-overlay');
        const closeBtn = view.querySelector('#demo-close-modal');
        if (openBtn && overlay) {
          openBtn.onclick = () => {
            overlay.style.display = 'flex';
          };
          closeBtn!.onclick = () => {
            overlay.style.display = 'none';
          };
          overlay.onclick = (e: any) => {
            if (e.target === overlay) overlay.style.display = 'none';
          };
        }
      });
    },
  },
  {
    icon: '🔔',
    label: 'Toast Notifications',
    id: 'toast-demo',
    action: () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = `
        <div style="max-width: 32rem; margin: 2rem auto; text-align: center;">
          <h2 style="font-size: 1.25rem; font-weight: 700; margin: 0 0 1rem;">Toast Notifications</h2>
          <p style="color: var(--zinc-400); font-size: 0.875rem; margin-bottom: 1.5rem;">Click a button to trigger a toast notification.</p>
          <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap;">
            <button id="toast-success" style="padding:0.5rem 1rem; border-radius:var(--radius-md); border:1px solid #22c55e; background:#22c55e; color:white; font-weight:500; cursor:pointer;">Success</button>
            <button id="toast-error" style="padding:0.5rem 1rem; border-radius:var(--radius-md); border:1px solid var(--red-500); background:var(--red-500); color:white; font-weight:500; cursor:pointer;">Error</button>
            <button id="toast-info" style="padding:0.5rem 1rem; border-radius:var(--radius-md); border:1px solid var(--indigo-500); background:var(--indigo-500); color:white; font-weight:500; cursor:pointer;">Info</button>
          </div>
        </div>
        <div id="toast-container" style="position:fixed; bottom:3rem; right:1rem; display:flex; flex-direction:column; gap:0.5rem; z-index:999; pointer-events:none;"></div>
      `;
      function showToast(message: string, type: string) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const bg =
          type === 'success'
            ? '#22c55e'
            : type === 'error'
              ? '#ef4444'
              : '#6366f1';
        const el = document.createElement('div');
        el.textContent = message;
        Object.assign(el.style, {
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: bg,
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: '500',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          transition: 'opacity 0.3s, transform 0.3s',
          opacity: '0',
          transform: 'translateX(1rem)',
          pointerEvents: 'auto',
        });
        container.appendChild(el);
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
        });
        setTimeout(() => {
          el.style.opacity = '0';
          el.style.transform = 'translateX(1rem)';
          setTimeout(() => el.remove(), 300);
        }, 2500);
      }
      requestAnimationFrame(() => {
        view
          .querySelector('#toast-success')
          ?.addEventListener('click', () =>
            showToast('Operation completed successfully!', 'success'),
          );
        view
          .querySelector('#toast-error')
          ?.addEventListener('click', () =>
            showToast('Something went wrong. Please try again.', 'error'),
          );
        view
          .querySelector('#toast-info')
          ?.addEventListener('click', () =>
            showToast('Here is some useful information.', 'info'),
          );
      });
    },
  },
  {
    icon: '⏳',
    label: 'Progress Bars',
    id: 'progress-demo',
    action: () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = `
        <div style="max-width: 32rem; margin: 2rem auto;">
          <h2 style="font-size: 1.25rem; font-weight: 700; text-align:center; margin: 0 0 1.5rem;">Progress Bars</h2>
          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            <div>
              <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--zinc-400); margin-bottom:0.375rem;">
                <span>Determinate</span><span id="progress-label">0%</span>
              </div>
              <div style="height:0.625rem; background:var(--zinc-800); border-radius:999px; overflow:hidden; border:1px solid var(--zinc-700);">
                <div id="progress-fill" style="height:100%; width:0%; background:linear-gradient(90deg, var(--indigo-500), #818cf8); border-radius:999px; transition:width 0.5s ease;"></div>
              </div>
            </div>
            <div style="display:flex; gap:0.75rem; justify-content:center;">
              <button id="progress-start" class="crudButton" style="padding:0.5rem 1rem;">Start</button>
              <button id="progress-reset" class="crudButton" style="padding:0.5rem 1rem;">Reset</button>
            </div>
            <div>
              <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--zinc-400); margin-bottom:0.375rem;">
                <span>Indeterminate</span>
              </div>
              <div style="height:0.625rem; background:var(--zinc-800); border-radius:999px; overflow:hidden; border:1px solid var(--zinc-700);">
                <div id="progress-indeterminate" style="height:100%; width:40%; background:linear-gradient(90deg, transparent, var(--indigo-500), transparent); border-radius:999px;"></div>
              </div>
            </div>
            <div style="display:flex; gap:0.75rem; justify-content:center;">
              <button id="indeterminate-toggle" class="crudButton" style="padding:0.5rem 1rem;">Toggle Animation</button>
            </div>
          </div>
        </div>
      `;
      requestAnimationFrame(() => {
        let interval: any = null;
        view.querySelector('#progress-start')?.addEventListener('click', () => {
          if (interval) return;
          const fill = view.querySelector('#progress-fill') as HTMLElement;
          const label = view.querySelector('#progress-label') as HTMLElement;
          let width = parseFloat(fill.style.width) || 0;
          interval = setInterval(() => {
            width = Math.min(width + 2, 100);
            fill.style.width = width + '%';
            label.textContent = width + '%';
            if (width >= 100) {
              clearInterval(interval);
              interval = null;
            }
          }, 60);
        });
        view.querySelector('#progress-reset')?.addEventListener('click', () => {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
          const fill = view.querySelector('#progress-fill') as HTMLElement;
          const label = view.querySelector('#progress-label') as HTMLElement;
          fill.style.width = '0%';
          label.textContent = '0%';
        });
        view
          .querySelector('#indeterminate-toggle')
          ?.addEventListener('click', () => {
            const bar = view.querySelector(
              '#progress-indeterminate',
            ) as HTMLElement;
            bar.style.animation = bar.style.animation
              ? 'none'
              : 'indeterminate 1.5s ease-in-out infinite';
          });
        const style = document.createElement('style');
        style.textContent =
          '@keyframes indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(350px); } }';
        view.appendChild(style);
      });
    },
  },
  {
    icon: '🔰',
    label: 'Accordion Demo',
    id: 'accordion-demo',
    action: () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = '<accordion-demo></accordion-demo>';
    },
  },
  {
    icon: '🌳',
    label: 'Treeview Demo',
    id: 'treeview-demo',
    action: () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = '<treeview-demo></treeview-demo>';
    },
  },
  {
    icon: '📊',
    label: 'DataTable Demo',
    id: 'datatable-demo',
    action: () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = '<datatable-demo></datatable-demo>';
    },
  },
  {
    icon: '🧊',
    label: '3D Cube Demo',
    id: 'cube-demo',
    action: () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = '<cube-demo></cube-demo>';
    },
  },
  {
    icon: '🪄',
    label: 'Wizard Demo',
    id: 'wizard-demo',
    action: () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = '<wizard-demo></wizard-demo>';
    },
  },
  {
    icon: '📂',
    label: 'Drawer Demo',
    id: 'drawer-demo',
    action: () => {
      const view = document.getElementById('dynamic-view');
      if (!view) return;
      view.style.display = 'block';
      view.innerHTML = '<drawer-demo></drawer-demo>';
    },
  },
];

/**
 * Retrieves the activation function for a given demo ID.
 *
 * @param id - The unique identifier of the demo.
 * @returns The action function if found, otherwise null.
 */
export function rebuildDemoAction(id: string): (() => void) | null {
  const demo = demoRegistry.find((d) => d.id === id);
  return demo ? demo.action : null;
}
