import { ExbaComponent } from '@core/lifecycle/component';
import { t } from '@shell/theme/styles';
import vegaEmbed from 'vega-embed';

export class VegaLiteComponent extends ExbaComponent {
  static useShadow = true;

  static styles = {
    container: 'padding: 2rem; width: 100%; max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;',
    chartArea: `min-height: 500px; width: 100%; padding: 1.5rem; border: 1px solid ${t.zinc800}; border-radius: 1.5rem; background: ${t.zinc950}; overflow: hidden; display: flex; align-items: center; justify-content: center;`,
    controls: 'display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; justify-content: center;',
    btn: `background: ${t.zinc800}; border: 1px solid ${t.zinc700}; color: ${t.zinc300}; padding: 0.75rem 1.25rem; border-radius: 0.75rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; &:hover { background: ${t.indigo600a}; color: ${t.indigo300}; border-color: ${t.indigo500}; transform: translateY(-1px); }`,
  };

  protected onMount() {
    this.renderChart('bar');
    
    // Bind methods for buttons
    (this as any).renderBar = () => this.renderChart('bar');
    (this as any).renderLine = () => this.renderChart('line');
    (this as any).renderScatter = () => this.renderChart('scatter');
    (this as any).renderPie = () => this.renderChart('pie');
    (this as any).renderRadar = () => this.renderChart('radar');
  }

  private async renderChart(type: 'bar' | 'line' | 'scatter' | 'pie' | 'radar') {
    const container = this.shadowRoot?.getElementById('chart-container');
    if (!container) return;

    let spec: any = {};

    const darkConfig = {
      background: 'transparent',
      title: { color: t.zinc100 },
      axis: {
        domainColor: t.zinc700,
        gridColor: t.zinc800,
        tickColor: t.zinc700,
        labelColor: t.zinc400,
        titleColor: t.zinc400,
      },
      legend: {
        labelColor: t.zinc400,
        titleColor: t.zinc400,
      },
      view: { stroke: 'transparent' }
    };

    if (type === 'bar') {
      spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        description: 'A simple bar chart with embedded data.',
        width: 'container',
        height: 400,
        data: {
          values: [
            { a: 'A', b: 28 }, { a: 'B', b: 55 }, { a: 'C', b: 43 },
            { a: 'D', b: 91 }, { a: 'E', b: 81 }, { a: 'F', b: 53 },
            { a: 'G', b: 19 }, { a: 'H', b: 87 }, { a: 'I', b: 52 }
          ]
        },
        mark: { type: 'bar', color: t.indigo500, cornerRadiusEnd: 4 },
        encoding: {
          x: { field: 'a', type: 'nominal', axis: { labelAngle: 0 } },
          y: { field: 'b', type: 'quantitative' },
          tooltip: [{ field: 'a' }, { field: 'b' }]
        },
        config: darkConfig
      };
    } else if (type === 'line') {
      spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        description: 'Stock prices over time.',
        width: 'container',
        height: 400,
        data: { url: 'https://vega.github.io/editor/data/stocks.csv' },
        mark: { type: 'line', strokeWidth: 3 },
        encoding: {
          x: { field: 'date', type: 'temporal' },
          y: { field: 'price', type: 'quantitative' },
          color: { field: 'symbol', type: 'nominal' },
          tooltip: [{ field: 'symbol' }, { field: 'date', timeUnit: 'yearmonthdate' }, { field: 'price' }]
        },
        config: darkConfig
      };
    } else if (type === 'scatter') {
      spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        description: 'A scatterplot showing horsepower and miles per gallons for various cars.',
        width: 'container',
        height: 400,
        data: { url: 'https://vega.github.io/editor/data/cars.json' },
        mark: { type: 'point', filled: true, size: 80 },
        encoding: {
          x: { field: 'Horsepower', type: 'quantitative' },
          y: { field: 'Miles_per_Gallon', type: 'quantitative' },
          color: { field: 'Origin', type: 'nominal' },
          size: { field: 'Weight_in_lbs', type: 'quantitative' },
          tooltip: [{ field: 'Name' }, { field: 'Horsepower' }, { field: 'Miles_per_Gallon' }]
        },
        config: darkConfig
      };
    } else if (type === 'pie') {
      spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        description: 'A donut chart showing category distribution.',
        width: 'container',
        height: 400,
        data: {
          values: [
            { category: 'A', value: 4 }, { category: 'B', value: 6 },
            { category: 'C', value: 10 }, { category: 'D', value: 3 },
            { category: 'E', value: 7 }, { category: 'F', value: 8 }
          ]
        },
        mark: { type: 'arc', innerRadius: 50, tooltip: true },
        encoding: {
          theta: { field: 'value', type: 'quantitative' },
          color: { field: 'category', type: 'nominal', legend: { title: 'Category' } }
        },
        config: darkConfig
      };
    } else if (type === 'radar') {
      // Radar charts require raw Vega (not Vega-Lite)
      spec = {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        description: "A radar chart example, showing multiple dimensions in a radial layout.",
        width: 400,
        height: 400,
        padding: 40,
        autosize: {type: "none", contains: "padding"},
        signals: [{name: "radius", update: "width / 2"}],
        data: [
          {
            name: "table",
            values: [
              {key: "Strength", value: 31, category: 0},
              {key: "Agility", value: 28, category: 0},
              {key: "Speed", value: 15, category: 0},
              {key: "Intelligence", value: 42, category: 0},
              {key: "Charisma", value: 45, category: 0},
              {key: "Luck", value: 34, category: 0},
              {key: "Strength", value: 45, category: 1},
              {key: "Agility", value: 32, category: 1},
              {key: "Speed", value: 20, category: 1},
              {key: "Intelligence", value: 15, category: 1},
              {key: "Charisma", value: 22, category: 1},
              {key: "Luck", value: 18, category: 1}
            ]
          },
          {
            name: "keys",
            source: "table",
            transform: [{type: "aggregate", groupby: ["key"]}]
          }
        ],
        scales: [
          {
            name: "angular",
            type: "point",
            range: {"signal": "[-PI, PI]"},
            padding: 0.5,
            domain: {"data": "table", "field": "key"}
          },
          {
            name: "radial",
            type: "linear",
            range: {"signal": "[0, radius]"},
            zero: true,
            nice: false,
            domain: {"data": "table", "field": "value"},
            domainMin: 0
          },
          {
            name: "color",
            type: "ordinal",
            domain: {"data": "table", "field": "category"},
            range: {"scheme": "category10"}
          }
        ],
        encode: {
          enter: {
            x: {"signal": "radius"},
            y: {"signal": "radius"}
          }
        },
        marks: [
          {
            type: "group",
            name: "categories",
            zindex: 1,
            from: {
              facet: {data: "table", name: "facet", groupby: ["category"]}
            },
            marks: [
              {
                type: "line",
                name: "category-line",
                from: {"data": "facet"},
                encode: {
                  enter: {
                    interpolate: {"value": "linear-closed"},
                    x: {"signal": "scale('radial', datum.value) * cos(scale('angular', datum.key))"},
                    y: {"signal": "scale('radial', datum.value) * sin(scale('angular', datum.key))"},
                    stroke: {"scale": "color", "field": "category"},
                    strokeWidth: {"value": 2},
                    fill: {"scale": "color", "field": "category"},
                    fillOpacity: {"value": 0.2}
                  }
                }
              }
            ]
          },
          {
            type: "rule",
            name: "radial-grid",
            from: {"data": "keys"},
            zindex: 0,
            encode: {
              enter: {
                x: {"value": 0},
                y: {"value": 0},
                x2: {"signal": "radius * cos(scale('angular', datum.key))"},
                y2: {"signal": "radius * sin(scale('angular', datum.key))"},
                stroke: {"value": t.zinc700},
                strokeWidth: {"value": 1}
              }
            }
          },
          {
            type: "text",
            name: "key-label",
            from: {"data": "keys"},
            zindex: 1,
            encode: {
              enter: {
                x: {"signal": "(radius + 15) * cos(scale('angular', datum.key))"},
                y: {"signal": "(radius + 15) * sin(scale('angular', datum.key))"},
                text: {"field": "key"},
                align: [
                  {test: "abs(scale('angular', datum.key)) > PI / 2 + 0.1", value: "right"},
                  {test: "abs(scale('angular', datum.key)) < PI / 2 - 0.1", value: "left"},
                  {value: "center"}
                ],
                baseline: [
                  {test: "scale('angular', datum.key) > 0", value: "top"},
                  {test: "scale('angular', datum.key) == 0", value: "middle"},
                  {value: "bottom"}
                ],
                fill: {"value": t.zinc400},
                fontWeight: {"value": "bold"}
              }
            }
          }
        ],
        config: darkConfig as any
      };
    }

    try {
      await vegaEmbed(container, spec, { actions: false });
    } catch (e) {
      console.error('Failed to embed Vega-Lite chart:', e);
      container.innerHTML = `<div style="color: ${t.red600}">Failed to render chart. Check console for details.</div>`;
    }
  }

  render() {
    return `
      <div class="container">
        <h2 style="color: ${t.zinc100}; margin-bottom: 0.5rem; text-align: center; font-size: 2rem;">Vega-Lite Data Visualization</h2>
        <p style="color: ${t.zinc400}; font-size: 1rem; text-align: center; margin-bottom: 2rem; margin-top: 0;">Declarative statistical visualization grammar, optimized for dark mode.</p>
        
        <div class="controls">
          <button class="btn" onclick="this.getRootNode().host.renderBar()">📊 Bar Chart</button>
          <button class="btn" onclick="this.getRootNode().host.renderLine()">📈 Line Chart (Time Series)</button>
          <button class="btn" onclick="this.getRootNode().host.renderScatter()">🌌 Scatter Plot</button>
          <button class="btn" onclick="this.getRootNode().host.renderPie()">🍩 Pie / Donut</button>
          <button class="btn" onclick="this.getRootNode().host.renderRadar()">🕸️ Radar Chart</button>
        </div>

        <div class="chartArea">
          <div id="chart-container" style="width: 100%;"></div>
        </div>
      </div>
    `;
  }
}
