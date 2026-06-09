import { describe, expect, it, vi } from 'vitest';
import { EventBus } from './EventBus';

describe('EventBus', () => {
  it('should emit events to listeners', () => {
    const bus = new EventBus();
    const listener = vi.fn();
    bus.on('test', listener);
    bus.emit('test', { foo: 'bar' });
    expect(listener).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('should support once listeners', () => {
    const bus = new EventBus();
    const listener = vi.fn();
    bus.once('test', listener);
    bus.emit('test', 1);
    bus.emit('test', 2);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);
  });

  it('should allow unsubscribing', () => {
    const bus = new EventBus();
    const listener = vi.fn();
    const unsub = bus.on('test', listener);
    unsub();
    bus.emit('test', 1);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should clear all listeners', () => {
    const bus = new EventBus();
    const listener = vi.fn();
    bus.on('test', listener);
    bus.clear();
    bus.emit('test', 1);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should count listeners correctly', () => {
    const bus = new EventBus();
    bus.on('test', () => {});
    bus.once('test', () => {});
    expect(bus.listenerCount('test')).toBe(2);
  });
});
