import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReactiveStateProxy } from '../../src/state/proxy';

describe('Counter Example', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <h1 id="counter-display">Count: 0</h1>
      <button id="inc-btn">Increment</button>
    `;
  });

  it('should update display on counter increment', async () => {
    const state = new ReactiveStateProxy(
      { count: 0 },
      {
        onPropertyUpdate: (prop, value) => {
          const display = document.getElementById('counter-display');
          if (display) display.innerText = `Count: ${value}`;
        },
      },
    );

    const btn = document.getElementById('inc-btn');
    btn?.addEventListener('click', () => {
      state.value.count++;
    });

    btn?.click();
    await new Promise((r) => setTimeout(r, 10));
    expect(document.getElementById('counter-display')?.innerText).toBe(
      'Count: 1',
    );
  });
});
