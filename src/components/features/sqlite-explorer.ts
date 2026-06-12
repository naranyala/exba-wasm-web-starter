import { ExbaComponent } from '@core/lifecycle/component';
import { html } from '@core/dom/dom';
import { sqliteService, type QueryResult } from '@core/sqlite/service';
import { t, ease } from '@shell/theme/styles';

/**
 * SQLite Explorer Component
 * Allows importing, browsing, and executing queries on SQLite databases.
 */
export class SqliteExplorer extends ExbaComponent {
  static props = {};
  
  static styles = {
    container: `
      display: flex;
      height: calc(100vh - 5rem);
      background: ${t.zinc950};
      color: ${t.zinc200};
      font-family: Inter, system-ui, sans-serif;
    `,
    sidebar: `
      width: 240px;
      border-right: 1px solid ${t.zinc800};
      display: flex;
      flex-direction: column;
      background: ${t.zinc900};
    `,
    main: `
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `,
    header: `
      padding: 1rem;
      border-bottom: 1px solid ${t.zinc800};
      display: flex;
      justify-content: space-between;
      align-items: center;
    `,
    title: `
      font-size: 0.875rem;
      font-weight: 700;
      color: ${t.white};
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `,
    tableList: `
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem;
    `,
    tableItem: `
      padding: 0.625rem 0.75rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.8125rem;
      transition: all ${ease};
      display: flex;
      align-items: center;
      gap: 0.5rem;
      &:hover {
        background: ${t.zinc800};
        color: ${t.white};
      }
      &.active {
        background: ${t.indigo600a};
        color: ${t.indigo300};
      }
    `,
    contentArea: `
      flex: 1;
      overflow: auto;
      padding: 1.5rem;
    `,
    toolbar: `
      padding: 1rem 1.5rem;
      background: ${t.zinc900};
      border-bottom: 1px solid ${t.zinc800};
      display: flex;
      gap: 1rem;
      align-items: center;
    `,
    queryInput: `
      flex: 1;
      background: ${t.zinc950};
      border: 1px solid ${t.zinc800};
      border-radius: 0.375rem;
      padding: 0.5rem 0.75rem;
      color: ${t.zinc100};
      font-family: 'SF Mono', monospace;
      font-size: 0.8125rem;
      &:focus {
        border-color: ${t.indigo500};
        outline: none;
      }
    `,
    button: `
      padding: 0.5rem 1rem;
      background: ${t.indigo600};
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: background ${ease};
      &:hover {
        background: ${t.indigo500};
      }
    `,
    table: `
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;
    `,
    th: `
      text-align: left;
      padding: 0.75rem;
      border-bottom: 2px solid ${t.zinc800};
      color: ${t.zinc400};
      font-weight: 600;
      position: sticky;
      top: 0;
      background: ${t.zinc950};
    `,
    td: `
      padding: 0.75rem;
      border-bottom: 1px solid ${t.zinc800};
      color: ${t.zinc300};
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,
    empty: `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: ${t.zinc500};
      gap: 1rem;
    `
  };

  protected state = this.useSignal({
    dbLoaded: false,
    tables: [] as string[],
    selectedTable: null as string | null,
    currentData: null as QueryResult | null,
    customQuery: '',
    error: null as string | null
  });

  render() {
    const { dbLoaded, tables, selectedTable, currentData, customQuery, error } = this.state.value;

    if (!dbLoaded) {
      return html`
        <div class="container" style="justify-content: center; align-items: center;">
          <div class="empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2v20M2 12h20M12 2L2 12l10 10 10-10L12 2z"></path>
            </svg>
            <h2 style="color: ${t.zinc200}">No Database Loaded</h2>
            <p>Upload a .sqlite or .db file to begin exploring</p>
            <input type="file" id="db-upload" @change="${(e: any) => this.handleFileUpload(e)}" style="display: none;" />
            <button class="button" @click="${() => this.shadowRoot?.getElementById('db-upload')?.click()}">
              Import SQLite File
            </button>
            <button class="button" @click="${() => this.createNewDb()}" style="background: ${t.zinc800}; margin-top: 0.5rem;">
              Create New Database
            </button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="container">
        <aside class="sidebar">
          <header class="header">
            <h3 class="title">Tables</h3>
            <button class="button" style="padding: 0.25rem 0.5rem; background: ${t.zinc800};" @click="${() => this.refreshTables()}">
              ↻
            </button>
          </header>
          <div class="tableList">
            ${tables.map(table => html`
              <div class="tableItem ${selectedTable === table ? 'active' : ''}" @click="${() => this.selectTable(table)}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"></path>
                </svg>
                ${table}
              </div>
            `)}
          </div>
        </aside>

        <main class="main">
          <div class="toolbar">
            <input 
              type="text" 
              class="queryInput" 
              placeholder="SELECT * FROM table..." 
              .value="${customQuery}"
              @input="${(e: any) => this.setState({ customQuery: e.target.value })}"
            />
            <button class="button" @click="${() => this.runCustomQuery()}">Execute</button>
            <button class="button" style="background: ${t.zinc800}" @click="${() => this.exportDb()}">Export</button>
          </div>

          ${error ? html`<div style="padding: 1rem; color: #ef4444; background: rgba(239, 68, 68, 0.1); border-bottom: 1px solid #ef4444;">${error}</div>` : ''}

          <div class="contentArea">
            ${currentData && currentData.columns.length > 0 ? html`
              <table class="table">
                <thead>
                  <tr>
                    ${currentData.columns.map(col => html`<th class="th">${col}</th>`)}
                  </tr>
                </thead>
                <tbody>
                  ${currentData.values.map(row => html`
                    <tr>
                      ${row.map(cell => html`<td class="td" title="${cell}">${cell}</td>`)}
                    </tr>
                  `)}
                </tbody>
              </table>
            ` : html`
              <div class="empty">
                <p>Select a table or run a query to see data</p>
              </div>
            `}
          </div>
        </main>
      </div>
    `;
  }

  async handleFileUpload(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      await sqliteService.loadDatabase(new Uint8Array(buffer));
      this.refreshTables();
      this.setState({ dbLoaded: true, error: null });
    } catch (err: any) {
      this.setState({ error: `Load Error: ${err.message}` });
    }
  }

  createNewDb() {
    try {
      sqliteService.createEmptyDatabase();
      sqliteService.run("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT)");
      sqliteService.run("INSERT INTO users (name, email) VALUES ('Admin', 'admin@exba.io')");
      this.refreshTables();
      this.setState({ dbLoaded: true, error: null });
    } catch (err: any) {
      this.setState({ error: `Init Error: ${err.message}` });
    }
  }

  refreshTables() {
    const tables = sqliteService.getTables();
    this.setState({ tables });
  }

  selectTable(table: string) {
    try {
      const data = sqliteService.getTableData(table);
      this.setState({ selectedTable: table, currentData: data, error: null });
    } catch (err: any) {
      this.setState({ error: `Query Error: ${err.message}` });
    }
  }

  runCustomQuery() {
    const query = this.state.value.customQuery;
    if (!query) return;

    try {
      const results = sqliteService.execute(query);
      if (results.length > 0) {
        this.setState({ currentData: results[0], error: null });
      } else {
        this.refreshTables();
        this.setState({ currentData: { columns: [], values: [] }, error: null });
      }
    } catch (err: any) {
      this.setState({ error: `Query Error: ${err.message}` });
    }
  }

  exportDb() {
    try {
      const binary = sqliteService.export();
      const blob = new Blob([binary], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'database.sqlite';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      this.setState({ error: `Export Error: ${err.message}` });
    }
  }
}
