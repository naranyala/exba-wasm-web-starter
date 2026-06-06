import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BAEX, IRProcessor, IRBundle } from './baex';
import { ReactiveStateProxy } from './state';

describe('BAEX Advanced Features', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-el">Original Text</div>
      <div id="state-counter">0</div>
    `;
    BAEX.DEBUG = false;
  });

  describe('ReactiveStateProxy', () => {
    it('should dispatch IR when state changes', () => {
      const dispatchSpy = vi.spyOn(BAEX, 'dispatchIR');
      const state = new ReactiveStateProxy({ counter: 0 });
      
      state.value.counter = 1;
      
      expect(dispatchSpy).toHaveBeenCalled();
      const bundle = dispatchSpy.mock.calls[0][0] as IRBundle;
      expect(bundle.llir).toContainEqual(
        expect.objectContaining({ type: 'UpdateText', id: 'state-counter', text: '1' })
      );
      dispatchSpy.mockRestore();
    });

    it('should not dispatch IR when value is identical', () => {
      const dispatchSpy = vi.spyOn(BAEX, 'dispatchIR');
      const state = new ReactiveStateProxy({ counter: 0 });
      
      state.value.counter = 0;
      
      expect(dispatchSpy).not.toHaveBeenCalled();
      dispatchSpy.mockRestore();
    });
  });

  describe('Lifecycle & Centralization', () => {
    it('should track WASM module after initialization', async () => {
      const mockInit = async () => ({ name: 'MockModule' });
      await BAEX.initWasm(mockInit);
      expect(BAEX.wasmModule).toEqual({ name: 'MockModule' });
    });
  });

  describe('Decorator Integration (Basic)', () => {
    it('should register component via @Component decorator', () => {
      // Since decorators are executed at class definition time, 
      // we check if the custom element is registered.
      // We'll create a dummy class here.
      function DummyComponent() {
        return document.createElement('div');
      }
      
      // Manually trigger the decorator logic as we can't easily 
      // define a decorated class inside a test without a separate file
      // but we can test the registration function itself.
      BAEX.register('test-comp', DummyComponent as any);
      expect(customElements.get('test-comp')).toBeDefined();
    });
  });
});
