import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BAEX, IRProcessor, IRBundle, LLIR } from './baex';

describe('BAEX IR System', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="test-el">Original Text</div>
      <div id="event-el"></div>
    `;
    BAEX.DEBUG = false; // Disable logs during tests
  });

  describe('IRProcessor LLIR Execution', () => {
    it('should update text correctly', () => {
      const bundle: IRBundle = {
        version: '1.0.0',
        hlir: null,
        llir: [{ type: 'UpdateText', id: 'test-el', text: 'Updated Text' }]
      };
      IRProcessor.process(bundle);
      expect(document.getElementById('test-el')?.innerText).toBe('Updated Text');
    });

    it('should set attributes correctly', () => {
      const bundle: IRBundle = {
        version: '1.0.0',
        hlir: null,
        llir: [{ type: 'SetAttribute', id: 'test-el', attr: 'data-test', value: 'value' }]
      };
      IRProcessor.process(bundle);
      expect(document.getElementById('test-el')?.getAttribute('data-test')).toBe('value');
    });

    it('should trigger custom events', () => {
      const eventEl = document.getElementById('event-el')!;
      const spy = vi.fn();
      eventEl.addEventListener('baex-event', spy);

      const bundle: IRBundle = {
        version: '1.0.0',
        hlir: null,
        llir: [{ type: 'TriggerEvent', id: 'event-el', event: 'baex-event' }]
      };
      IRProcessor.process(bundle);
      expect(spy).toHaveBeenCalled();
    });

    it('should handle Log instructions without crashing', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const bundle: IRBundle = {
        version: '1.0.0',
        hlir: null,
        llir: [{ type: 'Log', message: 'Test log' }]
      };
      IRProcessor.process(bundle);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[BAEX-LOG] Test log'),
        expect.any(String)
      );
      consoleSpy.mockRestore();
    });

    it('should handle Anomaly instructions with high priority log', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const bundle: IRBundle = {
        version: '1.0.0',
        hlir: null,
        llir: [{ type: 'Anomaly', code: 'ERR_001', details: 'Something went wrong' }]
      };
      IRProcessor.process(bundle);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[BAEX-ANOMALY] ERR_001'),
        expect.any(String)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases & Corners', () => {
    it('should not crash when element id does not exist', () => {
      const bundle: IRBundle = {
        version: '1.0.0',
        hlir: null,
        llir: [
          { type: 'UpdateText', id: 'non-existent', text: 'fail' },
          { type: 'SetAttribute', id: 'non-existent', attr: 'a', value: 'b' },
          { type: 'TriggerEvent', id: 'non-existent', event: 'e' },
        ]
      };
      expect(() => IRProcessor.process(bundle)).not.toThrow();
    });

    it('should handle empty LLIR list', () => {
      const bundle: IRBundle = {
        version: '1.0.0',
        hlir: null,
        llir: []
      };
      expect(() => IRProcessor.process(bundle)).not.toThrow();
    });

    it('should process HLIR for analysis', () => {
      const BAEXSpy = vi.spyOn(BAEX, 'log');
      const bundle: IRBundle = {
        version: '1.0.0',
        hlir: { type: 'UIUpdate', target_screen: 'Home', state: 'Loading' },
        llir: []
      };
      IRProcessor.process(bundle);
      expect(BAEXSpy).toHaveBeenCalledWith('IR_HLIR_ANALYSIS', bundle.hlir);
      BAEXSpy.mockRestore();
    });

    it('should maintain atomic order of execution', () => {
      const bundle: IRBundle = {
        version: '1.0.0',
        hlir: null,
        llir: [
          { type: 'UpdateText', id: 'test-el', text: 'First' },
          { type: 'UpdateText', id: 'test-el', text: 'Second' },
          { type: 'UpdateText', id: 'test-el', text: 'Third' },
        ]
      };
      IRProcessor.process(bundle);
      expect(document.getElementById('test-el')?.innerText).toBe('Third');
    });
  });

  describe('Bridge Integration', () => {
    it('should correctly dispatch IR via BAEX.dispatchIR', () => {
      const bundle: IRBundle = {
        version: '1.0.0',
        hlir: null,
        llir: [{ type: 'UpdateText', id: 'test-el', text: 'Bridge Test' }]
      };
      BAEX.dispatchIR(bundle);
      expect(document.getElementById('test-el')?.innerText).toBe('Bridge Test');
    });
  });
});
