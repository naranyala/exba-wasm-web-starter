import { beforeEach, describe, expect, it } from 'vitest';
import { EXBA } from './core/exba';
import { ReactiveStateProxy } from './state/proxy';

class MockComponent extends HTMLElement {
  renderCount = 0;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  render() {
    this.renderCount++;
    return `<div>Mock</div>`;
  }
  update() {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = this.render();
    }
  }
  subscribeToState(key: string, cb: (val: any) => void) {
    EXBA.subscribe(key, (val) => {
      cb(val);
      this.update();
    });
  }
}

if (!customElements.get('mock-component')) {
  customElements.define('mock-component', MockComponent);
}

describe('EXBA Reactivity Model Validation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    EXBA.subscriptions.clear();
    EXBA.DEBUG = false;
  });

  it('should trigger component re-render on state change via subscription', async () => {
    const comp = new MockComponent();
    document.body.appendChild(comp);

    const state = new ReactiveStateProxy({ count: 0 });

    comp.subscribeToState('count', () => {});

    expect(comp.renderCount).toBe(0);

    state.value.count = 1;
    await new Promise((r) => setTimeout(r, 10));

    expect(comp.renderCount).toBe(1);

    state.value.count = 2;
    await new Promise((r) => setTimeout(r, 10));
    expect(comp.renderCount).toBe(2);
  });

  it('should handle multiple components subscribing to the same state', async () => {
    const comp1 = new MockComponent();
    const comp2 = new MockComponent();
    document.body.appendChild(comp1);
    document.body.appendChild(comp2);

    const state = new ReactiveStateProxy({ count: 0 });

    comp1.subscribeToState('count', () => {});
    comp2.subscribeToState('count', () => {});

    state.value.count = 1;
    await new Promise((r) => setTimeout(r, 10));

    expect(comp1.renderCount).toBe(1);
    expect(comp2.renderCount).toBe(1);
  });

  it('should not re-render if state value is unchanged', async () => {
    const comp = new MockComponent();
    document.body.appendChild(comp);
    const state = new ReactiveStateProxy({ count: 0 });
    comp.subscribeToState('count', () => {});

    state.value.count = 0;
    await new Promise((r) => setTimeout(r, 10));
    expect(comp.renderCount).toBe(0);
  });
});
