import fs from 'node:fs';
import path from 'node:path';
import {
  BaseParser,
  type DocEntry,
  type Param,
  type ParserResult,
  type Return,
} from '../types';

export class TSParser extends BaseParser {
  supportedExtensions = ['.ts', '.js', '.tsx', '.jsx'];

  parseFile(filePath: string): ParserResult {
    const content = fs.readFileSync(filePath, 'utf-8');
    const entries: DocEntry[] = [];
    const warnings: string[] = [];
    const moduleName = path.basename(filePath);

    const lines = content.split('\n');
    let currentContainer: string | undefined;

    // Pre-scan for class boundaries to handle context
    const classPositions: {
      name: string;
      startLine: number;
      endLine: number;
    }[] = [];
    const classRegex = /class\s+([a-zA-Z0-9_]+)/;

    lines.forEach((line, idx) => {
      const match = line.match(classRegex);
      if (match) {
        let braceCount = 0;
        let endLine = idx;
        for (let i = idx; i < lines.length; i++) {
          braceCount += (lines[i].match(/\{/g) || []).length;
          braceCount -= (lines[i].match(/\}/g) || []).length;
          if (braceCount === 0 && i > idx) {
            endLine = i;
            break;
          }
        }
        classPositions.push({ name: match[1], startLine: idx, endLine });
      }
    });

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Identify potential declarations
      const nameMatch =
        trimmed.match(
          /(?:export\s+)?(?:function|class|const|let|var|interface|enum|type)\s+([a-zA-Z0-9_]+)/,
        ) || trimmed.match(/(?:export\s+)?([a-zA-Z0-9_]+)\s*\(/);

      if (!nameMatch) continue;

      const name = nameMatch[1];

      // Only expose if it's exported or we are inside a class (method)
      const isExported = trimmed.startsWith('export');
      const container = classPositions.find(
        (cp) => i >= cp.startLine && i <= cp.endLine,
      );
      currentContainer = container?.name;

      if (!isExported && !currentContainer) continue;

      let type: DocEntry['type'] = 'variable';
      if (trimmed.includes('function')) type = 'function';
      else if (trimmed.includes('class')) type = 'class';
      else if (trimmed.includes('interface')) type = 'interface';
      else if (trimmed.includes('enum')) type = 'enum';
      else if (trimmed.includes('type')) type = 'variable';
      else if (trimmed.match(/([a-zA-Z0-9_]+)\s*\(/)) {
        type = currentContainer ? 'method' : 'function';
      }

      // Look back for JSDoc
      let comment = '';
      let j = i - 1;
      while (j >= 0 && lines[j].trim().startsWith('*')) {
        comment = lines[j] + '\n' + comment;
        j--;
      }
      if (j >= 0 && lines[j].trim().endsWith('*/')) {
        comment = lines[j] + '\n' + comment;
        j--;
        while (
          j >= 0 &&
          (lines[j].trim().startsWith('*') || lines[j].trim().startsWith('/**'))
        ) {
          if (lines[j].trim().startsWith('/**')) {
            comment = lines[j] + '\n' + comment;
            break;
          }
          comment = lines[j] + '\n' + comment;
          j--;
        }
      }

      const description = this.parseDescription(comment);
      const params = this.parseParams(comment);
      const returns = this.parseReturns(comment);

      entries.push({
        name,
        type,
        description: description || '(No description provided)',
        signature: trimmed,
        params,
        returns,
        filePath,
        lineNumber: i + 1,
        isPublic: isExported || !!currentContainer,
        container: currentContainer,
        module: moduleName,
      });
    }

    return { entries, warnings };
  }

  private parseDescription(comment: string): string {
    if (!comment) return '';
    return comment
      .split('\n')
      .map((line) => line.trim().replace(/^\*\s?/, ''))
      .filter((line) => line && !line.startsWith('@'))
      .join(' ')
      .trim();
  }

  private parseParams(comment: string): Param[] | undefined {
    if (!comment) return undefined;
    const params: Param[] = [];
    const lines = comment.split('\n');
    for (const line of lines) {
      const trimmed = line.trim().replace(/^\*\s?/, '');
      if (trimmed.startsWith('@param')) {
        const match = trimmed.match(
          /@param\s+{(.*?)}\s+([a-zA-Z0-9_]+)\s*(.*)/,
        );
        if (match) {
          params.push({
            type: match[1],
            name: match[2],
            description: match[3].trim(),
          });
        } else {
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

  private parseReturns(comment: string): Return | undefined {
    if (!comment) return undefined;
    const lines = comment.split('\n');
    for (const line of lines) {
      const trimmed = line.trim().replace(/^\*\s?/, '');
      if (trimmed.startsWith('@returns')) {
        const match = trimmed.match(/@returns\s+{(.*?)}\s*(.*)/);
        if (match) {
          return { type: match[1], description: match[2].trim() };
        } else {
          const simpleMatch = trimmed.match(/@returns\s*(.*)/);
          if (simpleMatch) {
            return { type: 'any', description: simpleMatch[1].trim() };
          }
        }
      }
    }
    return undefined;
  }
}
