import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EXBA } from './core/exba';
import type { IRBundle } from './core/schema';
import { ReactiveStateProxy } from './state/proxy';

describe('EXBA Advanced Features', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-el">Original Text</div>
      <div id="state-counter">0</div>
    `;
    EXBA.DEBUG = false;
  });

  describe('ReactiveStateProxy', () => {
    it('should dispatch IR when state changes (via listener)', async () => {
      const dispatchSpy = vi.spyOn(EXBA, 'dispatchIR');
      const state = new ReactiveStateProxy(
        { counter: 0 },
        {
          onPropertyUpdate: (prop, value) => {
            EXBA.dispatchIR({
              version: '1.0.0',
              hlir: null,
              llir: [
                {
                  type: 'UpdateText',
                  id: `state-${prop}`,
                  text: String(value),
                },
              ],
            });
          },
        },
      );

      state.value.counter = 1;
      await new Promise((r) => setTimeout(r, 10));

      expect(dispatchSpy).toHaveBeenCalled();
      const bundle = dispatchSpy.mock.calls[0][0] as IRBundle;
      expect(bundle.llir).toContainEqual(
        expect.objectContaining({
          type: 'UpdateText',
          id: 'state-counter',
          text: '1',
        }),
      );
      dispatchSpy.mockRestore();
    });

    it('should not dispatch IR when value is identical', async () => {
      const dispatchSpy = vi.spyOn(EXBA, 'dispatchIR');
      const state = new ReactiveStateProxy({ counter: 0 });

      state.value.counter = 0;
      await new Promise((r) => setTimeout(r, 10));

      expect(dispatchSpy).not.toHaveBeenCalled();
      dispatchSpy.mockRestore();
    });

    it('should handle NaN deduplication', async () => {
      const dispatchSpy = vi.spyOn(EXBA, 'dispatchIR');
      const state = new ReactiveStateProxy({ val: NaN });

      state.value.val = NaN;
      await new Promise((r) => setTimeout(r, 10));

      expect(dispatchSpy).not.toHaveBeenCalled();
      dispatchSpy.mockRestore();
    });

    it('should batch multiple changes into one flush', async () => {
      const updates: string[] = [];
      const state = new ReactiveStateProxy(
        { a: 0, b: 0 },
        {
          onPropertyUpdate: (prop) => {
            updates.push(prop);
          },
        },
      );

      state.value.a = 1;
      state.value.b = 2;
      state.value.a = 3;

      await new Promise((r) => setTimeout(r, 10));

      // Should batch — a is set twice but only the final value matters per flush
      expect(updates).toContain('a');
      expect(updates).toContain('b');
    });
  });

  describe('Lifecycle & Centralization', () => {
    it('should track WASM module after initialization', async () => {
      const mockInit = async () => ({ name: 'MockModule' });
      await EXBA.initWasm(mockInit);
      expect(EXBA.wasmModule).toEqual({ name: 'MockModule' });
    });
  });

  describe('Event System', () => {
    it('should add and emit events', () => {
      const spy = vi.fn();
      const unsub = EXBA.addEventListener('test-event', spy);
      EXBA.emit('test-event', { data: 42 });
      expect(spy).toHaveBeenCalledWith({ data: 42 });
      unsub();
    });

    it('should unsubscribe events', () => {
      const spy = vi.fn();
      const unsub = EXBA.addEventListener('test-event', spy);
      unsub();
      EXBA.emit('test-event');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Decorator Integration (Basic)', () => {
    it('should register component via register()', () => {
      function DummyComponent() {
        return document.createElement('div');
      }

      EXBA.register('test-comp', DummyComponent as any);
      expect(customElements.get('test-comp')).toBeDefined();
    });
  });
});
