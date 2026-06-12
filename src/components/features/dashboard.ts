import { html } from '@core/dom/dom';
import { ExbaComponent } from '@core/lifecycle/component';
import { t } from '@shell/theme/styles';

/**
 * Child component representing a single row in the data grid.
 * Receives rich objects and callbacks via property binding.
 *
 * @extends ExbaComponent
 */
export class DashboardRowComponent extends ExbaComponent {
  static useShadow = true;
  static props = {
    data: 'object',
    onchange: 'function',
  };

  static styles = {
    row: `display: grid; grid-template-columns: 2.5fr 1.5fr 1fr auto; gap: 0.75rem; align-items: center; padding: 0.75rem 1rem; background: ${t.zinc800a}; border: 1px solid ${t.zinc800}; border-radius: 0.5rem; transition: border-color 0.2s, background-color 0.2s; &:hover { border-color: ${t.indigo400}; background: ${t.zinc800}; }`,
    input: `padding: 0.375rem 0.5rem; background: ${t.zinc900}; border: 1px solid ${t.zinc700}; border-radius: 0.375rem; color: ${t.zinc100}; outline: none; font-size: 0.875rem; font-family: inherit; width: 100%; box-sizing: border-box; &:focus { border-color: ${t.indigo500}; }`,
    select: `padding: 0.375rem 0.5rem; background: ${t.zinc900}; border: 1px solid ${t.zinc700}; border-radius: 0.375rem; color: ${t.zinc100}; outline: none; font-size: 0.875rem; font-family: inherit; cursor: pointer; width: 100%; box-sizing: border-box; &:focus { border-color: ${t.indigo500}; }`,
    btnDelete: `padding: 0.375rem 0.75rem; background: ${t.red600}; border: none; border-radius: 0.375rem; color: ${t.white}; font-size: 0.8125rem; font-weight: 600; cursor: pointer; transition: background 0.15s; &:hover { background: #ef4444; }`,
  };

  render() {
    const data = this.data || {
      id: '',
      title: '',
      category: 'Development',
      value: 0,
    };
    return html`
      <div class="row">
        <input
          class="input row-title"
          type="text"
          .value=${data.title}
          oninput=${(e: Event) => {
            const val = (e.target as HTMLInputElement).value;
            if (this.onchange) this.onchange({ ...data, title: val });
          }}
        />
        <select
          class="select row-category"
          .value=${data.category}
          onchange=${(e: Event) => {
            const val = (e.target as HTMLSelectElement).value;
            if (this.onchange) this.onchange({ ...data, category: val });
          }}
        >
          <option value="Development">Development</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
        </select>
        <input
          class="input row-value"
          type="number"
          .value=${String(data.value)}
          oninput=${(e: Event) => {
            const val = Number((e.target as HTMLInputElement).value);
            if (this.onchange) this.onchange({ ...data, value: val });
          }}
        />
        <button
          class="btnDelete"
          onclick=${() => this.emit('delete')}
        >
          Delete
        </button>
      </div>
    `;
  }
}

if (!customElements.get('exba-dashboard-row')) {
  customElements.define('exba-dashboard-row', DashboardRowComponent);
}

/**
 * Main dashboard orchestrator component.
 * Manages lists, sorting/filtering states, and updates child rows reactively.
 *
 * @extends ExbaComponent
 */
export class DashboardComponent extends ExbaComponent {
  static useShadow = true;

  items = this.useSignal([
    {
      id: '1',
      title: 'Implement WASM bridge',
      category: 'Development',
      value: 85,
    },
    { id: '2', title: 'Design landing page', category: 'Design', value: 92 },
    { id: '3', title: 'SEO campaigns', category: 'Marketing', value: 45 },
    {
      id: '4',
      title: 'Refactor reactivity system',
      category: 'Development',
      value: 95,
    },
  ]);

  sortBy = this.useSignal<'title' | 'value'>('title');
  filterCategory = this.useSignal<
    'all' | 'Development' | 'Design' | 'Marketing'
  >('all');
  searchQuery = this.useSignal('');

  // Form states for creating a new item
  newTitle = this.useSignal('');
  newCategory = this.useSignal('Development');
  newValue = this.useSignal(50);

  static props = {
    title: 'string',
  };

  static styles = {
    container: `padding: 2rem; width: 100%; max-width: 900px; margin: 0 auto; font-family: Inter, system-ui, sans-serif; color: ${t.zinc100};`,
    card: `background: ${t.zinc900a}; border: 1px solid ${t.zinc800a}; border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4); backdrop-filter: blur(8px); display: flex; flex-direction: column; gap: 1.5rem;`,
    title: `font-size: 1.75rem; font-weight: 800; color: ${t.indigo400}; background: linear-gradient(135deg, ${t.indigo400}, ${t.emerald400}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;`,
    controls: `display: flex; gap: 1rem; flex-wrap: wrap; background: ${t.zinc800a}; padding: 1rem; border-radius: 0.75rem; border: 1px solid ${t.zinc800};`,
    input: `padding: 0.5rem 0.75rem; background: ${t.zinc850}; border: 1px solid ${t.zinc700}; border-radius: 0.5rem; color: ${t.zinc100}; outline: none; font-size: 0.9rem; font-family: inherit; &:focus { border-color: ${t.indigo500}; }`,
    select: `padding: 0.5rem 0.75rem; background: ${t.zinc850}; border: 1px solid ${t.zinc700}; border-radius: 0.5rem; color: ${t.zinc100}; outline: none; font-size: 0.9rem; font-family: inherit; cursor: pointer; &:focus { border-color: ${t.indigo500}; }`,
    grid: `display: flex; flex-direction: column; gap: 0.75rem;`,
    btn: `padding: 0.5rem 1rem; background: ${t.indigo600}; border: none; border-radius: 0.5rem; color: ${t.white}; font-weight: 600; cursor: pointer; transition: all 0.2s; &:hover { background: ${t.indigo500}; transform: translateY(-1px); }`,
    btnAdd: `padding: 0.5rem 1.25rem; background: ${t.emerald600}; border: none; border-radius: 0.5rem; color: ${t.white}; font-weight: 600; cursor: pointer; transition: all 0.2s; &:hover { background: ${t.emerald400}; transform: translateY(-1px); }`,
  };

  handleRowChange(updatedItem: any) {
    const updated = this.items.value.map((item) =>
      item.id === updatedItem.id ? updatedItem : item,
    );
    this.items.value = updated;
  }

  handleRowDelete(id: string) {
    this.items.value = this.items.value.filter((item) => item.id !== id);
  }

  handleAddItem() {
    if (!this.newTitle.value.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      title: this.newTitle.value,
      category: this.newCategory.value,
      value: this.newValue.value,
    };
    this.items.value = [...this.items.value, newItem];
    this.newTitle.value = '';
    this.newValue.value = 50;
  }

  render() {
    const sorted = [...this.items.value].sort((a, b) => {
      if (this.sortBy.value === 'title') {
        return a.title.localeCompare(b.title);
      }
      return b.value - a.value;
    });

    const filtered = sorted.filter((item) => {
      const matchesCategory =
        this.filterCategory.value === 'all' ||
        item.category === this.filterCategory.value;
      const matchesSearch = item.title
        .toLowerCase()
        .includes(this.searchQuery.value.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return html`
      <div class="container">
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h1 class="title">Interactive Data Dashboard</h1>
            <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; background: ${t.indigo600a}; color: ${t.indigo300}; border: 1px solid ${t.indigo500a}; border-radius: 9999px;">
              Direct Property Binding Active
            </span>
          </div>

          <p style="color: ${t.zinc400}; font-size: 0.9rem; margin: 0; line-height: 1.6;">
            This dashboard demonstrates <strong>direct object property passing</strong> (.data=\${item}), 
            <strong>closure action bindings</strong>, and <strong>Keyed Reconciliation</strong>. 
            Try editing the titles below or typing in an input. If you sort or filter, the active input preserves focus!
          </p>

          <!-- Add Item Form -->
          <div class="controls" style="display: grid; grid-template-columns: 2.5fr 1.5fr 1fr auto; gap: 0.75rem; align-items: center;">
            <input 
              class="input new-title-input" 
              type="text" 
              placeholder="New Task Name..." 
              .value=${this.newTitle.value}
              oninput=${(e: Event) => {
                this.newTitle.value = (e.target as HTMLInputElement).value;
              }}
            />
            <select 
              class="select new-category-select" 
              .value=${this.newCategory.value}
              onchange=${(e: Event) => {
                this.newCategory.value = (e.target as HTMLSelectElement).value;
              }}
            >
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Marketing">Marketing</option>
            </select>
            <input 
              class="input new-value-input" 
              type="number" 
              placeholder="Value" 
              .value=${String(this.newValue.value)}
              oninput=${(e: Event) => {
                this.newValue.value = Number(
                  (e.target as HTMLInputElement).value,
                );
              }}
            />
            <button class="btnAdd add-task-btn" onclick=${() =>
              this.handleAddItem()}>Add Task</button>
          </div>

          <!-- Controls panel for search, filter and sort -->
          <div class="controls">
            <div style="flex: 1; min-width: 200px; display: flex; gap: 0.5rem; align-items: center;">
              <span style="font-size: 0.875rem; color: ${t.zinc400};">Search:</span>
              <input 
                class="input search-input" 
                type="text" 
                placeholder="Search by title..." 
                style="flex: 1;"
                .value=${this.searchQuery.value}
                oninput=${(e: Event) => {
                  this.searchQuery.value = (e.target as HTMLInputElement).value;
                }}
              />
            </div>
            
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span style="font-size: 0.875rem; color: ${t.zinc400};">Filter:</span>
              <select 
                class="select filter-select" 
                .value=${this.filterCategory.value}
                onchange=${(e: Event) => {
                  this.filterCategory.value = (e.target as HTMLSelectElement)
                    .value as any;
                }}
              >
                <option value="all">All Categories</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span style="font-size: 0.875rem; color: ${t.zinc400};">Sort:</span>
              <select 
                class="select sort-select" 
                .value=${this.sortBy.value}
                onchange=${(e: Event) => {
                  this.sortBy.value = (e.target as HTMLSelectElement)
                    .value as any;
                }}
              >
                <option value="title">Alphabetical</option>
                <option value="value">Highest Value</option>
              </select>
            </div>
          </div>

          <!-- Row headers -->
          <div style="display: grid; grid-template-columns: 2.5fr 1.5fr 1fr auto; gap: 0.75rem; padding: 0 1rem; font-size: 0.75rem; font-weight: 700; color: ${t.zinc500}; text-transform: uppercase; letter-spacing: 0.05em;">
            <span>Task Title</span>
            <span>Category</span>
            <span>Weight / Value</span>
            <span style="min-width: 60px; text-align: right;">Action</span>
          </div>

          <!-- Keyed Task Grid -->
          <div class="grid">
            ${filtered.map(
              (item) => html`
              <exba-dashboard-row
                key="${item.id}"
                .data=${item}
                .onchange=${(itemVal: any) => this.handleRowChange(itemVal)}
                @delete=${() => this.handleRowDelete(item.id)}
              ></exba-dashboard-row>
            `,
            )}
            ${
              filtered.length === 0
                ? html`
              <div style="padding: 3rem; text-align: center; color: ${t.zinc500}; border: 2px dashed ${t.zinc800}; border-radius: 0.75rem;">
                No matching tasks found.
              </div>
            `
                : ''
            }
          </div>
        </div>
      </div>
    `;
  }
}
