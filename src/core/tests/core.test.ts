import { ExbaComponent, defineComponent } from '@core/lifecycle/component';
import { Router } from '@core/routing/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { effect, signal, flushQueue } from '@core/reactivity';
import { reactive } from '@core/reactivity/proxy';

class TestComponent extends ExbaComponent {
  static props = {
    name: 'string',
    count: 'number',
  };

  render() {
    return `<div>Hello ${this.state.name || 'User'}, count: ${this.state.count || 0}</div>`;
  }
}

customElements.define('test-component', TestComponent);

describe('ExbaComponent', () => {
  it('should render initial state', () => {
    const el = document.createElement('test-component') as TestComponent;
    document.body.appendChild(el);
    expect(el.shadowRoot?.innerHTML).toContain('Hello User, count: 0');
  });

  it('should update when setState is called', () => {
    const el = document.createElement('test-component') as TestComponent;
    document.body.appendChild(el);
    el.setState({ name: 'Alice', count: 5 });
    expect(el.shadowRoot?.innerHTML).toContain('Hello Alice, count: 5');
  });

  it('should react to attribute changes (Prop System)', () => {
    const el = document.createElement('test-component') as TestComponent;
    document.body.appendChild(el);
    el.setAttribute('name', 'Bob');
    el.setAttribute('count', '10');
    expect(el.shadowRoot?.innerHTML).toContain('Hello Bob, count: 10');
  });
});

describe('Router', () => {
  it('should navigate and render components', () => {
    const container = document.createElement('div');
    container.id = 'router-container';
    document.body.appendChild(container);

    const router = new Router('router-container');
    router.register({ path: '/test', component: 'test-component' });
    router.navigate('/test');

    expect(container.querySelector('test-component')).toBeDefined();
  });
});

describe('Reactive Primitive', () => {
  it('should track dependencies and trigger effects', () => {
    const state = reactive({ count: 0 });
    let accessed = 0;

    effect(() => {
      accessed++;
      return state.count;
    });

    expect(accessed).toBe(1);
    state.count = 1;
    flushQueue();
    expect(accessed).toBe(2);
  });

  it('should work with nested objects', () => {
    const state = reactive({ user: { name: 'Alice' } });
    let accessed = 0;

    effect(() => {
      accessed++;
      return state.user.name;
    });

    expect(accessed).toBe(1);
    state.user.name = 'Bob';
    flushQueue();
    expect(accessed).toBe(2);
  });
});

describe('defineComponent', () => {
  it('should register and render a component functionally', () => {
    defineComponent({
      tagName: 'func-component',
      render() {
        return `<div>Functional Hello ${this.state.name || 'User'}</div>`;
      },
    });

    const el = document.createElement('func-component') as ExbaComponent;
    document.body.appendChild(el);
    expect(el.shadowRoot?.innerHTML).toContain('Functional Hello User');

    el.setState({ name: 'Charlie' });
    expect(el.shadowRoot?.innerHTML).toContain('Functional Hello Charlie');
  });
});
