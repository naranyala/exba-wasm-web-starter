import { styles } from '@shell/theme/styles';

/**
 * Updates the global execution log in the shell UI with a status message and code snippet.
 * @param text The status or result text to display.
 * @param code Optional code snippet that was executed.
 * @returns void
 */
export function updateResult(text: string, code?: string) {
  const el = document.querySelector<HTMLDivElement>('#execution-log');
  if (el) {
    el.innerHTML = `
      <div class="${styles.resultText}">${text.replace(/\n/g, '<br>')}</div>
      ${code ? `<pre class="${styles.resultCode}">${code}</pre>` : ''}
    `;
    el.style.opacity = '1';
  }
}

/**
 * Performs a fuzzy search on a list of items based on their label.
 * Matches both direct substrings and character sequences.
 * @param query The search query string.
 * @param items List of items to search.
 * @returns Filtered list of matching items.
 */
export function fuzzySearch<T extends { label: string }>(
  query: string,
  items: T[],
): T[] {
  const q = query.toLowerCase();
  return items.filter((item) => {
    const label = item.label.toLowerCase();
    if (label.includes(q)) return true;
    let i = 0,
      j = 0;
    while (i < q.length && j < label.length) {
      if (q[i] === label[j]) i++;
      j++;
    }
    return i === q.length;
  });
}

/**
 * Toggles the visibility of a collapsable UI section and updates its arrow indicator.
 * @param id The ID of the content element to toggle.
 * @returns void
 */
export function toggleSection(id: string) {
  const content = document.getElementById(id);
  const arrow = document.getElementById(`arrow-${id}`);
  if (content && arrow) {
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? '' : 'none';
    arrow.style.transform = isHidden ? '' : 'rotate(180deg)';
  }
}
