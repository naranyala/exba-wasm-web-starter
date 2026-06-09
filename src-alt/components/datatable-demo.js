import { defineComponent } from '../framework/Component';

defineComponent({
  name: 'datatable-demo',
  initialState: {
    data: [
      { id: 1, name: 'Alice', age: 28, city: 'New York' },
      { id: 2, name: 'Bob', age: 34, city: 'London' },
      { id: 3, name: 'Charlie', age: 22, city: 'Paris' },
      { id: 4, name: 'Diana', age: 29, city: 'Berlin' },
      { id: 5, name: 'Eve', age: 41, city: 'Tokyo' },
      { id: 6, name: 'Frank', age: 31, city: 'Sydney' },
      { id: 7, name: 'Grace', age: 26, city: 'Toronto' },
    ],
    sortConfig: { key: null, direction: 'asc' },
  },
  reducer: (state, action) => {
    if (action.type === 'SORT') {
      const { key } = action.payload;
      let direction = 'asc';
      if (
        state.sortConfig.key === key &&
        state.sortConfig.direction === 'asc'
      ) {
        direction = 'desc';
      }

      const sortedData = [...state.data].sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });

      return {
        ...state,
        data: sortedData,
        sortConfig: { key, direction },
      };
    }
    return state;
  },
  render: (state) => {
    const { sortConfig } = state;

    const getSortIcon = (key) => {
      if (sortConfig.key !== key) return '↕️';
      return sortConfig.direction === 'asc' ? '🔼' : '🔽';
    };

    return `
      <style>
        :host {
          display: block;
          max-width: 48rem;
          margin: 2rem auto;
          font-family: inherit;
        }
        h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--zinc-100);
          margin: 0 0 1rem;
          text-align: center;
        }
        .table-container {
          border: 1px solid var(--zinc-700);
          border-radius: var(--radius-lg);
          background: var(--zinc-800);
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          text-align: left;
        }
        th {
          background: var(--zinc-700);
          color: var(--zinc-200);
          padding: 0.75rem 1rem;
          cursor: pointer;
          user-select: none;
          transition: background 0.2s;
          white-space: nowrap;
          font-weight: 600;
        }
        th:hover {
          background: var(--zinc-600);
        }
        td {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--zinc-700);
          color: var(--zinc-400);
        }
        tr:hover td {
          background: var(--zinc-700);
          color: var(--zinc-200);
        }
        .sort-icon {
          margin-left: 0.5rem;
          font-size: 0.75rem;
          opacity: 0.7;
        }
      </style>
      <h2>Sortable DataTable</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th data-sort="id">ID <span class="sort-icon">${getSortIcon('id')}</span></th>
              <th data-sort="name">Name <span class="sort-icon">${getSortIcon('name')}</span></th>
              <th data-sort="age">Age <span class="sort-icon">${getSortIcon('age')}</span></th>
              <th data-sort="city">City <span class="sort-icon">${getSortIcon('city')}</span></th>
            </tr>
          </thead>
          <tbody>
            ${state.data
              .map(
                (row) => `
              <tr>
                <td>${row.id}</td>
                <td>${row.name}</td>
                <td>${row.age}</td>
                <td>${row.city}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  },
  hooks: {
    onUpdate: (instance) => {
      const headers = instance.shadowRoot.querySelectorAll('th[data-sort]');
      headers.forEach((th) => {
        th.onclick = () => {
          const key = th.getAttribute('data-sort');
          instance.dispatch({ type: 'SORT', payload: { key } });
        };
      });
    },
  },
});
