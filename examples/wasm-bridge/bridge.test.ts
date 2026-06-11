import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXBA } from "@core/lifecycle/exba";


describe('WASM Bridge Example', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="call-btn">Call WASM</button>
      <div id="result"></div>
    `;
    EXBA.bridge = null;
  });

  it('should call bridge and update result', async () => {
    const bridgeMock = {
      call: vi.fn().mockResolvedValue('Hello, ExampleUser!'),
      on: vi.fn(),
    };
    EXBA.setBridge(bridgeMock);

    const btn = document.getElementById('call-btn');
    const result = document.getElementById('result');

    btn?.addEventListener('click', async () => {
      const res = await EXBA.callBridge<string>('greet', 'ExampleUser');
      if (result) result.innerText = res;
    });

    btn?.click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(bridgeMock.call).toHaveBeenCalledWith('greet', 'ExampleUser');
    expect(result?.innerText).toBe('Hello, ExampleUser!');
  });
});
