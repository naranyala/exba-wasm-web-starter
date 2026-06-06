export function updateResult(text: string) {
  const el = document.querySelector<HTMLDivElement>('#execution-log');
  if (el) {
    el.innerText = text;
    el.classList.remove('opacity-50');
    el.classList.add('opacity-100');
  }
}

export function fuzzySearch(query: string, items: any[]) {
  const q = query.toLowerCase();
  return items.filter(item => {
    const label = item.label.toLowerCase();
    if (label.includes(q)) return true;
    let i = 0, j = 0;
    while (i < q.length && j < label.length) {
      if (q[i] === label[j]) i++;
      j++;
    }
    return i === q.length;
  });
}

export function toggleSection(id: string) {
  const content = document.getElementById(id);
  const arrow = document.getElementById(`arrow-${id}`);
  if (content && arrow) {
    content.classList.toggle('hidden');
    arrow.classList.toggle('rotate-180');
  }
}
