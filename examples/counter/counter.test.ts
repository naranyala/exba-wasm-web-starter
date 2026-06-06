import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveStateProxy } from '../../src/state/proxy';

describe('Counter Example', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <h1 id="counter-display">Count: 0</h1>
      <button id="inc-btn">Increment</button>
    `;
  });

  it('should update display on counter increment', () => {
    const state = new ReactiveStateProxy({ count: 0 }, {
      onPropertyUpdate: (prop, value) => {
        const display = document.getElementById('counter-display');
        if (display) display.innerText = `Count: ${value}`;
      }
    });

    const btn = document.getElementById('inc-btn');
    btn?.addEventListener('click', () => {
      state.value.count++;
    });

    btn?.click();
    expect(document.getElementById('counter-display')?.innerText).toBe('Count: 1');
  });
});
