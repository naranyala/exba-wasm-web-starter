import { EXBA } from '@core/lifecycle/exba';
import { fireEvent, screen } from '@testing-library/dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerInternal } from './index';

registerInternal();

describe('Internal Component Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    EXBA.subscriptions.clear();
  });

  describe('TabBar Component', () => {
    it('should render tabs and home button', () => {
      document.body.innerHTML =
        '<tab-bar id="test-tab-bar" data-testid="tab-bar"></tab-bar>';
      const tabBar = screen.getByTestId('tab-bar') as any;
      expect(tabBar).toBeDefined();

      const tabsData = [
        { id: 'settings', label: 'Settings' },
        { id: 'profile', label: 'Profile' },
      ];
      tabBar.setAttribute('tabs', JSON.stringify(tabsData));

      const shadow = tabBar.shadowRoot!;
      expect(shadow.innerHTML).toContain('Home');
      expect(shadow.innerHTML).toContain('Settings');
      expect(shadow.innerHTML).toContain('Profile');
    });

    it('should fire tab-selected event when home clicked', () => {
      document.body.innerHTML = '<tab-bar data-testid="tab-bar"></tab-bar>';
      const tabBar = screen.getByTestId('tab-bar') as any;
      const shadow = tabBar.shadowRoot!;

      const spy = vi.fn();
      tabBar.addEventListener('tab-selected', spy);

      const homeBtn = shadow.querySelector('.home-button');
      expect(homeBtn).not.toBeNull();
      fireEvent.click(homeBtn!);

      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0].detail).toBe('home');
    });

    it('should fire tab-selected when tab clicked, and close event when close clicked', () => {
      document.body.innerHTML = '<tab-bar data-testid="tab-bar"></tab-bar>';
      const tabBar = screen.getByTestId('tab-bar') as any;
      const tabsData = [{ id: 'settings', label: 'Settings' }];
      tabBar.setAttribute('tabs', JSON.stringify(tabsData));
      const shadow = tabBar.shadowRoot!;

      const selectSpy = vi.fn();
      const closeSpy = vi.fn();
      tabBar.addEventListener('tab-selected', selectSpy);
      tabBar.addEventListener('tab-closed', closeSpy);

      // Click tab close button
      const closeBtn = shadow.querySelector('.close-btn');
      expect(closeBtn).not.toBeNull();
      fireEvent.click(closeBtn!);
      expect(closeSpy).toHaveBeenCalled();
      expect(closeSpy.mock.calls[0][0].detail).toBe('settings');

      // Click tab itself
      const tab = shadow.querySelector('.tab');
      expect(tab).not.toBeNull();
      fireEvent.click(tab!);
      expect(selectSpy).toHaveBeenCalled();
      expect(selectSpy.mock.calls[0][0].detail).toBe('settings');
    });

    it('should support setActive method', () => {
      document.body.innerHTML = '<tab-bar data-testid="tab-bar"></tab-bar>';
      const tabBar = screen.getByTestId('tab-bar') as any;
      const tabsData = [{ id: 'settings', label: 'Settings' }];
      tabBar.setAttribute('tabs', JSON.stringify(tabsData));

      tabBar.setActive('settings');
      const shadow = tabBar.shadowRoot!;
      const activeTab = shadow.querySelector('.tab.active');
      expect(activeTab).not.toBeNull();
    });
  });

  describe('StatusBar Component', () => {
    it('should render primitives and wasm-functions count', () => {
      document.body.innerHTML =
        '<status-bar data-testid="status-bar" primitives="5" wasm-functions="12"></status-bar>';
      const el = screen.getByTestId('status-bar');
      expect(el).toBeDefined();

      const shadow = el.shadowRoot!;
      expect(shadow.innerHTML).toContain('Primitives: <span>5</span>');
      expect(shadow.innerHTML).toContain('WASM Functions: <span>12</span>');
    });

    it('should subscribe and react to global counter changes', () => {
      document.body.innerHTML =
        '<status-bar data-testid="status-bar"></status-bar>';
      const el = screen.getByTestId('status-bar') as any;

      EXBA.notify('counter', 42);

      const shadow = el.shadowRoot!;
      const counterEl = shadow.getElementById('state-counter');
      expect(counterEl?.textContent).toBe('Counter: 42');
    });

    it('should emit show-modal event on stat click', () => {
      document.body.innerHTML =
        '<status-bar data-testid="status-bar"></status-bar>';
      const el = screen.getByTestId('status-bar') as any;
      const shadow = el.shadowRoot!;

      const spy = vi.fn();
      el.addEventListener('show-modal', spy);

      const stat = shadow.querySelector('.stat') as HTMLElement;
      expect(stat).not.toBeNull();
      fireEvent.click(stat!);

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('WasmModal Component', () => {
    it('should render modal information layers', () => {
      document.body.innerHTML = '<wasm-modal data-testid="modal"></wasm-modal>';
      const el = screen.getByTestId('modal');
      expect(el).toBeDefined();

      const shadow = el.shadowRoot!;
      expect(shadow.innerHTML).toContain('EXBA DevTools — IR Layers');
      expect(shadow.innerHTML).toContain('HLIR');
      expect(shadow.innerHTML).toContain('LLIR');
    });

    it('should remove itself when backdrop is clicked', () => {
      document.body.innerHTML =
        '<div id="parent"><wasm-modal data-testid="modal"></wasm-modal></div>';
      const parent = document.getElementById('parent')!;
      const el = screen.getByTestId('modal');
      const shadow = el.shadowRoot!;

      const backdrop = shadow.getElementById('modal-backdrop');
      expect(backdrop).not.toBeNull();

      fireEvent.click(backdrop!);
      expect(parent.querySelector('wasm-modal')).toBeNull();
    });
  });

  describe('HomeComponent', () => {
    it('should render categories and menu items', () => {
      document.body.innerHTML = '<exba-home data-testid="home"></exba-home>';
      const el = screen.getByTestId('home');
      expect(el).toBeDefined();

      const input = document.getElementById('menu-search');
      expect(input).not.toBeNull();

      const grid = document.getElementById('menu-grid');
      expect(grid).not.toBeNull();
      // Should have some categories rendered
      expect(grid?.innerHTML).toContain('Browser API Exploration');
    });

    it('should filter items on search input', () => {
      document.body.innerHTML = '<exba-home data-testid="home"></exba-home>';
      const input = document.getElementById('menu-search') as HTMLInputElement;
      expect(input).not.toBeNull();

      // Input search term that matches nothing
      input.value = 'nonexistent-menu-item-abc';
      fireEvent.input(input);

      const grid = document.getElementById('menu-grid');
      expect(grid?.innerHTML).toBe('');

      // Input search term that matches 'Settings'
      input.value = 'Settings';
      fireEvent.input(input);
      expect(grid?.innerHTML).toContain('Settings');
    });
  });
});
