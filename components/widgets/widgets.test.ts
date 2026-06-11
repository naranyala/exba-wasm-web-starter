import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/dom';
import { registerWidgets } from './index';

registerWidgets();

describe('Widgets Component Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('AccordionComponent', () => {
    it('should render accordion header and items', () => {
      document.body.innerHTML = '<exba-accordion data-testid="accordion"></exba-accordion>';
      const el = screen.getByTestId('accordion');
      expect(el).toBeDefined();

      const shadow = el.shadowRoot!;
      expect(shadow.innerHTML).toContain('Accordion Demo');
      expect(shadow.innerHTML).toContain('What is EXBA Framework?');

      // The first item should be active initially (activeIndex: 0)
      const firstItem = shadow.querySelector('.item');
      expect(firstItem?.className).toContain('itemActive');
    });

    it('should toggle items on click', () => {
      document.body.innerHTML = '<exba-accordion data-testid="accordion"></exba-accordion>';
      const el = screen.getByTestId('accordion') as any;
      const shadow = el.shadowRoot!;

      // Click the second item header to toggle it
      const headers = shadow.querySelectorAll('.header');
      expect(headers.length).toBe(3);

      fireEvent.click(headers[1]);
      
      const items = shadow.querySelectorAll('.item');
      expect(items[0].className).not.toContain('itemActive');
      expect(items[1].className).toContain('itemActive');

      // Click it again to collapse all
      fireEvent.click(headers[1]);
      expect(items[1].className).not.toContain('itemActive');
    });
  });

  describe('DrawerComponent', () => {
    it('should open and close drawer', () => {
      document.body.innerHTML = '<exba-drawer data-testid="drawer"></exba-drawer>';
      const el = screen.getByTestId('drawer') as any;
      const shadow = el.shadowRoot!;

      // Initially closed
      const backdrop = shadow.querySelector('.backdrop');
      const drawer = shadow.querySelector('.drawer');
      expect(backdrop?.className).not.toContain('backdropVisible');
      expect(drawer?.className).not.toContain('drawerVisible');

      // Click trigger button
      const openBtn = shadow.querySelector('.btnOpen');
      expect(openBtn).not.toBeNull();
      fireEvent.click(openBtn!);

      expect(backdrop?.className).toContain('backdropVisible');
      expect(drawer?.className).toContain('drawerVisible');

      // Click dismiss button
      const closeBtn = shadow.querySelector('.btnClose');
      expect(closeBtn).not.toBeNull();
      fireEvent.click(closeBtn!);

      expect(backdrop?.className).not.toContain('backdropVisible');
      expect(drawer?.className).not.toContain('drawerVisible');
    });
  });

  describe('CodeBlockComponent', () => {
    it('should display code and highlight keywords', () => {
      document.body.innerHTML = `
        <exba-code-block 
          data-testid="code-block" 
          code="const x = 42; // comment" 
          language="js" 
          title="Test Code"
        ></exba-code-block>
      `;
      const el = screen.getByTestId('code-block');
      expect(el).toBeDefined();

      const shadow = el.shadowRoot!;
      expect(shadow.innerHTML).toContain('js');
      expect(shadow.innerHTML).toContain('Test Code');
      
      // Syntax highlighting check
      expect(shadow.innerHTML).toContain('<span class="keyword">const</span>');
      expect(shadow.innerHTML).toContain('<span class="comment">// comment</span>');
    });

    it('should copy code to clipboard', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      document.body.innerHTML = `
        <exba-code-block 
          data-testid="code-block" 
          code="const testVal = 100;" 
          language="js"
        ></exba-code-block>
      `;
      const el = screen.getByTestId('code-block');
      const shadow = el.shadowRoot!;
      const copyBtn = shadow.getElementById('copy-btn');
      expect(copyBtn).not.toBeNull();

      await fireEvent.click(copyBtn!);
      expect(writeTextMock).toHaveBeenCalledWith('const testVal = 100;');
    });
  });

  describe('DatePickerComponent', () => {
    it('should render datepicker and change months', () => {
      document.body.innerHTML = '<exba-datepicker data-testid="datepicker"></exba-datepicker>';
      const el = screen.getByTestId('datepicker') as any;
      const shadow = el.shadowRoot!;

      expect(shadow.innerHTML).toContain('Monthly Date Picker');

      const initialMonth = shadow.querySelector('.monthTitle')?.textContent;
      expect(initialMonth).toBeDefined();

      // Click prev month
      const prevBtn = shadow.querySelector('.navBtn');
      expect(prevBtn).not.toBeNull();
      fireEvent.click(prevBtn!);

      const prevMonth = shadow.querySelector('.monthTitle')?.textContent;
      expect(prevMonth).not.toBe(initialMonth);

      // Click next month (should go back to initial)
      const nextBtn = shadow.querySelectorAll('.navBtn')[1];
      fireEvent.click(nextBtn);
      expect(shadow.querySelector('.monthTitle')?.textContent).toBe(initialMonth);
    });

    it('should select date on cell click', () => {
      document.body.innerHTML = '<exba-datepicker data-testid="datepicker"></exba-datepicker>';
      const el = screen.getByTestId('datepicker') as any;
      const shadow = el.shadowRoot!;

      // Click a cell
      const cells = shadow.querySelectorAll('.cell');
      expect(cells.length).toBeGreaterThan(0);

      fireEvent.click(cells[15]);
      expect(el.state.selectedDate).toBeDefined();
    });

    it('should trigger presets', () => {
      document.body.innerHTML = '<exba-datepicker data-testid="datepicker"></exba-datepicker>';
      const el = screen.getByTestId('datepicker') as any;
      const shadow = el.shadowRoot!;

      const presetBtn = shadow.querySelector('.presetBtn');
      expect(presetBtn).not.toBeNull();
      fireEvent.click(presetBtn!);

      const todayStr = new Date().toISOString().split('T')[0];
      expect(el.state.selectedDate).toBe(todayStr);
    });
  });

  describe('ExbaGreeting', () => {
    it('should render custom name', () => {
      document.body.innerHTML = '<exba-greeting data-testid="greeting" name="Developer"></exba-greeting>';
      const el = screen.getByTestId('greeting');
      expect(el).toBeDefined();

      const shadow = el.shadowRoot!;
      expect(shadow.innerHTML).toContain('Hello, <span class="highlight">Developer</span>! Welcome to EXBA Framework.');
    });
  });
});
