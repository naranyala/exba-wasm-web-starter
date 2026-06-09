import type { DocEntry } from './types';

function formatDescription(text: string): string {
  return text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const languageClass = lang ? `lang-${lang.toLowerCase()}` : '';
    return `<pre class="code-block ${languageClass}"><code>${code.trim()}</code></pre>`;
  });
}

export function generateHTML(
  entries: DocEntry[],
  title: string = 'API Documentation',
): string {
  // Group by Module -> Container
  const groups: Record<string, Record<string, DocEntry[]>> = {};

  entries.forEach((entry) => {
    if (!groups[entry.module]) groups[entry.module] = {};
    const container = entry.container || 'Global';
    if (!groups[entry.module][container]) groups[entry.module][container] = [];
    groups[entry.module][container].push(entry);
  });

  const documentedCount = entries.filter(
    (e) => e.description !== '(No description provided)',
  ).length;
  const undocumentedCount = entries.length - documentedCount;

  // Generate grouped index for sidebar
  let groupedIndexHtml = '';
  for (const [module, containers] of Object.entries(groups)) {
    groupedIndexHtml += `<div class="nav-group">
      <span class="nav-group-title">${module}</span>`;
    for (const [container, members] of Object.entries(containers)) {
      groupedIndexHtml += `
        <ul class="nav-container-list">
          ${members.map((m) => `<li data-name="${m.name.toLowerCase()}"><a href="#${m.name}">${m.name}</a></li>`).join('')}
        </ul>`;
    }
    groupedIndexHtml += `</div>`;
  }

  let htmlContent = '';
  for (const [module, containers] of Object.entries(groups)) {
    htmlContent += `<section class="module-group">
      <h2 class="module-name">${module}</h2>`;

    for (const [container, members] of Object.entries(containers)) {
      htmlContent += `
        <div class="container-group">
          <h3 class="container-name">${container}</h3>
          ${members
            .map(
              (entry) => `
            <div class="entry" 
                 id="${entry.name}" 
                 data-name="${entry.name.toLowerCase()}" 
                 data-documented="${entry.description !== '(No description provided)'}">
              <div class="entry-header">
                <div class="header-left">
                  <span class="type">${entry.type}</span>
                  <span class="name">${entry.name}</span>
                </div>
                <div class="header-right">
                  ${entry.isPublic ? '<span class="badge pub">public</span>' : ''}
                </div>
              </div>
              ${
                entry.signature
                  ? `
                <div class="signature-wrapper">
                  <div class="signature"><code>${entry.signature}</code></div>
                  <button class="copy-btn" onclick="copySignature('${entry.signature.replace(/'/g, "\\'")}')">
                    Copy
                  </button>
                </div>`
                  : ''
              }
              <div class="description">${formatDescription(entry.description)}</div>
              ${
                entry.params
                  ? `
                <div class="section">
                  <strong>Parameters</strong>
                  <table class="params-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${entry.params
                        .map(
                          (p) => `
                        <tr>
                          <td><code>${p.name}</code></td>
                          <td><span class="type-small">${p.type}</span></td>
                          <td>${p.description}</td>
                        </tr>
                      `,
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>
              `
                  : ''
              }
              ${
                entry.returns
                  ? `
                <div class="section returns-section">
                  <strong>Returns</strong>
                  <div class="returns-content">
                    <code>${entry.returns.type}</code>
                    <span class="returns-desc">${entry.returns.description}</span>
                  </div>
                </div>
              `
                  : ''
              }
              <div class="file-path">
                <span class="path-icon">📁</span> ${entry.filePath} <span class="line-info">(Line ${entry.lineNumber})</span>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      `;
    }
    htmlContent += `</section>`;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        :root {
            --primary: #60a5fa;
            --bg: #0f172a;
            --card-bg: #1e293b;
            --text: #f1f5f9;
            --text-muted: #94a3b8;
            --border: #334155;
            --accent: #334155;
            --code-bg: #0f172a;
            --badge-bg: #064e3b;
            --badge-text: #6ee7b7;
        }
        body {
            font-family: 'Inter', -apple-system, system-ui, sans-serif;
            line-height: 1.6;
            color: var(--text);
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            background-color: var(--bg);
        }
        h1 { 
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 2rem;
            text-align: center;
            color: var(--text);
        }
        .container { display: flex; gap: 3rem; }
        nav {
            width: 300px;
            position: sticky;
            top: 2rem;
            max-height: calc(100vh - 4rem);
            overflow-y: auto;
            background: var(--card-bg);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
            border: 1px solid var(--border);
            scrollbar-width: thin;
            scrollbar-color: var(--border) transparent;
        }
        nav::-webkit-scrollbar {
            width: 6px;
        }
        nav::-webkit-scrollbar-thumb {
            background-color: var(--border);
            border-radius: 10px;
        }
        .search-box {
            width: 100%;
            padding: 0.6rem;
            margin-bottom: 1rem;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            color: white;
            font-family: inherit;
        }
        nav strong { display: block; margin-bottom: 1rem; font-size: 1.1rem; }
        .nav-group { margin-bottom: 1.5rem; }
        .nav-group-title { 
            display: block;
            font-size: 0.75rem; 
            text-transform: uppercase; 
            color: var(--primary); 
            font-weight: 700; 
            margin-bottom: 0.5rem; 
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--border);
            padding-bottom: 0.25rem;
        }
        .nav-container-list { list-style: none; padding: 0; margin: 0 0 1rem 0; }
        .nav-container-list li { margin-bottom: 0.2rem; }
        nav a { 
            text-decoration: none; 
            color: var(--text-muted); 
            font-size: 0.85rem; 
            display: block;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            transition: all 0.2s;
        }
        nav a:hover { background: var(--accent); color: var(--primary); }
        main { flex: 1; }
        .filter-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            background: var(--card-bg);
            padding: 1rem;
            border-radius: 12px;
            border: 1px solid var(--border);
            gap: 1rem;
        }
        .filter-options {
            display: flex;
            background: var(--bg);
            padding: 0.25rem;
            border-radius: 8px;
            border: 1px solid var(--border);
        }
        .filter-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 0.4rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.2s;
        }
        .filter-btn.active {
            background: var(--primary);
            color: white;
        }
        .filter-stats {
            font-size: 0.85rem;
            color: var(--text-muted);
            display: flex;
            gap: 1rem;
        }
        .stat-pill {
            background: var(--bg);
            padding: 0.2rem 0.6rem;
            border-radius: 999px;
            border: 1px solid var(--border);
        }
        .module-group { margin-bottom: 4rem; }
        .module-name { 
            font-size: 1.8rem; 
            color: var(--primary); 
            border-bottom: 2px solid var(--border); 
            padding-bottom: 0.5rem; 
            margin-bottom: 2rem;
        }
        .container-group { margin-bottom: 3rem; }
        .container-name { 
            font-size: 1.4rem; 
            color: #cbd5e1; 
            margin-bottom: 1.5rem; 
            display: flex; 
            align-items: center; 
            gap: 0.5rem;
        }
        .container-name::before { content: '📦'; }
        .entry {
            background: var(--card-bg);
            padding: 2rem;
            margin-bottom: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border);
            transition: transform 0.2s;
        }
        .entry:hover { transform: translateY(-2px); }
        .entry-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 1rem; 
        }
        .header-left { display: flex; align-items: center; gap: 1rem; }
        .signature-wrapper { position: relative; margin-bottom: 1.5rem; }
        .signature {
            background: var(--code-bg);
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            border: 1px solid var(--border);
            border-left: 4px solid var(--primary);
        }
        .signature code {
            background: transparent;
            color: inherit;
            padding: 0;
        }
        .copy-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--accent);
            color: var(--text);
            border: 1px solid var(--border);
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
        }
        .signature-wrapper:hover .copy-btn { opacity: 1; }
        .type {
            background: var(--accent);
            color: var(--primary);
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 700;
        }
        .name { font-size: 1.75rem; font-weight: 700; color: #ffffff; }
        .badge { font-size: 0.7rem; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 600; }
        .badge.pub { background: var(--badge-bg); color: var(--badge-text); }
        .description { font-size: 1.1rem; margin-bottom: 1.5rem; color: #cbd5e1; }
        .code-block {
            background: var(--code-bg);
            border: 1px solid var(--border);
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            color: #f8fafc;
        }
        .code-block code {
            background: transparent;
            padding: 0;
            color: inherit;
        }
        .section { margin-bottom: 1.5rem; padding: 1rem; background: #1e293b; border: 1px solid var(--border); border-radius: 8px; }
        .section strong { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted); }
        .params-table { 
            width: 100%; 
            border-collapse: collapse; 
            font-size: 0.9rem; 
            text-align: left; 
        }
        .params-table th, .params-table td { 
            padding: 0.5rem; 
            border-bottom: 1px solid var(--border); 
        }
        .params-table th { color: var(--text-muted); font-weight: 600; }
        .returns-section { border-left: 4px solid var(--primary); }
        .returns-content { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
        .returns-desc { color: var(--text-muted); font-size: 0.9rem; }
        .type-small { color: var(--text-muted); font-style: italic; font-size: 0.9rem; }
        .file-path { 
            font-size: 0.8rem; 
            color: var(--text-muted); 
            margin-top: 1.5rem; 
            text-align: right; 
            border-top: 1px solid var(--border); 
            padding-top: 1rem; 
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 0.4rem;
        }
        .path-icon { font-size: 1rem; }
        .line-info { opacity: 0.6; }
        code { background: #334155; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: #e2e8f0; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="container">
        <nav>
            <input type="text" class="search-box" id="search" placeholder="Search API..." oninput="filterDocs()">
            <strong>API Index</strong>
            ${groupedIndexHtml}
        </nav>
        <main>
            <div class="filter-toolbar">
                <div class="filter-options">
                    <button class="filter-btn active" onclick="setFilter('all', this)">All</button>
                    <button class="filter-btn" onclick="setFilter('documented', this)">Documented</button>
                    <button class="filter-btn" onclick="setFilter('undocumented', this)">Undocumented</button>
                </div>
                <div class="filter-stats">
                    <span class="stat-pill">Total: ${entries.length}</span>
                    <span class="stat-pill">Docs: ${documentedCount}</span>
                    <span class="stat-pill">Missing: ${undocumentedCount}</span>
                </div>
            </div>
            ${htmlContent}
        </main>
    </div>
    <script>
        let currentFilter = 'all';

        async function copySignature(text) {
            try {
                await navigator.clipboard.writeText(text);
                // Simple feedback could be added here
            } catch (err) {
                console.error('Failed to copy', err);
            }
        }

        function setFilter(filter, btn) {
            currentFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterDocs();
        }

        function filterDocs() {
            const query = document.getElementById('search').value.toLowerCase();
            
            // Filter Sidebar
            document.querySelectorAll('nav li').forEach(li => {
                const name = li.getAttribute('data-name');
                li.style.display = name.includes(query) ? 'block' : 'none';
            });

            // Filter Main Content
            document.querySelectorAll('.entry').forEach(entry => {
                const name = entry.getAttribute('data-name');
                const isDocumented = entry.getAttribute('data-documented') === 'true';
                
                const matchesSearch = name.includes(query);
                let matchesStatus = true;
                if (currentFilter === 'documented') matchesStatus = isDocumented;
                if (currentFilter === 'undocumented') matchesStatus = !isDocumented;
                
                entry.style.display = (matchesSearch && matchesStatus) ? 'block' : 'none';
            });
            
            // Hide empty containers
            document.querySelectorAll('.container-group').forEach(group => {
                const hasVisible = Array.from(group.querySelectorAll('.entry')).some(e => e.style.display !== 'none');
                group.style.display = hasVisible ? 'block' : 'none';
            });
            // Hide empty modules
            document.querySelectorAll('.module-group').forEach(group => {
                const hasVisible = Array.from(group.querySelectorAll('.entry')).some(e => e.style.display !== 'none');
                group.style.display = hasVisible ? 'block' : 'none';
            });
        }
    </script>
</body>
</html>
  `;
}
