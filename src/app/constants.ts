import { EXBA } from '../core/exba';
import { updateResult } from './utils';

export const MENU_ITEMS = [
  {
    id: 'wasm-add',
    label: 'Wasm Add',
    icon: '➕',
    code: `await EXBA.callBridge('add', 10, 20)`,
    action: async () => {
      const res = await EXBA.callBridge<number>('add', 10, 20);
      updateResult(
        `[WASM] 10 + 20 = ${res}`,
        `await EXBA.callBridge('add', 10, 20)`,
      );
    },
  },
  {
    id: 'wasm-fibonacci',
    label: 'Wasm Fibonacci',
    icon: '🌀',
    code: `await EXBA.callBridge('fibonacci', 10)`,
    action: async () => {
      const fib = await EXBA.callBridge<number>('fibonacci', 10);
      updateResult(
        `[WASM] Fibonacci(10) = ${fib}`,
        `await EXBA.callBridge('fibonacci', 10)`,
      );
    },
  },
  {
    id: 'wasm-greet',
    label: 'Wasm Greet',
    icon: '👋',
    code: `await EXBA.callBridge('greet', 'Developer')`,
    action: async () => {
      await EXBA.callBridge('greet', 'Developer');
      updateResult(
        '[WASM] Greeted Developer (check alert)',
        `await EXBA.callBridge('greet', 'Developer')`,
      );
    },
  },
  {
    id: 'hello-action',
    label: 'Hello Action',
    icon: '⚡',
    code: `await EXBA.callBridge('process_action', 'hello')`,
    action: async () => {
      await EXBA.callBridge('process_action', 'hello');
      updateResult(
        '[IR] Processed "hello" action — check greeting box',
        `await EXBA.callBridge('process_action', 'hello')`,
      );
    },
  },
  {
    id: 'error-test',
    label: 'Simulate Anomaly',
    icon: '🔥',
    code: `await EXBA.callBridge('process_action', 'error_test')`,
    action: async () => {
      await EXBA.callBridge('process_action', 'error_test');
      updateResult(
        '[IR] Triggered anomaly — check console',
        `await EXBA.callBridge('process_action', 'error_test')`,
      );
    },
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '🛠️',
    code: `// Settings`,
    action: () => updateResult('Settings Panel', '// Settings'),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: '👤',
    code: `// Profile`,
    action: () => updateResult('Profile Panel', '// Profile'),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📊',
    code: `// Analytics`,
    action: () => updateResult('Analytics Panel', '// Analytics'),
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: '💻',
    code: `// Terminal`,
    action: () => updateResult('Terminal Panel', '// Terminal'),
  },
];

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
