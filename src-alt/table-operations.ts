import { tableContainer } from './styles.js';

/**
 * Fetches a list of available tables from the database.
 * currently mocked.
 *
 * @returns A promise resolving to an array of table names.
 */
export async function fetchTables() {
  console.log('Mocking fetchTables...');
  return ['users', 'posts'];
}

/**
 * Renders the content of a specific table into the dynamic view container.
 * It initializes a `<table-view>` component and mocks the data fetch.
 *
 * @param tableName - The name of the table to render.
 */
export async function renderTableContent(tableName: string) {
  const view = document.getElementById('dynamic-view');
  if (!view) return;

  view.style.display = 'block';

  const tableEl = document.createElement('table-view');

  const state = (tableEl as any).state;
  state.tableName = tableName;
  state.loading = true;

  view.innerHTML = '';
  view.appendChild(tableEl);

  try {
    console.log(`Mocking data fetch for ${tableName}`);
    state.data = [
      { rowid: 1, name: 'Sample Item 1' },
      { rowid: 2, name: 'Sample Item 2' },
    ];
    state.loading = false;
  } catch (e: any) {
    state.error = e.message || e;
    state.loading = false;
  }
}

/**
 * Handles the addition of a new row to a table.
 * Prompts the user for values for each column and mocks the INSERT operation.
 *
 * @param tableName - The target table.
 * @param columns - The list of columns to provide values for.
 */
export async function handleAddRow(tableName: string, columns: string[]) {
  const values = columns.map((col) => prompt(`Value for ${col}:`) || '');
  console.log('Mocking INSERT action:', tableName, columns, values);
  await renderTableContent(tableName);
}

/**
 * Handles the deletion of a row from a table.
 * Prompts for confirmation before mocking the DELETE operation.
 *
 * @param tableName - The target table.
 * @param id - The identifier of the row to delete.
 */
export async function handleDeleteRow(tableName: string, id: any) {
  if (!confirm(`Delete row with ID ${id}?`)) return;
  console.log('Mocking DELETE action:', tableName, id);
  await renderTableContent(tableName);
}

/**
 * Handles the updating of a row in a table.
 * Prompts the user for new values for specified columns and mocks the UPDATE operation.
 *
 * @param tableName - The target table.
 * @param id - The identifier of the row to update.
 * @param columns - The columns to be updated.
 */
export async function handleUpdateRow(
  tableName: string,
  id: any,
  columns: string[],
) {
  const updates = columns
    .map((col) => {
      const val = prompt(`New value for ${col}:`);
      return val !== null ? `${col} = '${val.replace(/'/g, "''")}'` : null;
    })
    .filter(Boolean);

  if (updates.length === 0) return;

  console.log('Mocking UPDATE action:', tableName, id, updates);
  await renderTableContent(tableName);
}
