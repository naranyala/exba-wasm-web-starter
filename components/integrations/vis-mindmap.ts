import { ExbaComponent } from '@core/lifecycle/component';
import { ease, t } from '@shell/theme/styles';
import { Network } from 'vis-network/standalone';

/**
 * An interactive mindmap component powered by Vis-Network.
 * 
 * Demonstrates integration with advanced graph visualization libraries. 
 * Features include:
 * - Physics-driven graph layout (spring-mass system).
 * - Zoom, fit, and physics toggle controls.
 * - Dynamic node and edge addition via the Vis API.
 * - Image export functionality from the underlying Canvas.
 * 
 * @extends ExbaComponent
 */
export class VisMindmap extends ExbaComponent {
  static useShadow = true;

  /** Reference to the internal Vis Network instance */
  private network: any = null;
  /** DataSet holding the network nodes */
  private nodesDataSet: any = null;
  /** DataSet holding the network edges */
  private edgesDataSet: any = null;

  static styles = {
    container:
      'padding: 2rem; width: 100%; max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;',
    card: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 1.5rem; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; backdrop-filter: blur(8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);`,
    header:
      'display: flex; justify-content: space-between; align-items: center;',
    controls: 'display: flex; gap: 0.5rem;',
    btn: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; color: ${t.zinc300}; padding: 0.5rem 1rem; border-radius: 0.75rem; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: all ${ease}; &:hover { background: ${t.indigo600a}; color: ${t.indigo300}; border-color: ${t.indigo500}; }`,
    visArea: `height: 480px; width: 100%; border: 1px solid ${t.zinc800}; border-radius: 1rem; background: ${t.zinc950}; overflow: hidden; position: relative;`,
    infoCard: `background: ${t.zinc950}; border: 1px solid ${t.zinc800}; border-radius: 1rem; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.5rem;`,
    infoTitle: `font-size: 0.75rem; font-weight: 700; color: ${t.zinc500}; text-transform: uppercase; letter-spacing: 0.05em;`,
    infoText: `font-size: 0.9375rem; color: ${t.zinc200}; font-weight: 600;`,
    infoDesc: `font-size: 0.8125rem; color: ${t.zinc400}; line-height: 1.5;`,
  };

  /**
   * Initializes the Vis network with a set of default nodes and edges on mount.
   */
  protected onMount() {
    this.setState({
      selectedNode: 'EXBA Framework',
      selectedDesc:
        'The root of the high-performance, WASM-First web framework bridging Rust & TS.',
      physicsEnabled: true,
    });

    const visEl = this.shadowRoot?.getElementById('vis-container');
    if (!visEl) return;

    // We can import DataSet from standalone or use plain arrays which vis-network accepts
    const rawNodes = [
      {
        id: 'root',
        label: 'EXBA Framework',
        group: 'root',
        desc: 'High-performance WASM-First web framework.',
      },
      {
        id: 'core',
        label: 'Core Engine',
        group: 'level1',
        desc: 'Bridges Rust-WASM with a TypeScript shells patcher.',
      },
      {
        id: 'reactivity',
        label: 'Reactivity',
        group: 'level1',
        desc: 'Signal-based reactive primitives for UI patching.',
      },
      {
        id: 'components',
        label: 'Components',
        group: 'level1',
        desc: 'Class-based custom web elements with scoped CSS.',
      },
      {
        id: 'wasm',
        label: 'Rust WASM',
        group: 'level2',
        desc: 'Holds canonical state and runs calculations.',
      },
      {
        id: 'patcher',
        label: 'Surgical Patcher',
        group: 'level2',
        desc: 'Updates only changed parts of the DOM.',
      },
      {
        id: 'signals',
        label: 'Signals',
        group: 'level2',
        desc: 'Lightweight reactive value holders.',
      },
      {
        id: 'effects',
        label: 'Effects',
        group: 'level2',
        desc: 'Auto-running callbacks matching state.',
      },
      {
        id: 'templates',
        label: 'Tagged HTML',
        group: 'level2',
        desc: 'Tagged template literals for sanitizing markup.',
      },
      {
        id: 'scoped',
        label: 'Scoped CSS',
        group: 'level2',
        desc: 'Automated injection of scoped component styles.',
      },
    ];

    const rawEdges = [
      { from: 'root', to: 'core' },
      { from: 'root', to: 'reactivity' },
      { from: 'root', to: 'components' },
      { from: 'core', to: 'wasm' },
      { from: 'core', to: 'patcher' },
      { from: 'reactivity', to: 'signals' },
      { from: 'reactivity', to: 'effects' },
      { from: 'components', to: 'templates' },
      { from: 'components', to: 'scoped' },
    ];

    const data = {
      nodes: rawNodes,
      edges: rawEdges,
    };

    const options = {
      nodes: {
        shape: 'box',
        margin: 12,
        borderRadius: 8,
        font: {
          color: t.zinc100,
          size: 12,
          face: 'Inter, system-ui, sans-serif',
          bold: true,
        },
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.4)',
          size: 8,
          x: 0,
          y: 4,
        },
      },
      edges: {
        width: 2,
        color: {
          color: t.zinc700,
          highlight: t.indigo400,
          hover: t.indigo500,
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.8,
            type: 'arrow',
          },
        },
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'none',
          roundness: 0.5,
        },
      },
      groups: {
        root: {
          color: {
            background: t.indigo600,
            border: t.indigo400,
            highlight: { background: t.indigo500, border: t.indigo300 },
          },
          font: { size: 14 },
        },
        level1: {
          color: {
            background: '#1f2937',
            border: t.indigo500,
            highlight: { background: t.zinc800, border: t.indigo300 },
          },
        },
        level2: {
          color: {
            background: t.zinc800,
            border: t.zinc700,
            highlight: { background: t.zinc700, border: t.zinc500 },
          },
        },
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 1,
        },
      },
      interaction: {
        hover: true,
        selectConnectedEdges: false,
      },
    };

    this.network = new Network(visEl, data, options);

    this.network.on('selectNode', (params: any) => {
      const nodeId = params.nodes[0];
      const nodeData = rawNodes.find((n) => n.id === nodeId);
      if (nodeData) {
        this.setState({
          selectedNode: nodeData.label,
          selectedDesc: nodeData.desc || 'No description available.',
        });
      }
    });
  }

  /**
   * Increases the graph zoom level.
   */
  private zoomIn() {
    this.network?.moveTo({
      scale: this.network.getScale() + 0.15,
    });
  }

  /**
   * Decreases the graph zoom level.
   */
  private zoomOut() {
    this.network?.moveTo({
      scale: this.network.getScale() - 0.15,
    });
  }

  /**
   * Fits the graph to the container.
   */
  private fit() {
    this.network?.fit();
  }

  /**
   * Toggles the interactive physics engine.
   */
  private togglePhysics() {
    const nextState = !this.state.physicsEnabled;
    this.network?.setOptions({
      physics: { enabled: nextState },
    });
    this.setState({ physicsEnabled: nextState });
  }

  /**
   * Prompts the user for a label and description to add a new subtopic node.
   */
  private addNode() {
    const label = prompt('Enter subtopic label:');
    if (!label) return;
    const desc =
      prompt('Enter subtopic description:') || 'User added subtopic.';

    const selectedNodeIds = this.network?.getSelectedNodes();
    if (!selectedNodeIds || selectedNodeIds.length === 0) {
      alert('Please select a parent node in the map first.');
      return;
    }

    const parentId = selectedNodeIds[0];
    const newId = 'node_' + Math.random().toString(36).substring(2, 9);

    // Dynamic addition using vis-network API
    this.network?.body.data.nodes.add({
      id: newId,
      label,
      group: 'level2',
      desc,
    });
    this.network?.body.data.edges.add({
      from: parentId,
      to: newId,
    });
  }

  /**
   * Exports the current network view as a PNG image.
   */
  private downloadImage() {
    const root = this.shadowRoot || this;
    const canvas = root.querySelector(
      '#vis-container canvas',
    ) as HTMLCanvasElement;
    if (!canvas) {
      alert('Canvas not found');
      return;
    }
    const imgData = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = imgData;
    a.download = 'vis-mindmap.png';
    a.click();
  }

  /**
   * Renders the mindmap container and controls.
   */
  render() {
    const node = this.state.selectedNode || 'Select a Node';
    const desc = this.state.selectedDesc || 'Click any node to see details.';
    const physicsLabel = this.state.physicsEnabled
      ? '🛑 Stop Physics'
      : '⚡ Start Physics';

    return `
      <div class="container">
        <h2 style="color: ${t.zinc100}; margin-bottom: 0.5rem; text-align: center;">Mindmap (Vis-Network)</h2>
        <p style="color: ${t.zinc500}; font-size: 0.875rem; text-align: center; margin-bottom: 1.5rem; margin-top: 0;">Interactive graph with spring physics simulator</p>
        
        <div class="card">
          <header class="header">
            <div class="controls">
              <button class="btn" onclick="this.getRootNode().host.zoomIn()">➕ Zoom In</button>
              <button class="btn" onclick="this.getRootNode().host.zoomOut()">➖ Zoom Out</button>
              <button class="btn" onclick="this.getRootNode().host.fit()">🎯 Fit</button>
              <button class="btn" onclick="this.getRootNode().host.togglePhysics()">${physicsLabel}</button>
              <button class="btn" onclick="this.getRootNode().host.downloadImage()">📸 Export Image</button>
            </div>
            <button class="btn" style="background: ${t.indigo600}; border-color: ${t.indigo400}; color: ${t.white};" onclick="this.getRootNode().host.addNode()">✨ Add Subtopic</button>
          </header>

          <div class="visArea" id="vis-container" data-persist></div>

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
    (window as any).dispatchVisZoomIn = () => this.zoomIn();
    (window as any).dispatchVisZoomOut = () => this.zoomOut();
    (window as any).dispatchVisFit = () => this.fit();
    (window as any).dispatchVisPhysics = () => this.togglePhysics();
    (window as any).dispatchVisAdd = () => this.addNode();
    (window as any).dispatchVisDownload = () => this.downloadImage();
  }
}

