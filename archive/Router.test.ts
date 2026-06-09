import { describe, expect, it, vi } from 'vitest';
import { globalBus } from './EventBus';
import { Route, Router } from './Router';

describe('Router', () => {
  it('should match basic routes', () => {
    const router = new Router();
    const action = vi.fn();
    router.register([{ path: '/home', action }]);

    router.navigate('/home');
    expect(action).toHaveBeenCalled();
    expect(router.getCurrentPath()).toBe('/home');
  });

  it('should match parameterized routes', () => {
    const router = new Router();
    const action = vi.fn();
    router.register([{ path: '/user/:id', action }]);

    const busSpy = vi.spyOn(globalBus, 'emit');
    router.navigate('/user/123');

    expect(action).toHaveBeenCalled();
    expect(busSpy).toHaveBeenCalledWith(
      'route:change',
      expect.objectContaining({
        params: { id: '123' },
      }),
    );
  });

  it('should handle base path', () => {
    const router = new Router();
    const action = vi.fn();
    router.setBasePath('/app');
    router.register([{ path: '/home', action }]);

    router.navigate('/home');
    expect(action).toHaveBeenCalled();
  });

  it('should trigger route:not-found', () => {
    const router = new Router();
    const busSpy = vi.spyOn(globalBus, 'emit');
    router.navigate('/unknown');
    expect(busSpy).toHaveBeenCalledWith(
      'route:not-found',
      expect.objectContaining({
        path: '/unknown',
      }),
    );
  });
});
