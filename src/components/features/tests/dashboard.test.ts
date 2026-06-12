import { fireEvent, screen } from '@testing-library/dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { DashboardComponent, DashboardRowComponent } from '../dashboard';

if (!customElements.get('exba-dashboard-row')) {
  customElements.define('exba-dashboard-row', DashboardRowComponent);
}

if (!customElements.get('exba-dashboard')) {
  customElements.define('exba-dashboard', DashboardComponent);
}

describe('Dashboard Component Integration Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should render dashboard, pass properties down to rows, and handle changes', async () => {
    document.body.innerHTML =
      '<exba-dashboard data-testid="dashboard"></exba-dashboard>';
    const dashboard = screen.getByTestId('dashboard') as any;
    expect(dashboard).toBeDefined();

    // Allow render queue to flush
    await new Promise((resolve) => setTimeout(resolve, 20));

    const shadow = dashboard.shadowRoot!;
    const rows = shadow.querySelectorAll('exba-dashboard-row');
    expect(rows.length).toBe(4);

    // Verify properties were correctly set on child elements
    const firstRow = rows[0] as any;
    expect(firstRow.data).toBeDefined();
    expect(firstRow.data.title).toBe('Design landing page');

    // Verify first row's inputs inside shadow DOM
    const rowShadow = firstRow.shadowRoot!;
    const titleInput = rowShadow.querySelector(
      '.row-title',
    ) as HTMLInputElement;
    expect(titleInput).not.toBeNull();
    expect(titleInput.value).toBe('Design landing page');

    // Simulate input edit in the child component
    titleInput.value = 'Design landing page edited';
    fireEvent.input(titleInput);

    // Wait for batch update
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Verify parent state was updated and rendered back down
    expect(firstRow.data.title).toBe('Design landing page edited');
    expect(titleInput.value).toBe('Design landing page edited');
  });

  it('should sort items and preserve focus on active input (Keyed Reconciliation)', async () => {
    document.body.innerHTML =
      '<exba-dashboard data-testid="dashboard"></exba-dashboard>';
    const dashboard = screen.getByTestId('dashboard') as any;

    await new Promise((resolve) => setTimeout(resolve, 20));
    const shadow = dashboard.shadowRoot!;

    // Focus the second item's title input
    const rows = shadow.querySelectorAll('exba-dashboard-row');
    const secondRow = rows[1] as any;
    const secondRowInput = secondRow.shadowRoot!.querySelector(
      '.row-title',
    ) as HTMLInputElement;

    secondRowInput.focus();
    expect(shadow.activeElement).toBe(secondRow); // Custom element hosts focus
    expect(secondRow.shadowRoot!.activeElement).toBe(secondRowInput); // Input has focus inside shadow DOM

    // Sort by Highest Value (select "Highest Value" option)
    const sortSelect = shadow.querySelector(
      '.sort-select',
    ) as HTMLSelectElement;
    sortSelect.value = 'value';
    fireEvent.change(sortSelect);

    // Wait for re-render
    await new Promise((resolve) => setTimeout(resolve, 20));

    // After sorting, verify input remains focused!
    // Since Keyed Diffing is active, the node remains in focus.
    expect(secondRow.shadowRoot!.activeElement).toBe(secondRowInput);
  });

  it('should delete items when custom events are emitted', async () => {
    document.body.innerHTML =
      '<exba-dashboard data-testid="dashboard"></exba-dashboard>';
    const dashboard = screen.getByTestId('dashboard') as any;

    await new Promise((resolve) => setTimeout(resolve, 20));
    const shadow = dashboard.shadowRoot!;

    const initialRows = shadow.querySelectorAll('exba-dashboard-row');
    expect(initialRows.length).toBe(4);

    // Delete the first row
    const deleteBtn = initialRows[0].shadowRoot!.querySelector(
      '.btnDelete',
    ) as HTMLButtonElement;
    fireEvent.click(deleteBtn);

    // Wait for batch update
    await new Promise((resolve) => setTimeout(resolve, 20));

    const finalRows = shadow.querySelectorAll('exba-dashboard-row');
    expect(finalRows.length).toBe(3);
  });
});
