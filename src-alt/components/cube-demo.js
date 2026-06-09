import { defineComponent } from '../framework/Component';

defineComponent({
  name: 'cube-demo',
  initialState: {
    rotation: { x: 0, y: 0, z: 0 },
    speed: 0.02,
    color: '#6366f1',
    isPaused: false,
  },
  render: (state, { setState }) => {
    return `
      <style>
        :host {
          display: block;
          max-width: 600px;
          margin: 2rem auto;
          text-align: center;
          font-family: inherit;
        }
        h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--zinc-100);
          margin: 0 0 1rem;
        }
        .canvas-container {
          background: var(--zinc-900);
          border: 1px solid var(--zinc-700);
          border-radius: var(--radius-lg);
          padding: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        canvas {
          max-width: 100%;
          height: auto;
        }
        .controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          background: var(--zinc-800);
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--zinc-700);
        }
        .control-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: left;
        }
        label {
          font-size: 0.75rem;
          color: var(--zinc-400);
          font-weight: 500;
        }
        input[type="range"] {
          width: 100%;
          cursor: pointer;
        }
        input[type="color"] {
          width: 100%;
          height: 2rem;
          border: none;
          border-radius: 4px;
          background: none;
          cursor: pointer;
        }
        .btn-group {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        button {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--zinc-600);
          background: var(--zinc-700);
          color: white;
          cursor: pointer;
          font-size: 0.875rem;
        }
        button:hover {
          background: var(--zinc-600);
        }
      </style>
      <h2>3D Cube Linear Algebra Demo</h2>
      <div class="canvas-container">
        <canvas id="cube-canvas" width="400" height="400"></canvas>
      </div>
      <div class="controls">
        <div class="control-group">
          <label>Rotation Speed</label>
          <input type="range" id="speed-slider" min="0" max="0.1" step="0.001">
        </div>
        <div class="control-group">
          <label>Cube Color</label>
          <input type="color" id="color-picker">
        </div>
        <div class="btn-group">
          <button id="pause-btn">${state.isPaused ? '▶️ Resume' : '⏸️ Pause'}</button>
          <button id="reset-btn">🔄 Reset</button>
        </div>
      </div>
    `;
  },
  hooks: {
    onMount: (instance) => {
      const canvas = instance.shadowRoot.getElementById('cube-canvas');
      const speedSlider = instance.shadowRoot.getElementById('speed-slider');
      const colorPicker = instance.shadowRoot.getElementById('color-picker');

      // Set initial values since we removed them from render string to prevent re-render loops
      if (speedSlider)
        speedSlider.value = String(instance.getComponentState().speed);
      if (colorPicker) colorPicker.value = instance.getComponentState().color;

      const ctx = canvas.getContext('2d');
      let animationId;

      const vertices = [
        { x: -1, y: -1, z: -1 },
        { x: 1, y: -1, z: -1 },
        { x: 1, y: 1, z: -1 },
        { x: -1, y: 1, z: -1 },
        { x: -1, y: -1, z: 1 },
        { x: 1, y: -1, z: 1 },
        { x: 1, y: 1, z: 1 },
        { x: -1, y: 1, z: 1 },
      ];

      const edges = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 4],
        [0, 4],
        [1, 5],
        [2, 6],
        [3, 7],
      ];

      const project = (v) => {
        const scale = 100;
        const perspective = 4;
        const z = 1 / (perspective - v.z);
        return {
          x: v.x * scale * z + canvas.width / 2,
          y: v.y * scale * z + canvas.height / 2,
        };
      };

      const rotate = (v, angles) => {
        let { x, y, z } = v;
        // Rotate X
        let ty = y * Math.cos(angles.x) - z * Math.sin(angles.x);
        let tz = y * Math.sin(angles.x) + z * Math.cos(angles.x);
        y = ty;
        z = tz;
        // Rotate Y
        let tx = x * Math.cos(angles.y) + z * Math.sin(angles.y);
        tz = -x * Math.sin(angles.y) + z * Math.cos(angles.y);
        x = tx;
        z = tz;
        // Rotate Z
        tx = x * Math.cos(angles.z) - y * Math.sin(angles.z);
        ty = x * Math.sin(angles.z) + y * Math.cos(angles.z);
        x = tx;
        y = ty;
        return { x, y, z };
      };

      const renderLoop = () => {
        const state = instance.getComponentState();
        if (!state.isPaused) {
          state.rotation.x += state.speed;
          state.rotation.y += state.speed * 0.6;
          state.rotation.z += state.speed * 0.3;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = state.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        const rotatedVertices = vertices.map((v) => rotate(v, state.rotation));
        const projectedVertices = rotatedVertices.map((v) => project(v));

        edges.forEach(([start, end]) => {
          const p1 = projectedVertices[start];
          const p2 = projectedVertices[end];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        });
        ctx.stroke();

        animationId = requestAnimationFrame(renderLoop);
      };

      renderLoop();

      // Store animationId on instance for cleanup
      instance._animationId = animationId;
    },
    onUpdate: (instance) => {
      const speedSlider = instance.shadowRoot.getElementById('speed-slider');
      const colorPicker = instance.shadowRoot.getElementById('color-picker');
      const pauseBtn = instance.shadowRoot.getElementById('pause-btn');
      const resetBtn = instance.shadowRoot.getElementById('reset-btn');

      if (speedSlider) {
        speedSlider.oninput = (e) => {
          instance.setState({ speed: parseFloat(e.target.value) });
        };
      }
      if (colorPicker) {
        colorPicker.oninput = (e) => {
          instance.setState({ color: e.target.value });
        };
      }
      if (pauseBtn) {
        pauseBtn.onclick = () => {
          instance.setState((state) => ({
            ...state,
            isPaused: !state.isPaused,
          }));
        };
      }
      if (resetBtn) {
        resetBtn.onclick = () => {
          instance.setState({ rotation: { x: 0, y: 0, z: 0 } });
        };
      }
    },
    onDestroy: (instance) => {
      if (instance._animationId) {
        cancelAnimationFrame(instance._animationId);
      }
    },
  },
});
