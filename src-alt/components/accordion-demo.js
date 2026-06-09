class AccordionDemo extends HTMLElement {
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
        .accordion {
          border: 1px solid var(--zinc-700);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--zinc-800);
        }
        .panel {
          border-bottom: 1px solid var(--zinc-700);
        }
        .panel:last-child {
          border-bottom: none;
        }
        .panel-header {
          padding: 1rem 1.25rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          color: var(--zinc-200);
          transition: background 0.2s;
          user-select: none;
        }
        .panel-header:hover {
          background: var(--zinc-700);
        }
        .panel-header .icon {
          transition: transform 0.2s;
          font-size: 0.75rem;
          color: var(--zinc-400);
        }
        .panel-header.open .icon {
          transform: rotate(90deg);
        }
        .panel-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
          padding: 0 1.25rem;
          color: var(--zinc-400);
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .panel-body.open {
          max-height: 300px;
          padding: 0 1.25rem 1rem;
        }
        h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--zinc-100);
          margin: 0 0 1rem;
          text-align: center;
        }
      </style>
      <h2>Accordion Demo</h2>
      <div class="accordion">
        <div class="panel">
          <div class="panel-header" data-index="0">
            <span>What is this project?</span>
            <span class="icon">&#9654;</span>
          </div>
          <div class="panel-body">
            This is a database explorer built with WASM and web technologies. It lets you browse and manage SQLite tables directly in the browser.
          </div>
        </div>
        <div class="panel">
          <div class="panel-header" data-index="1">
            <span>How does WASM work here?</span>
            <span class="icon">&#9654;</span>
          </div>
          <div class="panel-body">
            WebAssembly (WASM) allows running compiled C/C++ code in the browser at near-native speed. Here it powers the SQLite engine and other utilities.
          </div>
        </div>
        <div class="panel">
          <div class="panel-header" data-index="2">
            <span>What tech stack is used?</span>
            <span class="icon">&#9654;</span>
          </div>
          <div class="panel-body">
            The app uses TypeScript, goober for CSS-in-JS, Leaflet for maps, and a custom component framework with reactive state management.
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll('.panel-header').forEach((header) => {
      header.addEventListener('click', () => {
        const panel = header.closest('.panel');
        const body = panel.querySelector('.panel-body');
        const isOpen = body.classList.contains('open');

        this.shadowRoot
          .querySelectorAll('.panel-body')
          .forEach((b) => b.classList.remove('open'));
        this.shadowRoot
          .querySelectorAll('.panel-header')
          .forEach((h) => h.classList.remove('open'));

        if (!isOpen) {
          body.classList.add('open');
          header.classList.add('open');
        }
      });
    });
  }
}

customElements.define('accordion-demo', AccordionDemo);
