import { ExbaComponent } from '@core/lifecycle/component';
import { EXBA } from '@core/lifecycle/exba';
import {
  batch,
  computed,
  effect,
  flushQueue,
  listen,
  memo,
  on,
  signal,
  untrack,
} from '@core/reactivity';
import { beforeEach, describe, expect, it, vi } from 'vitest';

class ReactiveTestComponent extends ExbaComponent {
  static props = {};
  static styles = {};

  public mountCount = 0;
  public updateCount = 0;
  public unmountCount = 0;
  public lastChangedProps: string[] = [];

  render() {
    return `<div>${this.state.val || 'none'}</div>`;
  }

  protected onMount() {
    this.mountCount++;
  }

  protected onUpdate(changedProps: string[]) {
    this.updateCount++;
    this.lastChangedProps = changedProps;
  }

  protected onUnmount() {
    this.unmountCount++;
  }

  // Expose createEffect for testing
  public testEffect(key: string, cb: (v: any) => void) {
    return this.createEffect(key, cb);
  }
}

if (!customElements.get('reactive-test-comp')) {
  customElements.define('reactive-test-comp', ReactiveTestComponent);
}

describe('Framework Reactivity & Lifecycle (Advanced)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    EXBA.subscriptions.clear();
    EXBA.globalSignals.clear();
  });

  describe('ExbaComponent Lifecycle', () => {
    it('should trigger hooks in correct order', () => {
      const el = document.createElement(
        'reactive-test-comp',
      ) as ReactiveTestComponent;

      expect(el.mountCount).toBe(0);

      document.body.appendChild(el);
      expect(el.mountCount).toBe(1);

      el.setState({ val: 'updated' });
      flushQueue();
      expect(el.updateCount).toBe(1);
      expect(el.lastChangedProps).toContain('val');

      el.remove();
      expect(el.unmountCount).toBe(1);
    });

    it('should not re-render if state is identical', () => {
      const el = document.createElement(
        'reactive-test-comp',
      ) as ReactiveTestComponent;
      document.body.appendChild(el);
      el.setState({ val: 'test' });
      flushQueue();
      expect(el.updateCount).toBe(1);

      el.setState({ val: 'test' });
      flushQueue();
      expect(el.updateCount).toBe(1); // Should not increase
    });
  });

  describe('Signal System (createSignal)', () => {
    it('should maintain value and notify on change', () => {
      const sig = EXBA.createSignal(10, 'my-signal');
      expect(sig.value).toBe(10);

      const spy = vi.fn();
      sig.subscribe(spy);

      sig.value = 20;
      expect(spy).toHaveBeenCalledWith(20);
      expect(sig.value).toBe(20);
    });

    it('should not notify if value is same', () => {
      const sig = EXBA.createSignal(10);
      const spy = vi.fn();
      sig.subscribe(spy);

      sig.value = 10;
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('Automated Cleanup (createEffect)', () => {
    it('should automatically cleanup effects on unmount', () => {
      const el = document.createElement(
        'reactive-test-comp',
      ) as ReactiveTestComponent;
      document.body.appendChild(el);

      const spy = vi.fn();
      el.testEffect('global-key', spy);

      EXBA.notify('global-key', 'active');
      expect(spy).toHaveBeenCalledWith('active');

      el.remove(); // Triggers disconnectedCallback

      EXBA.notify('global-key', 'dead');
      expect(spy).not.toHaveBeenCalledWith('dead');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Computed Signals (createComputed)', () => {
    it('should update automatically when dependencies change', () => {
      const a = EXBA.createSignal(1, 'sig-a');
      const b = EXBA.createSignal(2, 'sig-b');

      const sum = EXBA.createComputed(
        () => a.value + b.value,
        ['sig-a', 'sig-b'],
      );
      expect(sum.value).toBe(3);

      a.value = 5;
      expect(sum.value).toBe(7);

      b.value = 10;
      expect(sum.value).toBe(15);
    });
  });

  describe('Batch Updates (batch)', () => {
    it('should notify only once per key after batch is complete', () => {
      const sig = EXBA.createSignal(0, 'batch-sig');
      const spy = vi.fn();
      sig.subscribe(spy);

      EXBA.batch(() => {
        sig.value = 1;
        sig.value = 2;
        sig.value = 3;
        expect(spy).not.toHaveBeenCalled();
      });

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Style Preservation & Patching', () => {
    it('should correctly apply and update styles from static object', () => {
      class StyledComp extends ExbaComponent {
        static styles = { red: 'color: red;', blue: 'color: blue;' };
        render() {
          const cls = this.state.isRed ? 'red' : 'blue';
          return `<div class="${cls}">Text</div>`;
        }
      }
      if (!customElements.get('styled-comp')) {
        customElements.define('styled-comp', StyledComp);
      }
      const el = document.createElement('styled-comp') as any;
      document.body.appendChild(el);

      const root = el.shadowRoot!;
      const style = root.querySelector('style')!;
      expect(style.textContent).toContain('.red { color: red; }');
      expect(style.textContent).toContain('.blue { color: blue; }');

      const div = root.querySelector('div')!;
      expect(div.className).toBe('blue');

      el.setState({ isRed: true });
      flushQueue();
      expect(div.className).toBe('red');
      // Ensure style tag wasn't deleted or moved incorrectly
      expect(root.querySelector('style')).toBeDefined();
    });
  });

  // ─── New Reactivity Primitives ────────────────────────────────

  describe('Standalone signal()', () => {
    it('should maintain value and notify on change', () => {
      const s = signal(10);
      expect(s.value).toBe(10);

      const spy = vi.fn();
      s.subscribe(spy);

      s.value = 20;
      expect(spy).toHaveBeenCalledWith(20);
      expect(s.value).toBe(20);
    });

    it('should not notify if value is the same', () => {
      const s = signal(10);
      const spy = vi.fn();
      s.subscribe(spy);

      s.value = 10;
      expect(spy).not.toHaveBeenCalled();
    });

    it('should read without tracking via peek()', () => {
      const s = signal(42);
      expect(s.peek()).toBe(42);
      s.value = 99;
      expect(s.peek()).toBe(99);
    });

    it('should support hybrid tuple API', () => {
      const [count, setCount] = signal(0);
      expect(count()).toBe(0);

      setCount(5);
      expect(count()).toBe(5);
    });

    it('should support updater callback in setter', () => {
      const [count, setCount] = signal(10);
      setCount((c) => c + 15);
      expect(count()).toBe(25);
    });
  });

  describe('Standalone effect()', () => {
    it('should run immediately and re-run on dependency change', () => {
      const s = signal(0);
      const spy = vi.fn();

      effect(() => {
        spy(s.value);
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(0);

      s.value = 5;
      flushQueue();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(5);
    });

    it('should auto-cleanup on dispose', () => {
      const s = signal(0);
      const spy = vi.fn();

      const dispose = effect(() => {
        spy(s.value);
      });

      expect(spy).toHaveBeenCalledTimes(1);

      s.value = 1;
      flushQueue();
      expect(spy).toHaveBeenCalledTimes(2);

      dispose();

      s.value = 2;
      flushQueue();
      expect(spy).toHaveBeenCalledTimes(2); // No more calls
    });

    it('should run onCleanup before re-run', () => {
      const s = signal(0);
      const cleanupSpy = vi.fn();

      effect((onCleanup) => {
        onCleanup(cleanupSpy);
        s.value; // track
      });

      expect(cleanupSpy).not.toHaveBeenCalled();

      s.value = 1;
      flushQueue();
      expect(cleanupSpy).toHaveBeenCalledTimes(1);

      s.value = 2;
      flushQueue();
      expect(cleanupSpy).toHaveBeenCalledTimes(2);
    });

    it('should track multiple signals automatically', () => {
      const a = signal(1);
      const b = signal(2);
      const spy = vi.fn();

      effect(() => {
        spy(a.value + b.value);
      });

      expect(spy).toHaveBeenCalledWith(3);

      a.value = 10;
      flushQueue();
      expect(spy).toHaveBeenLastCalledWith(12);

      b.value = 20;
      flushQueue();
      expect(spy).toHaveBeenLastCalledWith(30);
    });
  });

  describe('Standalone memo()', () => {
    it('should compute derived value lazily', () => {
      const count = signal(0);
      const doubled = memo(() => count.value * 2);

      expect(doubled.value).toBe(0);

      count.value = 5;
      expect(doubled.value).toBe(10);
    });

    it('should cache value until dependency changes', () => {
      const s = signal(1);
      const spy = vi.fn(() => s.value * 10);

      const m = memo(spy);
      expect(m.value).toBe(10);
      expect(spy).toHaveBeenCalledTimes(1);

      // Reading again should use cache
      expect(m.value).toBe(10);
      expect(spy).toHaveBeenCalledTimes(1);

      s.value = 2;
      expect(m.value).toBe(20);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should compose memos', () => {
      const a = signal(1);
      const b = signal(2);
      const sum = memo(() => a.value + b.value);
      const doubled = memo(() => sum.value * 2);

      expect(doubled.value).toBe(6);

      a.value = 10;
      expect(doubled.value).toBe(24);
    });
  });

  describe('Standalone computed()', () => {
    it('should work identically to memo for standard derivation', () => {
      const s = signal(3);
      const c = computed(() => s.value * 2);

      expect(c.value).toBe(6);
      s.value = 5;
      expect(c.value).toBe(10);
    });

    it('should only notify subscribers if value actually changes', () => {
      const s = signal(0);
      const c = computed(() => s.value > 0);
      const spy = vi.fn();
      effect(() => {
        spy(c.value);
      });
      flushQueue();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenLastCalledWith(false);

      s.value = -5; // remains false
      flushQueue();
      expect(spy).toHaveBeenCalledTimes(1); // shouldn't trigger

      s.value = 5; // changes to true
      flushQueue();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenLastCalledWith(true);
    });
  });

  describe('Standalone batch()', () => {
    it('should defer notifications until batch completes', () => {
      const s = signal(0);
      const spy = vi.fn();
      s.subscribe(spy);

      batch(() => {
        s.value = 1;
        s.value = 2;
        s.value = 3;
        expect(spy).not.toHaveBeenCalled();
      });

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should pass actual values to subscribers (not null)', () => {
      const s = signal(0);
      const received: number[] = [];
      s.subscribe((v) => received.push(v));

      batch(() => {
        s.value = 10;
        s.value = 20;
      });

      expect(received).toEqual([20]);
    });

    it('should batch multiple signals', () => {
      const a = signal(0);
      const b = signal(0);
      const spyA = vi.fn();
      const spyB = vi.fn();
      a.subscribe(spyA);
      b.subscribe(spyB);

      batch(() => {
        a.value = 1;
        b.value = 2;
      });

      expect(spyA).toHaveBeenCalledTimes(1);
      expect(spyB).toHaveBeenCalledTimes(1);
      expect(spyA).toHaveBeenLastCalledWith(1);
      expect(spyB).toHaveBeenLastCalledWith(2);
    });
  });

  describe('untrack()', () => {
    it('should read signal without creating a dependency', () => {
      const s = signal(0);
      const spy = vi.fn();

      effect(() => {
        // s.value is tracked
        // untracked read should not trigger re-run
        const _ = untrack(() => s.value);
        spy(_);
      });

      expect(spy).toHaveBeenCalledTimes(1);

      s.value = 1;
      flushQueue();
      // effect should NOT re-run because the only read was untracked
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('on() and listen() - explicit subscription', () => {
    it('should subscribe to single signal outside effect', () => {
      const s = signal(0);
      const spy = vi.fn();

      const dispose = on(s, spy);

      s.value = 5;
      expect(spy).toHaveBeenCalledWith(5);

      dispose();
      s.value = 10;
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should subscribe to multiple signals via array using listen()', () => {
      const a = signal(1);
      const b = signal(2);
      const spy = vi.fn();

      const dispose = listen([a, b], spy);

      a.value = 10;
      expect(spy).toHaveBeenLastCalledWith([10, 2]);

      b.value = 20;
      expect(spy).toHaveBeenLastCalledWith([10, 20]);

      dispose();
      a.value = 100;
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
});
