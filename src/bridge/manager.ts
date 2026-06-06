import { BAEX } from '../core/baex';
import init, { greet, process_action } from '../../public/wasm/wasm_logic';

export async function setupBridge() {
  try {
    await BAEX.initWasm(init);
    console.log('Wasm Engine initialized');
    (window as any).wasmGreet = greet;

    // Initialize BAEX Bridge
    BAEX.setBridge({
      call: async (method, ...args) => {
        if (method === 'greet') {
          greet(args[0]);
          return `Greeted ${args[0]}`;
        }
        if (method === 'process_action') {
          const ir = process_action(args[0]);
          BAEX.dispatchIR(ir);
          return ir;
        }
        throw new Error(`Method ${method} not found in bridge`);
      },
      on: (event, callback) => {
        console.log(`Listening for ${event}...`);
      }
    });
  } catch (e) {
    console.error('Wasm load error:', e);
    throw e;
  }
}
