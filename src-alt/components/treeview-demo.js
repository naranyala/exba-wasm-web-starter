class TreeviewDemo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 42rem;
          margin: 2rem auto;
        }
        h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--zinc-100);
          margin: 0 0 1rem;
          text-align: center;
        }
        .tree {
          border: 1px solid var(--zinc-700);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          background: var(--zinc-800);
          font-size: 0.875rem;
          user-select: none;
        }
        ul {
          list-style: none;
          padding-left: 1.25rem;
          margin: 0;
        }
        .tree > ul {
          padding-left: 0;
        }
        li {
          margin: 0.25rem 0;
          color: var(--zinc-300);
          line-height: 1.8;
        }
        .node-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
          transition: background 0.15s;
        }
        .node-label:hover {
          background: var(--zinc-700);
        }
        .toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1rem;
          height: 1rem;
          font-size: 0.6rem;
          color: var(--zinc-400);
          transition: transform 0.2s;
        }
        .toggle.expanded {
          transform: rotate(90deg);
        }
        .children {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s ease;
        }
        .children.expanded {
          max-height: 500px;
        }
        .leaf-icon {
          display: inline-flex;
          width: 1rem;
          justify-content: center;
          font-size: 0.75rem;
        }
      </style>
      <h2>Treeview Demo</h2>
      <div class="tree">
        <ul>
          <li>
            <span class="node-label" data-path="src">
              <span class="toggle expanded">&#9654;</span>
              <span>📁 src</span>
            </span>
            <div class="children expanded">
              <ul>
                <li>
                  <span class="node-label" data-path="src/components">
                    <span class="toggle">&#9654;</span>
                    <span>📁 components</span>
                  </span>
                  <div class="children">
                    <ul>
                      <li><span class="leaf-icon">📄</span> tab-bar.js</li>
                      <li><span class="leaf-icon">📄</span> accordion-demo.js</li>
                      <li><span class="leaf-icon">📄</span> treeview-demo.js</li>
                    </ul>
                  </div>
                </li>
                <li>
                  <span class="node-label" data-path="src/framework">
                    <span class="toggle">&#9654;</span>
                    <span>📁 framework</span>
                  </span>
                  <div class="children">
                    <ul>
                      <li><span class="leaf-icon">📄</span> Component.ts</li>
                      <li><span class="leaf-icon">📄</span> ReactiveState.ts</li>
                      <li><span class="leaf-icon">📄</span> WasmBridge.ts</li>
                    </ul>
                  </div>
                </li>
                <li><span class="leaf-icon">📄</span> main.ts</li>
                <li><span class="leaf-icon">📄</span> style.css</li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    `;

    this.shadowRoot.querySelectorAll('.node-label').forEach((label) => {
      label.addEventListener('click', () => {
        const toggle = label.querySelector('.toggle');
        const children = label.parentElement.querySelector('.children');
        if (!children) return;

        const isExpanded = children.classList.contains('expanded');
        children.classList.toggle('expanded');
        toggle.classList.toggle('expanded');
      });
    });
  }
}

customElements.define('treeview-demo', TreeviewDemo);
