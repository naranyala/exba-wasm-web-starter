// examples/counter/main.ts
import { BAEX } from '../../src/core/baex';
import { ReactiveStateProxy } from '../../src/state/proxy';

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
