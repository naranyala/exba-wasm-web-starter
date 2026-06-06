import { produce } from 'immer';
import { BAEX, IRBundle } from './baex';

export interface StateOptions {
  onUpdate?: (newState: any) => void;
}

export class ReactiveStateProxy {
  private state: any;
  private options: StateOptions;

  constructor(initialState: any, options: StateOptions = {}) {
    this.options = options;
    
    let current = initialState;

    this.state = new Proxy({}, {
      set: (target, prop, value) => {
        const oldValue = current[prop as string];
        if (oldValue !== value) {
          current = produce(current, draft => {
            draft[prop as string] = value;
          });
          this.handleUpdate(prop as string, value, oldValue);
        }
        return true;
      },
      get: (target, prop) => {
        return current[prop as string];
      }
    });
  }

  private handleUpdate(prop: string, value: any, oldValue: any) {
    BAEX.log('STATE_CHANGE', { prop, oldValue, newValue: value });
    
    // 1. Notify subscribers for fine-grained component updates
    BAEX.notify(prop, value);

    // 2. Also generate a global IR bundle for the change (legacy/global support)
    const bundle: IRBundle = {
      version: '1.0.0',
      hlir: { type: 'UIUpdate', target_screen: 'GlobalState', state: prop },
      llir: [
        { type: 'Log', message: `State ${prop} changed to ${value}` },
        { type: 'UpdateText', id: `state-${prop}`, text: String(value) }
      ]
    };
    
    BAEX.dispatchIR(bundle);
    
    if (this.options.onUpdate) {
      this.options.onUpdate(this.state);
    }
  }

  get value() {
    return this.state;
  }
}
