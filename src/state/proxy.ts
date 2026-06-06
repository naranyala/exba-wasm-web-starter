import { produce } from 'immer';
import { BAEX } from '../core/baex';

export interface StateOptions {
  onUpdate?: (newState: any) => void;
  onPropertyUpdate?: (prop: string, value: any, oldValue: any) => void;
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
    
    // Notify subscribers for fine-grained component updates
    BAEX.notify(prop, value);

    // Call property update listener if provided
    if (this.options.onPropertyUpdate) {
      this.options.onPropertyUpdate(prop, value, oldValue);
    }
    
    // Call global update listener if provided
    if (this.options.onUpdate) {
      this.options.onUpdate(this.state);
    }
  }

  get value() {
    return this.state;
  }
}
