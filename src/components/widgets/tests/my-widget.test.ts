import { fireEvent, screen } from '@testing-library/dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { MyWidgetComponent } from '../my-widget';

if (!customElements.get('exba-my-widget')) {
  customElements.define('exba-my-widget', MyWidgetComponent);
}

describe('MyWidgetComponent Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should render pure TS component and update counter', async () => {
    document.body.innerHTML =
      '<exba-my-widget data-testid="comp"></exba-my-widget>';
    const el = screen.getByTestId('comp') as any;
    expect(el).toBeDefined();

    const shadow = el.shadowRoot!;
    expect(shadow.innerHTML).toContain('My Widget Widget');

    const counter = shadow.querySelector('.counter-val');
    expect(counter?.innerHTML).toBe('0');

    const btn = shadow.querySelector('button');
    expect(btn).not.toBeNull();

    fireEvent.click(btn!);
    await new Promise((resolve) => setTimeout(resolve, 15));
    expect(counter?.innerHTML).toBe('1');
  });
});
