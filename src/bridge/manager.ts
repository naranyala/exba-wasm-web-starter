import { EXBA } from '@core/lifecycle/exba';
import type { InitOutput } from '../../public/wasm/wasm_logic';
import init from '../../public/wasm/wasm_logic';

let cachedCommands: any[] = [];

const WASM_METHODS = [
  { name: 'greet', description: 'Displays an alert greeting.' },
  {
    name: 'process_action',
    description: 'Processes an action and dispatches IR.',
  },
  {
    name: 'process_ir',
    description: 'Processes a raw IR command JSON string.',
  },
  { name: 'add', description: 'Adds two integers.' },
  { name: 'fibonacci', description: 'Calculates the Nth Fibonacci number.' },
  {
    name: 'wasm_get_app_state',
    description: 'Retrieves the global app state from WASM.',
  },
  {
    name: 'wasm_update_app_state',
    description: 'Updates the global app state in WASM.',
  },
] as const;

/**
 * Returns a list of all methods exposed by the WASM module through the bridge.
 * Querying from the WASM reflection API if available, otherwise falling back to static metadata.
 * @returns Array of method definitions with names and descriptions.
 */
export function getExposedFunctions() {
  if (cachedCommands && cachedCommands.length > 0) {
    return cachedCommands.map((c) => ({
      name: c.name,
      description: c.description,
    }));
  }
  return WASM_METHODS.map((m) => ({
    name: m.name,
    description: m.description,
  }));
}

/**
 * Initializes the WASM engine and sets up the communication bridge.
 *
 * This function:
 * 1. Loads and initializes the WASM module.
 * 2. Configures the EXBA global bridge with a call handler.
 * 3. Maps high-level bridge calls to specific WASM exports.
 *
 * @throws Error if the WASM module fails to load or initialize.
 */
export async function setupBridge() {
  try {
    const module = await EXBA.initWasm(init);
    console.log('Wasm Engine initialized');

    const wasm = module as any;
    if (wasm.wasm_get_exposed_commands) {
      try {
        cachedCommands = wasm.wasm_get_exposed_commands();
      } catch (err) {
        console.error('Failed to parse exposed commands from WASM:', err);
      }
    }

    EXBA.setBridge({
      call: async (method, ...args) => {
        switch (method) {
          case 'greet': {
            wasm.greet(args[0]);
            return `Greeted ${args[0]}`;
          }
          case 'process_action': {
            const ir = wasm.process_action(args[0]);
            EXBA.dispatchIR(ir);
            return ir;
          }
          case 'process_ir': {
            console.log('Bridge process_ir called with:', args[0]);
            return wasm.process_ir(args[0]);
          }
          case 'add': {
            return wasm.add(args[0], args[1]);
          }
          case 'fibonacci': {
            return wasm.fibonacci(args[0]);
          }
          case 'wasm_get_app_state': {
            return wasm.wasm_get_app_state();
          }
          case 'wasm_update_app_state': {
            return wasm.wasm_update_app_state(args[0]);
          }
          default:
            throw new Error(
              `Unknown bridge method: "${method}". Available: ${WASM_METHODS.map((m) => m.name).join(', ')}`,
            );
        }
      },
      on: (event, callback) => {
        EXBA.addEventListener(event, callback);
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Failed to load WASM module: ${msg}`);
  }
}
