import { EXBA } from '@core/lifecycle/exba';
import { updateResult } from '@shell/utils';

export const MENU_CATEGORIES = [
  {
    id: 'mini-apps-lab',
    label: 'Mini Apps Lab',
    items: [
      {
        id: 'lab-sandbox',
        label: 'Lab Sandbox',
        icon: '🧪',
        code: `// Coming Soon`,
        component: 'exba-lab-sandbox',
      }
    ],
  },
  {
    id: 'component-integration',
    label: 'Component Integration',
    items: [
      {
        id: 'cytoscape-mindmap',
        label: 'Mindmap (Cytoscape)',
        icon: '🕸️',
        code: `// Cytoscape Mindmap`,
        component: 'exba-cytoscape-mindmap',
      },
      {
        id: 'vis-mindmap',
        label: 'Mindmap (Vis-Network)',
        icon: '🧬',
        code: `// Vis-Network Mindmap`,
        component: 'exba-vis-mindmap',
      },
      {
        id: 'api-leaflet-turf',
        label: 'Leaflet + Turf.js',
        icon: '🗺️',
        code: `// Leaflet + Turf.js Integration`,
        component: 'exba-leaflet-turf',
      },
      {
        id: 'vega-lite',
        label: 'Vega-Lite Charts',
        icon: '📊',
        code: `// Vega-Lite Integration`,
        component: 'exba-vega-lite',
      },
      {
        id: 'wavesurfer',
        label: 'Audio Waveform',
        icon: '🌊',
        code: `// Wavesurfer.js Audio Player`,
        component: 'exba-wavesurfer',
      },
      {
        id: 'sqlite-explorer',
        label: 'SQLite Explorer',
        icon: '🗄️',
        code: `// sql.js SQLite Integration`,
        component: 'exba-sqlite-explorer',
      },
    ],
  },
  {
    id: 'component-examples',
    label: 'Component Examples',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '📈',
        code: `// Pure reactive component`,
        component: 'exba-dashboard',
      },
      {
        id: 'my-widget',
        label: 'My Widget',
        icon: '⚡',
        code: `// Pure reactive component`,
        component: 'exba-my-widget',
      },
      {
        id: 'my-widget',
        label: 'My Widget',
        icon: '⚡',
        code: `// Pure reactive component`,
        component: 'exba-my-widget',
      },
      {
        id: 'sample-task',
        label: 'Sample Task',
        icon: '✨',
        code: `await EXBA.callBridge('process_ir', { type: 'SampleTaskFetch' })`,
        component: 'exba-sample-task',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: '🛠️',
        code: `// Settings`,
        component: 'exba-settings',
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
        code: `// Profile`,
        component: 'exba-profile',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: '📊',
        code: `// Analytics`,
        component: 'exba-analytics',
      },
      {
        id: 'terminal',
        label: 'Terminal',
        icon: '💻',
        code: `// Terminal`,
        component: 'exba-terminal',
      },
      {
        id: 'kanban',
        label: 'Kanban',
        icon: '📋',
        code: `// Kanban`,
        component: 'exba-kanban',
      },
      {
        id: 'activity',
        label: 'Activity Feed',
        icon: '🔔',
        code: `// Activity Feed`,
        component: 'exba-activity-feed',
      },
      {
        id: 'accordion',
        label: 'Accordion',
        icon: '🗂️',
        code: `// Accordion`,
        component: 'exba-accordion',
      },
      {
        id: 'drawer',
        label: 'Drawer',
        icon: '📥',
        code: `// Drawer`,
        component: 'exba-drawer',
      },
      {
        id: 'datepicker',
        label: 'Date Picker',
        icon: '📅',
        code: `// Date Picker`,
        component: 'exba-datepicker',
      },
      {
        id: 'code-block',
        label: 'Code Block',
        icon: '📄',
        code: `// Code Block`,
        component: 'exba-code-block',
      },
      {
        id: 'neofetch',
        label: 'Web Neofetch',
        icon: '🖥️',
        code: `await EXBA.callBridge('process_ir', { type: 'SystemFetch' })`,
        component: 'exba-neofetch',
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
        component: 'exba-audio-demo',
      },
      {
        id: 'api-canvas',
        label: 'Canvas 2D',
        icon: '🎨',
        code: `// Canvas API`,
        component: 'exba-canvas-demo',
      },
      {
        id: 'api-storage',
        label: 'Local Storage',
        icon: '💾',
        code: `// Storage API`,
        component: 'exba-storage-demo',
      },
      {
        id: 'api-geo',
        label: 'Geolocation',
        icon: '📍',
        code: `// Geolocation API`,
        component: 'exba-geo-demo',
      },
      {
        id: 'api-fullscreen',
        label: 'Fullscreen',
        icon: '📺',
        code: `// Fullscreen API`,
        component: 'exba-fullscreen-demo',
      },
      {
        id: 'api-clipboard',
        label: 'Clipboard',
        icon: '📋',
        code: `// Clipboard API`,
        component: 'exba-clipboard-demo',
      },
      {
        id: 'api-battery',
        label: 'Battery Status',
        icon: '🔋',
        code: `// Battery API`,
        component: 'exba-battery-demo',
      },
      {
        id: 'api-network',
        label: 'Network Info',
        icon: '📶',
        code: `// Network Information API`,
        component: 'exba-network-demo',
      },
      {
        id: 'api-wake-lock',
        label: 'Wake Lock',
        icon: '🕯️',
        code: `// Screen Wake Lock API`,
        component: 'exba-wake-lock-demo',
      },
      {
        id: 'api-eyedropper',
        label: 'EyeDropper',
        icon: '🧪',
        code: `// EyeDropper API`,
        component: 'exba-eyedropper-demo',
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
