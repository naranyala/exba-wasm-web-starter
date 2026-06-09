import fs from 'node:fs';
import path from 'node:path';

export interface DocEntry {
  name: string;
  type: 'function' | 'class' | 'variable' | 'interface';
  description: string;
  params?: { name: string; type: string; description: string }[];
  returns?: { type: string; description: string };
  filePath: string;
}

export function parseFile(filePath: string): DocEntry[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const entries: DocEntry[] = [];

  // Regex to match JSDoc comments and the following line
  const jsdocRegex = /\/\*\*([\s\S]*?)\*\/\s*([^{]*)/g;
  let match;

  while ((match = jsdocRegex.exec(content)) !== null) {
    const comment = match[1];
    const declaration = match[2].trim();

    // Basic extraction of name and type
    const nameMatch =
      declaration.match(/(?:function|class|const|let|var)\s+([a-zA-Z0-9_]+)/) ||
      declaration.match(/([a-zA-Z0-9_]+)\s*\(/);
    if (!nameMatch) continue;

    const name = nameMatch[1];
    let type: DocEntry['type'] = 'variable';
    if (declaration.includes('function')) type = 'function';
    else if (declaration.includes('class')) type = 'class';
    else if (declaration.includes('interface')) type = 'interface';
    else if (declaration.match(/([a-zA-Z0-9_]+)\s*\(/)) type = 'function'; // Method

    const description = parseDescription(comment);
    const params = parseParams(comment);
    const returns = parseReturns(comment);

    entries.push({
      name,
      type,
      description,
      params,
      returns,
      filePath,
    });
  }

  return entries;
}

function parseDescription(comment: string): string {
  return comment
    .split('\n')
    .map((line) => line.trim().replace(/^\*\s?/, ''))
    .filter((line) => line && !line.startsWith('@'))
    .join(' ')
    .trim();
}

function parseParams(comment: string): DocEntry['params'] | undefined {
  const params: DocEntry['params'] = [];
  const lines = comment.split('\n');

  for (const line of lines) {
    const trimmed = line.trim().replace(/^\*\s?/, '');
    if (trimmed.startsWith('@param')) {
      // Try to match @param {type} name description
      const match = trimmed.match(/@param\s+{(.*?)}\s+([a-zA-Z0-9_]+)\s*(.*)/);
      if (match) {
        params.push({
          type: match[1],
          name: match[2],
          description: match[3].trim(),
        });
      } else {
        // Try to match @param name description
        const simpleMatch = trimmed.match(/@param\s+([a-zA-Z0-9_]+)\s*(.*)/);
        if (simpleMatch) {
          params.push({
            type: 'any',
            name: simpleMatch[1],
            description: simpleMatch[2].trim(),
          });
        }
      }
    }
  }

  return params.length > 0 ? params : undefined;
}

function parseReturns(comment: string): DocEntry['returns'] | undefined {
  const lines = comment.split('\n');
  for (const line of lines) {
    const trimmed = line.trim().replace(/^\*\s?/, '');
    if (trimmed.startsWith('@returns')) {
      const match = trimmed.match(/@returns\s+{(.*?)}\s*(.*)/);
      if (match) {
        return {
          type: match[1],
          description: match[2].trim(),
        };
      } else {
        const simpleMatch = trimmed.match(/@returns\s*(.*)/);
        if (simpleMatch) {
          return {
            type: 'any',
            description: simpleMatch[1].trim(),
          };
        }
      }
    }
  }
  return undefined;
}

export function scanDirectory(dir: string): DocEntry[] {
  let results: DocEntry[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results = results.concat(scanDirectory(fullPath));
    } else if (file.endsWith('.ts') || file.endsWith('.js')) {
      results = results.concat(parseFile(fullPath));
    }
  }

  return results;
}
