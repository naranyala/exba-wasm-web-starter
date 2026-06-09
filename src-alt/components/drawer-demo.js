import { defineComponent } from '../framework/Component';

defineComponent({
  name: 'drawer-demo',
  initialState: {
    isOpen: false,
  },
  reducer: (state, action) => {
    if (action.type === 'TOGGLE') {
      return { ...state, isOpen: !state.isOpen };
    }
    return state;
  },
  render: (state) => {
    const menuItems = [
      { icon: '⚙️', label: 'Settings', color: '#6366f1' },
      { icon: '👤', label: 'Profile', color: '#ec4899' },
      { icon: '🔔', label: 'Alerts', color: '#f59e0b' },
      { icon: '🔒', label: 'Security', color: '#10b981' },
      { icon: '📁', label: 'Files', color: '#3b82f6' },
      { icon: '🛠️', label: 'Tools', color: '#8b5cf6' },
      { icon: '📊', label: 'Analytics', color: '#ef4444' },
      { icon: '💬', label: 'Feedback', color: '#64748b' },
    ];

    return `
      <style>
        :host {
          display: block;
          height: 400px;
          position: relative;
          overflow: hidden;
          font-family: inherit;
        }
        .trigger-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 1rem;
        }
        .btn-open {
          padding: 0.75rem 1.5rem;
          background: var(--indigo-500);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .drawer-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          opacity: ${state.isOpen ? '1' : '0'};
          visibility: ${state.isOpen ? 'visible' : 'hidden'};
          transition: all 0.3s;
          z-index: 10;
        }
        .drawer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--zinc-800);
          border-top: 1px solid var(--zinc-700);
          border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
          padding: 1.5rem;
          transform: translateY(${state.isOpen ? '0' : '100%'});
          transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
          z-index: 20;
          max-height: 80%;
          overflow-y: auto;
        }
        .drawer-handle {
          width: 40px;
          height: 4px;
          background: var(--zinc-600);
          border-radius: 2px;
          margin: 0 auto 1.5rem;
          cursor: pointer;
        }
        .drawer-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .drawer-header h3 {
          font-size: 1.125rem;
          color: var(--zinc-100);
          margin: 0;
        }
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
        }
        .menu-card {
          background: var(--zinc-900);
          border: 1px solid var(--zinc-700);
          border-radius: var(--radius-lg);
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .menu-card:hover {
          background: var(--zinc-700);
          transform: translateY(-2px);
          border-color: var(--zinc-500);
        }
        .card-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(0,0,0,0.2);
        }
        .card-label {
          font-size: 0.75rem;
          color: var(--zinc-400);
          font-weight: 500;
        }
      </style>
      <div class="trigger-container">
        <button class="btn-open" id="drawer-trigger">Open Menu</button>
        <p style="color: var(--zinc-500); font-size: 0.875rem;">Click to reveal the action menu</p>
      </div>
      <div class="drawer-overlay" id="drawer-overlay"></div>
      <div class="drawer">
        <div class="drawer-handle" id="drawer-close-handle"></div>
        <div class="drawer-header">
          <h3>Quick Actions</h3>
        </div>
        <div class="menu-grid">
          ${menuItems
            .map(
              (item) => `
            <div class="menu-card" data-item="${item.label}">
              <div class="card-icon" style="color: ${item.color}">${item.icon}</div>
              <div class="card-label">${item.label}</div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;
  },
  hooks: {
    onUpdate: (instance) => {
      const root = instance.shadowRoot;

      root.getElementById('drawer-trigger')?.addEventListener('click', () => {
        instance.dispatch({ type: 'TOGGLE' });
      });

      root.getElementById('drawer-overlay')?.addEventListener('click', () => {
        instance.dispatch({ type: 'TOGGLE' });
      });

      root
        .getElementById('drawer-close-handle')
        ?.addEventListener('click', () => {
          instance.dispatch({ type: 'TOGGLE' });
        });

      root.querySelectorAll('.menu-card').forEach((card) => {
        card.onclick = () => {
          const label = card.getAttribute('data-item');
          alert(`Action triggered: ${label}`);
          instance.dispatch({ type: 'TOGGLE' });
        };
      });
    },
  },
});
