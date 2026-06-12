import { ExbaComponent } from '@core/lifecycle/component';
import { EXBA } from '@core/lifecycle/exba';
import { t } from '@shell/theme/styles';

/**
 * An interactive terminal emulator component backed by Rust WebAssembly.
 *
 * Demonstrates real-time integration with the WASM core via the `process_ir` bridge,
 * allowing users to run interactive math operations, string utilities, system diagnostics,
 * and state updates directly against the WASM engine.
 *
 * @extends ExbaComponent
 */
export class TerminalComponent extends ExbaComponent {
  static useShadow = true;

  static props = {
    session: 'string',
  };

  static styles = {
    container: `padding: 1.5rem; background: ${t.zinc950}; border-radius: 1.25rem; border: 1px solid ${t.zinc800a}; font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; color: ${t.zinc300}; display: flex; flex-direction: column; height: 450px; box-sizing: border-box; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); backdrop-filter: blur(12px);`,
    header: `display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid ${t.zinc800a};`,
    title: `font-size: 0.75rem; color: ${t.zinc500}; font-weight: 600; letter-spacing: 0.05em;`,
    controls: 'display: flex; gap: 0.5rem;',
    dot: 'width: 0.75rem; height: 0.75rem; border-radius: 50%; transition: opacity 0.2s;',
    red: 'background: #ff5f56;',
    yellow: 'background: #ffbd2e;',
    green: 'background: #27c93f;',
    output:
      'flex: 1; overflow-y: auto; font-size: 0.875rem; line-height: 1.6; display: flex; flex-direction: column; gap: 0.25rem; padding-right: 0.5rem;',
    line: 'margin-bottom: 0.125rem; white-space: pre-wrap; word-break: break-all;',
    prompt: `color: ${t.indigo400}; font-weight: 700; margin-right: 0.5rem;`,
    cmd: `color: ${t.white}; font-weight: 500;`,
  };

  protected onMount() {
    this.setState({
      history: [
        {
          type: 'info',
          text: 'EXBA Interactive WASM Terminal Engine [v1.0.0]',
        },
        {
          type: 'info',
          text: 'Type "help" to see available Rust WASM operations.',
        },
        { type: 'output', text: '' },
      ],
      cmdHistory: [],
      historyIndex: -1,
    });

    const root = this.shadowRoot || this;
    root.addEventListener('keydown', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target && target.classList.contains('terminal-input')) {
        const keyEvent = e as KeyboardEvent;
        if (keyEvent.key === 'Enter') {
          const val = target.value.trim();
          if (val) {
            this.handleCommand(val);
          }
          target.value = '';
        } else if (keyEvent.key === 'ArrowUp') {
          e.preventDefault();
          this.navigateHistory(-1, target);
        } else if (keyEvent.key === 'ArrowDown') {
          e.preventDefault();
          this.navigateHistory(1, target);
        }
      }
    });

    // Auto focus terminal input when clicking anywhere inside the terminal container
    root.addEventListener('click', () => {
      const input = root.querySelector('.terminal-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    });
  }

  private navigateHistory(direction: number, input: HTMLInputElement) {
    const cmdHistory = this.state.cmdHistory || [];
    let index = this.state.historyIndex;
    if (cmdHistory.length === 0) return;

    index += direction;
    if (index < 0) {
      index = 0;
    } else if (index >= cmdHistory.length) {
      index = cmdHistory.length;
      input.value = '';
      this.setState({ historyIndex: index });
      return;
    }

    input.value = cmdHistory[index];
    this.setState({ historyIndex: index });

    // Put cursor at end of input
    setTimeout(() => {
      input.selectionStart = input.selectionEnd = input.value.length;
    }, 0);
  }

  private async handleCommand(cmdText: string) {
    const history = [...(this.state.history || [])];
    const cmdHistory = [...(this.state.cmdHistory || [])];

    history.push({ type: 'cmd', text: cmdText });
    cmdHistory.push(cmdText);

    const parts = cmdText.split(' ').filter(Boolean);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    this.setState({ history, cmdHistory, historyIndex: cmdHistory.length });

    const print = (
      text: string,
      type: 'info' | 'output' | 'error' = 'output',
    ) => {
      const currentHistory = [...(this.state.history || [])];
      currentHistory.push({ type, text });
      this.setState({ history: currentHistory });
      this.scrollToBottom();
    };

    if (command === 'help') {
      print('Available Engine Commands:');
      print('  help                      - Display this command dictionary');
      print('  clear                     - Reset the terminal shell output');
      print(
        '  sysfetch                  - Query and format hardware diagnostics (WASM)',
      );
      print(
        '  add <a> <b>               - Perform arithmetic addition inside Rust',
      );
      print(
        '  fib <n>                   - Calculate sequence Fibonacci index (WASM)',
      );
      print(
        '  fact <n>                  - Compute Factorial product of N (WASM)',
      );
      print(
        '  rev <text>                - Reverse a string value via Rust memory',
      );
      print(
        '  palindrome <text>         - Determine palindrome correctness (WASM)',
      );
      print(
        '  greet <name>              - Greet and update the browser window title',
      );
      print(
        '  rules                     - Check semantic WASM schema validation rules',
      );
      print(
        '  state                     - Retrieve global state representation from Rust',
      );
      print(
        '  anomaly <msg>             - Log an error context trace directly to Rust tracing',
      );
      return;
    }

    if (command === 'clear') {
      this.setState({ history: [] });
      return;
    }

    try {
      switch (command) {
        case 'add': {
          if (args.length < 2) throw new Error('Usage: add <a> <b>');
          const a = parseInt(args[0], 10);
          const b = parseInt(args[1], 10);
          if (isNaN(a) || isNaN(b))
            throw new Error('Arguments must be valid numbers');

          const irResult = await EXBA.api.process_ir(
            JSON.stringify({
              type: 'Add',
              payload: { a, b },
            }),
          );
          if (irResult.type === 'Number') {
            print(`Rust Engine Result: ${irResult.payload}`);
          } else {
            throw new Error(irResult.payload?.message || 'Calculation failed');
          }
          break;
        }

        case 'fib': {
          if (args.length < 1) throw new Error('Usage: fib <n>');
          const n = parseInt(args[0], 10);
          if (isNaN(n)) throw new Error('Argument must be a valid integer');

          const irResult = await EXBA.api.process_ir(
            JSON.stringify({
              type: 'Fibonacci',
              payload: { n },
            }),
          );
          if (irResult.type === 'Number') {
            print(`Fibonacci(${n}) = ${irResult.payload}`);
          } else {
            throw new Error(irResult.payload?.message || 'Calculation failed');
          }
          break;
        }

        case 'fact': {
          if (args.length < 1) throw new Error('Usage: fact <n>');
          const n = parseInt(args[0], 10);
          if (isNaN(n)) throw new Error('Argument must be a valid integer');

          const irResult = await EXBA.api.process_ir(
            JSON.stringify({
              type: 'Factorial',
              payload: { n },
            }),
          );
          if (irResult.type === 'Number') {
            print(`Factorial(${n}) = ${irResult.payload}`);
          } else {
            throw new Error(irResult.payload?.message || 'Calculation failed');
          }
          break;
        }

        case 'rev': {
          if (args.length < 1) throw new Error('Usage: rev <text>');
          const text = args.join(' ');

          const irResult = await EXBA.api.process_ir(
            JSON.stringify({
              type: 'ReverseString',
              payload: { text },
            }),
          );
          if (irResult.type === 'Rules') {
            print(`Reversed String Result: "${irResult.payload.schema}"`);
          } else {
            throw new Error('Action failed');
          }
          break;
        }

        case 'palindrome': {
          if (args.length < 1) throw new Error('Usage: palindrome <text>');
          const text = args.join(' ');

          const irResult = await EXBA.api.process_ir(
            JSON.stringify({
              type: 'PalindromeCheck',
              payload: { text },
            }),
          );
          if (irResult.type === 'Number') {
            print(
              `Is Palindrome? ${irResult.payload === 1 ? 'YES (True) ✅' : 'NO (False) ❌'}`,
            );
          } else {
            throw new Error('Action failed');
          }
          break;
        }

        case 'greet': {
          if (args.length < 1) throw new Error('Usage: greet <name>');
          const name = args.join(' ');

          await EXBA.api.process_ir(
            JSON.stringify({
              type: 'Greet',
              payload: { name },
            }),
          );
          print(
            `Greeted "${name}" successfully. Document title updated.`,
            'info',
          );
          break;
        }

        case 'sysfetch': {
          const irResult = await EXBA.api.process_ir(
            JSON.stringify({
              type: 'SystemFetch',
              payload: null,
            }),
          );
          if (irResult.type === 'SystemInfo') {
            const info = irResult.payload;
            print(`OS:         ${info.os}`);
            print(`Browser:    ${info.browser}`);
            print(`CPU Cores:  ${info.cpu_cores}`);
            print(
              `Memory:     ${info.ram_gb > 0 ? info.ram_gb + ' GB' : 'Unknown'}`,
            );
            print(`Resolution: ${info.screen_res}`);
            print(`GPU:        ${info.gpu}`);
            print(`Uptime:     ${(info.uptime_ms / 1000).toFixed(2)}s`);
            print(`Language:   ${info.language}`);
          } else {
            throw new Error('System fetch failed');
          }
          break;
        }

        case 'rules': {
          const irResult = await EXBA.api.process_ir(
            JSON.stringify({
              type: 'RulesQuery',
              payload: null,
            }),
          );
          if (irResult.type === 'Rules') {
            print(`Engine Rules Schema: "${irResult.payload.schema}"`);
          } else {
            throw new Error('Rules query failed');
          }
          break;
        }

        case 'state': {
          const state = await EXBA.callBridge<any>('wasm_get_app_state');
          print(
            `Global WASM State Singleton: ${JSON.stringify(state, null, 2)}`,
          );
          break;
        }

        case 'anomaly': {
          if (args.length < 1) throw new Error('Usage: anomaly <message>');
          const message = args.join(' ');
          await EXBA.api.process_ir(
            JSON.stringify({
              type: 'ReportAnomaly',
              payload: { message },
            }),
          );
          print(
            `Logged anomaly trace: "${message}" inside Rust log layer. Check your developer devtools console.`,
            'error',
          );
          break;
        }

        default:
          print(`bash: command not found: ${command}`, 'error');
          break;
      }
    } catch (e: any) {
      print(`Error: ${e.message || String(e)}`, 'error');
    }
  }

  private scrollToBottom() {
    const root = this.shadowRoot || this;
    const outputEl = root.querySelector('.output');
    if (outputEl) {
      setTimeout(() => {
        outputEl.scrollTop = outputEl.scrollHeight;
      }, 50);
    }
  }

  render() {
    const session = this.state.session || 'wasm-terminal — bash';
    const history = this.state.history || [];

    return `
      <div class="container">
        <div class="header">
          <div class="title">${session}</div>
          <div class="controls">
            <div class="dot red"></div>
            <div class="dot yellow"></div>
            <div class="dot green"></div>
          </div>
        </div>
        <div class="output">
          ${history
            .map((line: any) => {
              if (line.type === 'cmd') {
                return `<div class="line"><span class="prompt">visitor@exba:~$</span><span class="cmd">${line.text}</span></div>`;
              } else if (line.type === 'error') {
                return `<div class="line" style="color: ${t.red400};">${line.text}</div>`;
              } else if (line.type === 'info') {
                return `<div class="line" style="color: ${t.indigo300};">${line.text}</div>`;
              } else {
                return `<div class="line">${line.text}</div>`;
              }
            })
            .join('')}
          <div class="input-line" style="display: flex; align-items: center; margin-top: 0.25rem;">
            <span class="prompt" style="white-space: nowrap;">visitor@exba:~$</span>
            <input class="terminal-input" type="text" autocomplete="off" autofocus 
                   style="background: transparent; border: none; outline: none; color: ${t.white}; font-family: inherit; font-size: inherit; flex: 1; padding: 0;" />
          </div>
        </div>
      </div>
    `;
  }
}
