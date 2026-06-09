import { defineComponent } from './framework/Component.js';
import {
  addButton,
  crudButton,
  formActions,
  formField,
  formPanel,
  splitPanel,
  tableContainer,
} from './styles.js';

/**
 * Registers the `<table-view>` custom element.
 * This component provides a data-grid interface for browsing and editing
 * table data from the database, including inline editing and CRUD operations.
 */
export function registerTableView() {
  defineComponent({
    name: 'table-view',
    initialState: {
      tableName: '',
      data: [] as any[],
      loading: false,
      error: '' as string | null,
      editingRowId: null as number | null,
      formValues: {} as any,
    },
    render: (state, { setState }) => {
      if (state.loading)
        return `<div style="text-align: center; padding: 2rem; color: var(--zinc-400);">Loading <strong>${state.tableName}</strong>...</div>`;
      if (state.error)
        return `<div style="color: var(--red-500); padding: 1.5rem; background: rgba(239,68,68,0.1); border-radius: var(--radius-lg);">${state.error}</div>`;
      if (state.data.length === 0)
        return `<div style="padding: 2rem; text-align: center; color: var(--zinc-400);">Table <strong>${state.tableName}</strong> is empty.</div>`;

      const columns = Object.keys(state.data[0]).filter((c) => c !== 'rowid');

      const tableHtml = `
        <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="background: var(--zinc-800); text-align: left;">
                ${columns.map((col) => `<th style="padding: 0.75rem; border: 1px solid var(--zinc-700); color: var(--zinc-400); font-weight: 500; white-space: nowrap;">${col}</th>`).join('')}
                <th style="padding: 0.75rem; border: 1px solid var(--zinc-700); color: var(--zinc-400); text-align: center; width: 120px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.data
                .map(
                  (row) => `
                <tr style="${state.editingRowId === row.rowid ? 'background: rgba(99, 102, 241, 0.08);' : ''} transition: background var(--transition);">
                  ${columns.map((col) => `<td style="padding: 0.75rem; border: 1px solid var(--zinc-700); color: var(--zinc-300);">${row[col]}</td>`).join('')}
                  <td style="padding: 0.75rem; border: 1px solid var(--zinc-700); text-align: center; white-space: nowrap;">
                    <button class="${crudButton}" onclick="window.handleEditRow('${state.tableName}', ${row.rowid})">Edit</button>
                    <button class="${crudButton}" style="color: var(--red-500);" onclick="window.handleDeleteRow('${state.tableName}', ${row.rowid})">Delete</button>
                  </td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>
        </div>
      `;

      const formHtml = `
        <div class="${formPanel}">
          <h3 style="margin: 0 0 0.5rem; font-size: 1rem; color: var(--zinc-100);">Edit Row #${state.editingRowId}</h3>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${columns
              .map(
                (col) => `
              <div class="${formField}">
                <label>${col}</label>
                <input type="text" value="${state.formValues[col] || ''}"
                  oninput="window.handleFormInput('${col}', this.value)" />
              </div>
            `,
              )
              .join('')}
          </div>
          <div class="${formActions}">
            <button class="${addButton}" style="margin: 0; flex: 1;" onclick="window.handleFormSubmit('${state.tableName}', ${state.editingRowId})">Save</button>
            <button class="${crudButton}" style="flex: 1;" onclick="window.handleCancelEdit()">Cancel</button>
          </div>
        </div>
      `;

      return `
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h2 style="margin: 0; font-size: 1.25rem; font-weight: 600;">${state.tableName}</h2>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="color: var(--zinc-400); font-size: 0.875rem;">${state.data.length} rows</span>
            <button class="${addButton}" style="margin: 0;" onclick="window.handleAddRow('${state.tableName}', ${JSON.stringify(columns)})">+ Add Row</button>
          </div>
        </div>
        <div class="${splitPanel}">
          <div class="${tableContainer}">
            ${tableHtml}
          </div>
          ${state.editingRowId ? formHtml : ''}
        </div>
      `;
    },
  });
}
