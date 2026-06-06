// examples/wasm-bridge/main.ts
import { BAEX } from '../../src/core/baex';

const btn = document.getElementById('call-btn');
const result = document.getElementById('result');

btn?.addEventListener('click', async () => {
  try {
    const res = await BAEX.callBridge<string>('greet', 'ExampleUser');
    if (result) result.innerText = res;
  } catch (e) {
    console.error(e);
  }
});
