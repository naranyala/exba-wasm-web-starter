import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BAEX } from './baex';
import { ReactiveStateProxy } from './state';

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
  // Mocking the protected method from BaexComponent
  subscribeToState(key: string, cb: (val: any) => void) {
    BAEX.subscribe(key, (val) => {
      cb(val);
      this.update();
    });
  }
}

// Register the mock component to avoid "Invalid constructor" error
if (!customElements.get('mock-component')) {
  customElements.define('mock-component', MockComponent);
}

describe('BAEX Reactivity Model Validation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    BAEX.subscriptions.clear();
    BAEX.DEBUG = false;
  });

  it('should trigger component re-render on state change via subscription', () => {
    const comp = new MockComponent();
    document.body.appendChild(comp);
    
    const state = new ReactiveStateProxy({ count: 0 });
    
    // Component subscribes to 'count'
    comp.subscribeToState('count', (val) => {
      // Logic here
    });

    expect(comp.renderCount).toBe(0); // Not rendered yet
    
    state.value.count = 1;
    
    expect(comp.renderCount).toBe(1);
    
    state.value.count = 2;
    expect(comp.renderCount).toBe(2);
  });

  it('should handle multiple components subscribing to the same state', () => {
    const comp1 = new MockComponent();
    const comp2 = new MockComponent();
    document.body.appendChild(comp1);
    document.body.appendChild(comp2);
    
    const state = new ReactiveStateProxy({ count: 0 });
    
    comp1.subscribeToState('count', () => {});
    comp2.subscribeToState('count', () => {});

    state.value.count = 1;
    
    expect(comp1.renderCount).toBe(1);
    expect(comp2.renderCount).toBe(1);
  });

  it('should not re-render if state value is unchanged', () => {
    const comp = new MockComponent();
    document.body.appendChild(comp);
    const state = new ReactiveStateProxy({ count: 0 });
    comp.subscribeToState('count', () => {});

    state.value.count = 0; // Same value
    expect(comp.renderCount).toBe(0);
  });
});
