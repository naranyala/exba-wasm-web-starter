import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BAEX } from '../../src/core/baex';

describe('WASM Bridge Example', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="call-btn">Call WASM</button>
      <div id="result"></div>
    `;
    BAEX.bridge = null;
  });

  it('should call bridge and update result', async () => {
    const bridgeMock = {
      call: vi.fn().mockResolvedValue('Hello, ExampleUser!'),
      on: vi.fn()
    };
    BAEX.setBridge(bridgeMock);

    const btn = document.getElementById('call-btn');
    const result = document.getElementById('result');

    btn?.addEventListener('click', async () => {
      const res = await BAEX.callBridge<string>('greet', 'ExampleUser');
      if (result) result.innerText = res;
    });

    btn?.click();
    
    // Wait for async call
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(bridgeMock.call).toHaveBeenCalledWith('greet', 'ExampleUser');
    expect(result?.innerText).toBe('Hello, ExampleUser!');
  });
});
