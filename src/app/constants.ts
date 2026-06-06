import { updateResult } from './utils';

export const MENU_ITEMS = [
  { 
    id: 'zig-backend', 
    label: 'Native Engine', 
    icon: '⚙️', 
    action: async () => {
      const version = await (window as any).ipcRenderer.invoke('zig-engine:version');
      const sum = await (window as any).ipcRenderer.invoke('zig-engine:add', [10, 20]);
      updateResult(`[Native Zig] Version: ${version}\nCalculation: 10 + 20 = ${sum}`);
    } 
  },
  { 
    id: 'wasm-math', 
    label: 'Wasm Math', 
    icon: '⚡', 
    action: () => {
      const res = (window as any).add(10, 32);
      const fib = (window as any).fibonacci(7);
      updateResult(`[Wasm] 10 + 32 = ${res}\nFibonacci(7) = ${fib}`);
    } 
  },
  { 
    id: 'wasm-extended', 
    label: 'Extended API', 
    icon: '🌐', 
    action: () => {
      (window as any).wasmGreet('Developer');
      updateResult(`[Wasm Extended] Check the browser tab title and console!`);
    } 
  },
  { id: 'settings', label: 'Settings', icon: '🛠️', action: () => updateResult('Settings Panel') },
  { id: 'profile', label: 'Profile', icon: '👤', action: () => updateResult('Profile Panel') },
  { id: 'analytics', label: 'Analytics', icon: '📊', action: () => updateResult('Analytics Panel') },
  { id: 'messages', label: 'Messages', icon: '✉️', action: () => updateResult('Messages Panel') },
  { id: 'cloud', label: 'Cloud Storage', icon: '☁️', action: () => updateResult('Cloud Panel') },
  { id: 'security', label: 'Security', icon: '🛡️', action: () => updateResult('Security Panel') },
  { id: 'help', label: 'Help Center', icon: '❓', action: () => updateResult('Help Panel') },
  { id: 'terminal', label: 'Terminal', icon: '💻', action: () => updateResult('Terminal Panel') },
  { id: 'network', label: 'Network', icon: '🌐', action: () => updateResult('Network Panel') },
  { id: 'files', label: 'File Manager', icon: '📂', action: () => updateResult('Files Panel') },
  { id: 'database', label: 'Database', icon: '🗄️', action: () => updateResult('Database Panel') },
];

export const CODE_EXAMPLES = [
  { 
    title: 'Zig Wasm Export', 
    language: 'zig', 
    code: `export fn add(a: i32, b: i32) i32 {\n    return a + b;\n}` 
  },
  { 
    title: 'Wasm Fetch & Instantiate', 
    language: 'typescript', 
    code: `const response = await fetch('./main.wasm');\nconst bytes = await response.arrayBuffer();\nconst { instance } = await WebAssembly.instantiate(bytes);` 
  },
  { 
    title: 'Tailwind Grid', 
    language: 'html', 
    code: `<div class="grid grid-cols-4 gap-4">\n  <div class="bg-zinc-800 p-4">Item</div>\n</div>` 
  },
];
