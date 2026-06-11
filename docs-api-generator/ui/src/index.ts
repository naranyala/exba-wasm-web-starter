import './style.css';
import apiData from './api-data.json';

interface Param {
  name: string;
  type: string;
  description: string;
}

interface Return {
  type: string;
  description: string;
}

interface DocEntry {
  name: string;
  type: string;
  description: string;
  signature?: string;
  params?: Param[];
  returns?: Return;
  filePath: string;
  fullPath: string;
  lineNumber: number;
  isPublic: boolean;
  container?: string;
  module: string;
}

const EDITOR_CONFIGS: Record<string, { label: string; protocol: string }> = {
  vscode: { label: 'VS Code', protocol: 'vscode://file/{path}:{line}' },
  cursor: { label: 'Cursor', protocol: 'cursor://file/{path}:{line}' },
  vscode_insiders: {
    label: 'VS Code Insiders',
    protocol: 'vscode-insiders://file/{path}:{line}',
  },
  sublime: {
    label: 'Sublime Text',
    protocol: 'subl://open?url=file://{path}&line={line}',
  },
  intellij: {
    label: 'IntelliJ IDEA',
    protocol: 'idea://open?file={path}&line={line}',
  },
  neovim: {
    label: 'Neovim',
    protocol: 'nvim://open?url=file://{path}&line={line}',
  },
};

function getEditor() {
  return localStorage.getItem('exba_docs_editor') || 'vscode';
}

function getSourceUrl(fullPath: string, line: number) {
  const editor = getEditor();
  const config = EDITOR_CONFIGS[editor] || EDITOR_CONFIGS.vscode;
  return config.protocol
    .replace('{path}', fullPath)
    .replace('{line}', String(line));
}

function formatDescription(text: string): string {
  return text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const languageClass = lang ? `lang-${lang.toLowerCase()}` : '';
    return `<pre class="code-block ${languageClass}"><code>${code.trim()}</code></pre>`;
  });
}

function renderApp() {
  const root = document.getElementById('root');
  if (!root) return;

  const entries = apiData.entries as DocEntry[];
  const groups: Record<string, Record<string, DocEntry[]>> = {};

  entries.forEach((entry) => {
    if (!groups[entry.module]) groups[entry.module] = {};
    const container = entry.container || 'Global';
    if (!groups[entry.module][container]) groups[entry.module][container] = [];
    groups[entry.module][container].push(entry);
  });

  const documentedCount = apiData.stats.covered;
  const undocumentedCount = apiData.stats.undocumented;

  let groupedIndexHtml = '';
  for (const [module, containers] of Object.entries(groups)) {
    groupedIndexHtml += `<div class="nav-group"><span class="nav-group-title">${module}</span>`;
    for (const [container, members] of Object.entries(containers)) {
      groupedIndexHtml += `<ul class="nav-container-list">${members
        .map(
          (m) =>
            `<li data-name="${m.name.toLowerCase()}"><a href="#${m.name}" onclick="window.closeSidebar()">${m.name}</a></li>`,
        )
        .join('')}</ul>`;
    }
    groupedIndexHtml += `</div>`;
  }

  const currentEditor = getEditor();
  let editorOptions = '';
  for (const [id, cfg] of Object.entries(EDITOR_CONFIGS)) {
    editorOptions += `<option value="${id}" ${id === currentEditor ? 'selected' : ''}>${cfg.label}</option>`;
  }

  let htmlContent = '';
  for (const [module, containers] of Object.entries(groups)) {
    htmlContent += `<section class="module-group"><h2 class="module-name">${module}</h2>`;
    for (const [container, members] of Object.entries(containers)) {
      htmlContent += `<div class="container-group"><h3 class="container-name">${container}</h3>${members
        .map(
          (entry) => `
            <div class="entry" id="${entry.name}" data-name="${entry.name.toLowerCase()}" data-documented="${entry.description !== '(No description provided)'}">
              <div class="entry-header">
                <div class="header-left">
                  <span class="type">${entry.type}</span>
                  <span class="name">${entry.name}</span>
                </div>
                <div class="header-right">${entry.isPublic ? '<span class="badge pub">public</span>' : ''}</div>
              </div>
              ${entry.signature ? `<div class="signature-wrapper"><div class="signature"><code>${entry.signature}</code></div><button class="copy-btn" onclick="window.copySignature('${entry.signature.replace(/'/g, "\\'")}')">Copy</button></div>` : ''}
              <div class="description">${formatDescription(entry.description)}</div>
              ${entry.params ? `<div class="section"><strong>Parameters</strong><div class="table-container"><table class="params-table"><thead><tr><th>Name</th><th>Type</th><th>Description</th></tr></thead><tbody>${entry.params.map((p) => `<tr><td><code>${p.name}</code></td><td><span class="type-small">${p.type}</span></td><td>${p.description}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
              ${entry.returns ? `<div class="section returns-section"><strong>Returns</strong><div class="returns-content"><code>${entry.returns.type}</code><span class="returns-desc">${entry.returns.description}</span></div></div>` : ''}
              <div class="file-path"><a href="${getSourceUrl(entry.fullPath, entry.lineNumber)}" class="source-link" title="Open in Editor"><span class="path-icon">📁</span> ${entry.filePath} <span class="line-info">(Line ${entry.lineNumber})</span></a></div>
            </div>`,
        )
        .join('')}</div>`;
    }
    htmlContent += `</section>`;
  }

  root.innerHTML = `
    <div class="mobile-header">
        <button class="menu-toggle" onclick="window.toggleSidebar()">☰</button>
        <div style="font-weight: 800; color: var(--text)">API Docs</div>
        <div style="width: 2.5rem"></div>
    </div>
    <div class="overlay" id="overlay" onclick="window.closeSidebar()"></div>
    <aside id="sidebar">
        <div class="sidebar-header"><h1>${apiData.projectName} API</h1></div>
        
        <div style="margin-bottom: 1rem; padding: 0.75rem; background: var(--bg); border: 1px solid var(--border); border-radius: 8px;">
          <div style="font-size: 0.65rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">Editor Choice</div>
          <select class="search-box" style="margin-bottom: 0; padding: 0.4rem; font-size: 0.8rem;" onchange="window.setEditor(this.value)">
            ${editorOptions}
          </select>
        </div>

        <input type="text" class="search-box" id="search" placeholder="Search API..." oninput="window.filterDocs()">
        <nav>${groupedIndexHtml}</nav>
    </aside>
    <main>
        <div class="filter-toolbar">
            <div class="filter-options">
                <button class="filter-btn active" onclick="window.setFilter('all', this)">All</button>
                <button class="filter-btn" onclick="window.setFilter('documented', this)">Docs</button>
                <button class="filter-btn" onclick="window.setFilter('undocumented', this)">Missing</button>
            </div>
            <div class="filter-stats">
                <span class="stat-pill">Total: ${entries.length}</span>
                <span class="stat-pill">Covered: ${documentedCount}</span>
                <span class="stat-pill">Remaining: ${undocumentedCount}</span>
            </div>
        </div>
        ${htmlContent}
    </main>
  `;
}

// Global functions for template callbacks
(window as any).toggleSidebar = () => {
  document.getElementById('sidebar')?.classList.toggle('open');
  document.getElementById('overlay')?.classList.toggle('open');
  document.body.style.overflow = document
    .getElementById('sidebar')
    ?.classList.contains('open')
    ? 'hidden'
    : '';
};

(window as any).closeSidebar = () => {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('overlay')?.classList.remove('open');
  document.body.style.overflow = '';
};

(window as any).copySignature = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    const btn = event?.target as HTMLElement;
    if (btn) {
      const originalText = btn.innerText;
      btn.innerText = 'Copied!';
      setTimeout(() => {
        btn.innerText = originalText;
      }, 2000);
    }
  } catch (err) {
    console.error('Failed to copy', err);
  }
};

let currentFilter = 'all';
(window as any).setFilter = (filter: string, btn: HTMLElement) => {
  currentFilter = filter;
  document
    .querySelectorAll('.filter-btn')
    .forEach((b) => b.classList.remove('active'));
  btn.classList.add('active');
  (window as any).filterDocs();
};

(window as any).filterDocs = () => {
  const query = (
    document.getElementById('search') as HTMLInputElement
  ).value.toLowerCase();

  document.querySelectorAll('aside li').forEach((li) => {
    const name = li.getAttribute('data-name');
    (li as HTMLElement).style.display = name?.includes(query)
      ? 'block'
      : 'none';
  });

  document.querySelectorAll('.entry').forEach((entry) => {
    const name = entry.getAttribute('data-name');
    const isDocumented = entry.getAttribute('data-documented') === 'true';
    const matchesSearch = name?.includes(query);
    let matchesStatus = true;
    if (currentFilter === 'documented') matchesStatus = isDocumented;
    if (currentFilter === 'undocumented') matchesStatus = !isDocumented;
    (entry as HTMLElement).style.display =
      matchesSearch && matchesStatus ? 'block' : 'none';
  });

  document.querySelectorAll('.container-group').forEach((group) => {
    const hasVisible = Array.from(group.querySelectorAll('.entry')).some(
      (e) => (e as HTMLElement).style.display !== 'none',
    );
    (group as HTMLElement).style.display = hasVisible ? 'block' : 'none';
  });
  document.querySelectorAll('.module-group').forEach((group) => {
    const hasVisible = Array.from(group.querySelectorAll('.entry')).some(
      (e) => (e as HTMLElement).style.display !== 'none',
    );
    (group as HTMLElement).style.display = hasVisible ? 'block' : 'none';
  });
};

(window as any).setEditor = (id: string) => {
  localStorage.setItem('exba_docs_editor', id);
  renderApp();
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') (window as any).closeSidebar();
});

renderApp();
