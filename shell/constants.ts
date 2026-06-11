import { EXBA } from '@core/lifecycle/exba';
import { updateResult } from '@shell/utils';

export const MENU_CATEGORIES = [
  {
    id: 'component-examples',
    label: 'Component Examples',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: '🛠️',
        code: `// Settings`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-settings></exba-settings>';
        },
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
        code: `// Profile`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container) container.innerHTML = '<exba-profile></exba-profile>';
        },
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: '📊',
        code: `// Analytics`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-analytics></exba-analytics>';
        },
      },
      {
        id: 'terminal',
        label: 'Terminal',
        icon: '💻',
        code: `// Terminal`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-terminal></exba-terminal>';
        },
      },
      {
        id: 'kanban',
        label: 'Kanban',
        icon: '📋',
        code: `// Kanban`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container) container.innerHTML = '<exba-kanban></exba-kanban>';
        },
      },
      {
        id: 'activity',
        label: 'Activity Feed',
        icon: '🔔',
        code: `// Activity Feed`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-activity-feed></exba-activity-feed>';
        },
      },
      {
        id: 'accordion',
        label: 'Accordion',
        icon: '🗂️',
        code: `// Accordion`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-accordion></exba-accordion>';
        },
      },
      {
        id: 'drawer',
        label: 'Drawer',
        icon: '📥',
        code: `// Drawer`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container) container.innerHTML = '<exba-drawer></exba-drawer>';
        },
      },
      {
        id: 'datepicker',
        label: 'Date Picker',
        icon: '📅',
        code: `// Date Picker`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-datepicker></exba-datepicker>';
        },
      },
      {
        id: 'cytoscape-mindmap',
        label: 'Mindmap (Cytoscape)',
        icon: '🕸️',
        code: `// Cytoscape Mindmap`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML =
              '<exba-cytoscape-mindmap></exba-cytoscape-mindmap>';
        },
      },
      {
        id: 'vis-mindmap',
        label: 'Mindmap (Vis-Network)',
        icon: '🧬',
        code: `// Vis-Network Mindmap`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-vis-mindmap></exba-vis-mindmap>';
        },
      },
      {
        id: 'code-block',
        label: 'Code Block',
        icon: '📄',
        code: `// Code Block`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-code-block></exba-code-block>';
        },
      },
      {
        id: 'neofetch',
        label: 'Web Neofetch',
        icon: '🖥️',
        code: `await EXBA.callBridge('process_ir', { type: 'SystemFetch' })`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-neofetch></exba-neofetch>';
        },
      },
    ],
  },
  {
    id: 'browser-api',
    label: 'Browser API Exploration',
    items: [
      {
        id: 'api-audio',
        label: 'Web Audio',
        icon: '🔊',
        code: `// Audio API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-audio-demo></exba-audio-demo>';
        },
      },
      {
        id: 'api-canvas',
        label: 'Canvas 2D',
        icon: '🎨',
        code: `// Canvas API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-canvas-demo></exba-canvas-demo>';
        },
      },
      {
        id: 'api-storage',
        label: 'Local Storage',
        icon: '💾',
        code: `// Storage API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-storage-demo></exba-storage-demo>';
        },
      },
      {
        id: 'api-geo',
        label: 'Geolocation',
        icon: '📍',
        code: `// Geolocation API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-geo-demo></exba-geo-demo>';
        },
      },
      {
        id: 'api-fullscreen',
        label: 'Fullscreen',
        icon: '📺',
        code: `// Fullscreen API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-fullscreen-demo></exba-fullscreen-demo>';
        },
      },
      {
        id: 'api-clipboard',
        label: 'Clipboard',
        icon: '📋',
        code: `// Clipboard API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-clipboard-demo></exba-clipboard-demo>';
        },
      },
      {
        id: 'api-battery',
        label: 'Battery Status',
        icon: '🔋',
        code: `// Battery API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-battery-demo></exba-battery-demo>';
        },
      },
      {
        id: 'api-network',
        label: 'Network Info',
        icon: '📶',
        code: `// Network Information API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-network-demo></exba-network-demo>';
        },
      },
      {
        id: 'api-wake-lock',
        label: 'Wake Lock',
        icon: '🕯️',
        code: `// Screen Wake Lock API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-wake-lock-demo></exba-wake-lock-demo>';
        },
      },
      {
        id: 'api-eyedropper',
        label: 'EyeDropper',
        icon: '🧪',
        code: `// EyeDropper API`,
        action: () => {
          const container = document.getElementById('view-container');
          if (container)
            container.innerHTML = '<exba-eyedropper-demo></exba-eyedropper-demo>';
        },
      },
    ],
  },
];

/**
 * Flattened list of all menu items from all categories.
 * Used for search and global item resolution.
 */
export const MENU_ITEMS = MENU_CATEGORIES.flatMap((c) => c.items);

/**
 * Static code examples displayed in the onboarding or documentation section
 * of the application.
 */
export const CODE_EXAMPLES = [
  {
    title: 'Rust WASM Export',
    language: 'rust',
    code: `#[wasm_bindgen]\npub fn add(a: i32, b: i32) -> i32 {\n    a + b\n}`,
  },
  {
    title: 'TypeScript Bridge Call',
    language: 'typescript',
    code: `const sum = await EXBA.callBridge<number>('add', 10, 20);\nconst fib = await EXBA.callBridge<number>('fibonacci', 10);`,
  },
  {
    title: 'IR Bundle Processing',
    language: 'typescript',
    code: `const bundle = await EXBA.callBridge('process_action', 'hello');\n// WASM returns IRBundle → IRProcessor executes LLIR`,
  },
];
