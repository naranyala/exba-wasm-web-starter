import { ExbaComponent } from '@core/lifecycle/component';
import { ease, t } from '@shell/theme/styles';
import cytoscape from 'cytoscape';

/**
 * An interactive mindmap component powered by Cytoscape.js.
 * 
 * Demonstrates integration with external third-party libraries within the 
 * EXBA component model. Features include:
 * - Dynamic node addition with prompts.
 * - Interactive graph layout (COSE physics engine).
 * - Zoom, fit, and re-layout controls.
 * - Image export functionality.
 * 
 * @extends ExbaComponent
 */
export class CytoscapeMindmap extends ExbaComponent {
  static useShadow = true;

  /** Reference to the internal Cytoscape instance */
  private cy: cytoscape.Core | null = null;

  static styles = {
    container:
      'padding: 2rem; width: 100%; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;',
    card: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 1.5rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; backdrop-filter: blur(8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);`,
    header:
      'display: flex; justify-content: space-between; align-items: center;',
    controls: 'display: flex; gap: 0.5rem;',
    btn: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; color: ${t.zinc300}; padding: 0.5rem 1rem; border-radius: 0.75rem; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all ${ease}; &:hover { background: ${t.indigo600a}; color: ${t.indigo300}; border-color: ${t.indigo500}; }`,
    cyArea: `height: 480px; width: 100%; border: 1px solid ${t.zinc800}; border-radius: 1rem; background: ${t.zinc950}; overflow: hidden; position: relative;`,
    infoCard: `background: ${t.zinc950}; border: 1px solid ${t.zinc800}; border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;`,
    infoTitle: `font-size: 0.75rem; font-weight: 700; color: ${t.zinc500}; text-transform: uppercase; letter-spacing: 0.05em;`,
    infoText: `font-size: 0.9375rem; color: ${t.zinc200}; font-weight: 600;`,
    infoDesc: `font-size: 0.8125rem; color: ${t.zinc400}; line-height: 1.5;`,
  };

  /**
   * Initializes the mindmap with a set of default nodes and edges on mount.
   */
  protected onMount() {
    this.setState({
      selectedNode: 'EXBA Framework',
      selectedDesc:
        'The root of the high-performance, WASM-First web framework bridging Rust & TS.',
    });

    const cyEl = this.shadowRoot?.getElementById('cy-container');
    if (!cyEl) return;

    const elements: cytoscape.ElementDefinition[] = [
      // Central Node
      {
        data: {
          id: 'root',
          label: 'EXBA Framework',
          type: 'root',
          desc: 'High-performance WASM-First web framework.',
        },
      },

      // Level 1 Nodes
      {
        data: {
          id: 'core',
          label: 'Core Engine',
          type: 'level1',
          desc: 'Bridges Rust-WASM with a TypeScript shells patcher.',
        },
      },
      {
        data: {
          id: 'reactivity',
          label: 'Reactivity',
          type: 'level1',
          desc: 'Signal-based reactive primitives for UI patching.',
        },
      },
      {
        data: {
          id: 'components',
          label: 'Components',
          type: 'level1',
          desc: 'Class-based custom web elements with scoped CSS.',
        },
      },

      // Level 2 Nodes (Core)
      {
        data: {
          id: 'wasm',
          label: 'Rust WASM',
          type: 'level2',
          desc: 'Holds canonical state and runs calculations.',
        },
      },
      {
        data: {
          id: 'patcher',
          label: 'Surgical Patcher',
          type: 'level2',
          desc: 'Updates only changed parts of the DOM.',
        },
      },

      // Level 2 Nodes (Reactivity)
      {
        data: {
          id: 'signals',
          label: 'Signals',
          type: 'level2',
          desc: 'Lightweight reactive value holders.',
        },
      },
      {
        data: {
          id: 'effects',
          label: 'Effects',
          type: 'level2',
          desc: 'Auto-running callbacks matching state.',
        },
      },

      // Level 2 Nodes (Components)
      {
        data: {
          id: 'templates',
          label: 'Tagged HTML',
          type: 'level2',
          desc: 'Tagged template literals for sanitizing markup.',
        },
      },
      {
        data: {
          id: 'scoped',
          label: 'Scoped CSS',
          type: 'level2',
          desc: 'Automated injection of scoped component styles.',
        },
      },

      // Edges
      { data: { source: 'root', target: 'core' } },
      { data: { source: 'root', target: 'reactivity' } },
      { data: { source: 'root', target: 'components' } },
      { data: { source: 'core', target: 'wasm' } },
      { data: { source: 'core', target: 'patcher' } },
      { data: { source: 'reactivity', target: 'signals' } },
      { data: { source: 'reactivity', target: 'effects' } },
      { data: { source: 'components', target: 'templates' } },
      { data: { source: 'components', target: 'scoped' } },
    ];

    this.cy = cytoscape({
      container: cyEl,
      elements: elements,
      boxSelectionEnabled: false,
      autounselectify: true,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            'font-family': 'Inter, system-ui, sans-serif',
            'font-size': '11px',
            'font-weight': 'bold',
            color: t.zinc100,
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': t.zinc800,
            'border-width': '2px',
            'border-color': t.zinc700,
            width: '100px',
            height: '36px',
            shape: 'round-rectangle',
            'transition-property': 'background-color border-color border-width',
            'transition-duration': 0.15,
          },
        },
        {
          selector: 'node[type="root"]',
          style: {
            'background-color': t.indigo600,
            'border-color': t.indigo400,
            width: '120px',
            height: '44px',
            'font-size': '12px',
          },
        },
        {
          selector: 'node[type="level1"]',
          style: {
            'background-color': '#1f2937',
            'border-color': t.indigo500,
            width: '110px',
            height: '40px',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': t.zinc700,
            'target-arrow-color': t.zinc700,
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'node:active',
          style: {
            'border-color': t.indigo300,
            'border-width': '3px',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        nodeOverlap: 20,
        componentSpacing: 40,
        nodeRepulsion: () => 4500,
        idealEdgeLength: () => 60,
        edgeElasticity: () => 100,
      } as any,
    });

    this.cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      this.setState({
        selectedNode: node.data('label'),
        selectedDesc: node.data('desc') || 'No description available.',
      });
    });
  }

  /**
   * Increases the graph zoom level.
   */
  private zoomIn() {
    this.cy?.zoom(this.cy.zoom() + 0.15);
  }

  /**
   * Decreases the graph zoom level.
   */
  private zoomOut() {
    this.cy?.zoom(this.cy.zoom() - 0.15);
  }

  /**
   * Fits the graph to the container and centers it.
   */
  private fit() {
    this.cy?.fit();
    this.cy?.center();
  }

  /**
   * Re-runs the COSE layout algorithm.
   */
  private resetLayout() {
    this.cy
      ?.layout({
        name: 'cose',
        animate: true,
        nodeOverlap: 20,
        componentSpacing: 40,
        nodeRepulsion: () => 4500,
        idealEdgeLength: () => 60,
      } as any)
      .run();
  }

  /**
   * Prompts the user for a label and description to add a new subtopic node.
   */
  private addNode() {
    const label = prompt('Enter subtopic label:');
    if (!label) return;
    const desc =
      prompt('Enter subtopic description:') || 'User added subtopic.';

    const selectedNodeObj = this.cy
      ?.nodes()
      .filter((n) => n.data('label') === this.state.selectedNode);
    if (!selectedNodeObj || selectedNodeObj.length === 0) {
      alert('Please select a parent node in the map first.');
      return;
    }

    const parentId = selectedNodeObj.id();
    const newId = 'node_' + Math.random().toString(36).substring(2, 9);

    this.cy?.add([
      { data: { id: newId, label, type: 'level2', desc } },
      { data: { source: parentId, target: newId } },
    ]);

    this.resetLayout();
  }

  /**
   * Exports the current graph view as a PNG image.
   */
  private downloadImage() {
    if (!this.cy) return;
    const png64 = this.cy.png({ bg: '#09090b', full: true });
    const a = document.createElement('a');
    a.href = png64;
    a.download = 'cytoscape-mindmap.png';
    a.click();
  }

  render() {
    const node = this.state.selectedNode || 'Select a Node';
    const desc = this.state.selectedDesc || 'Click any node to see details.';

    return `
      <div class="container">
        <h2 style="color: ${t.zinc100}; margin-bottom: 0.5rem; text-align: center;">Mindmap (Cytoscape.js)</h2>
        <p style="color: ${t.zinc500}; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem; margin-top: 0;">Interactive graph with COSE physics engine</p>
        
        <div class="card">
          <header class="header">
            <div class="controls">
              <button class="btn" onclick="this.getRootNode().host.zoomIn()">➕ Zoom In</button>
              <button class="btn" onclick="this.getRootNode().host.zoomOut()">➖ Zoom Out</button>
              <button class="btn" onclick="this.getRootNode().host.fit()">🎯 Fit</button>
              <button class="btn" onclick="this.getRootNode().host.resetLayout()">🔄 Re-layout</button>
              <button class="btn" onclick="this.getRootNode().host.downloadImage()">📸 Export Image</button>
            </div>
            <button class="btn" style="background: ${t.indigo600}; border-color: ${t.indigo400}; color: ${t.white};" onclick="this.getRootNode().host.addNode()">✨ Add Subtopic</button>
          </header>

          <div class="cyArea" id="cy-container" data-persist></div>

          <div class="infoCard">
            <div class="infoTitle">Selected Node Info</div>
            <div class="infoText">${node}</div>
            <div class="infoDesc">${desc}</div>
          </div>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    (window as any).dispatchCyZoomIn = () => this.zoomIn();
    (window as any).dispatchCyZoomOut = () => this.zoomOut();
    (window as any).dispatchCyFit = () => this.fit();
    (window as any).dispatchCyReset = () => this.resetLayout();
    (window as any).dispatchCyAdd = () => this.addNode();
    (window as any).dispatchCyDownload = () => this.downloadImage();
  }
}

customElements.define('exba-cytoscape-mindmap', CytoscapeMindmap);
