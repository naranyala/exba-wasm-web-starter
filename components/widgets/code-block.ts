import { ExbaComponent } from '@core/lifecycle/component';
import { t } from '@shell/theme/styles';

/**
 * A highly-designed, interactive code block component.
 * 
 * Features:
 * - Syntax highlighting for JS/TS/Rust.
 * - Header with language display and copy-to-clipboard.
 * - Monospace typography with optimized line height.
 * - Custom styled scrollbars.
 * 
 * @extends ExbaComponent
 */
export class CodeBlockComponent extends ExbaComponent {
  static props = {
    /** The code to display */
    code: 'string',
    /** The language for syntax highlighting (ts, rust, js) */
    language: 'string',
    /** Title shown in the header */
    title: 'string',
  };

  static styles = {
    container: `background: #09090b; border: 1px solid ${t.zinc800}; border-radius: 1rem; overflow: hidden; margin: 1rem 0; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);`,
    header: `background: #18181b; border-bottom: 1px solid ${t.zinc800}; padding: 0.75rem 1.25rem; display: flex; justify-content: space-between; align-items: center;`,
    lang: `font-size: 0.7rem; font-weight: 800; color: ${t.zinc500}; text-transform: uppercase; letter-spacing: 0.1em;`,
    title: `font-size: 0.8125rem; font-weight: 600; color: ${t.zinc300};`,
    copyBtn: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; color: ${t.zinc400}; padding: 0.4rem 0.75rem; border-radius: 0.5rem; font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.2s; &:hover { background: ${t.indigo600a}; color: ${t.indigo300}; border-color: ${t.indigo500}; }`,
    pre: `margin: 0; padding: 1.5rem; overflow-x: auto; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.875rem; line-height: 1.7; color: #e4e4e7;`,
    keyword: `color: ${t.indigo400};`,
    string: `color: #34d399;`,
    comment: `color: ${t.zinc600}; font-style: italic;`,
    number: `color: #fbbf24;`,
    type: `color: #60a5fa;`,
    func: `color: #f472b6;`,
  };

  /**
   * Performs basic syntax highlighting using regex.
   * @param code The raw code string.
   * @returns HTML string with highlighted tokens.
   */
  private highlight(code: string): string {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Comments
      .replace(/(\/\/.*)/g, '<span class="comment">$1</span>')
      // Strings
      .replace(/(['"`])(.*?)\1/g, '<span class="string">$1$2$1</span>')
      // Keywords
      .replace(/\b(export|import|const|let|var|function|return|if|else|for|while|class|interface|type|enum|struct|pub|fn|use|mod|impl|match|move|async|await)\b/g, '<span class="keyword">$1</span>')
      // Types
      .replace(/\b(string|number|boolean|any|void|Self|String|i32|f64|Vec|Option|Result|Mutex|u32)\b/g, '<span class="type">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
      // Function calls
      .replace(/\b([a-zA-Z0-9_]+)(?=\s*\()/g, '<span class="func">$1</span>');
  }

  /**
   * Copies the raw code to the system clipboard.
   */
  private async copy() {
    const code = this.state.code || '';
    try {
      await navigator.clipboard.writeText(code);
      const btn = this.shadowRoot?.getElementById('copy-btn');
      if (btn) {
        btn.innerText = 'Copied!';
        setTimeout(() => (btn.innerText = 'Copy'), 2000);
      }
    } catch (e) {
      console.error('Failed to copy', e);
    }
  }

  /**
   * Renders the code block with its header and highlighted content.
   */
  render() {
    const code = this.state.code || '// No code provided';
    const lang = this.state.language || 'text';
    const title = this.state.title || 'Source Code';

    return `
      <div class="container">
        <header class="header">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span class="lang">${lang}</span>
            <span class="title">${title}</span>
          </div>
          <button id="copy-btn" class="copyBtn" onclick="this.getRootNode().host.copy()">Copy</button>
        </header>
        <pre class="pre"><code>${this.highlight(code)}</code></pre>
      </div>
    `;
  }
}

customElements.define('exba-code-block', CodeBlockComponent);
