import fs from 'node:fs';
import path from 'node:path';
import {
  BaseParser,
  type DocEntry,
  type Param,
  type ParserResult,
  Return,
} from '../types';

export class RustParser extends BaseParser {
  supportedExtensions = ['.rs'];

  parseFile(filePath: string): ParserResult {
    const content = fs.readFileSync(filePath, 'utf-8');
    const entries: DocEntry[] = [];
    const warnings: string[] = [];
    const moduleName = path.basename(filePath);

    const lines = content.split('\n');
    let i = 0;
    let currentContainer: string | undefined;

    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.startsWith('impl ')) {
        const implMatch =
          line.match(/impl\s+([a-zA-Z0-9_<>]+)\s+for\s+([a-zA-Z0-9_<>]+)/) ||
          line.match(/impl\s+([a-zA-Z0-9_<>]+)/);
        if (implMatch) {
          currentContainer = implMatch[1] || implMatch[2];
        }
      }

      if (line === '}') {
        currentContainer = undefined;
      }

      // Instead of triggering on ///, trigger on pub declarations
      if (line.startsWith('pub ')) {
        // 1. Look back for doc comments
        const docLines: string[] = [];
        let j = i - 1;
        while (j >= 0 && lines[j].trim().startsWith('///')) {
          docLines.unshift(lines[j].trim().substring(3).trim());
          j--;
        }

        // 2. Handle attributes
        const declarationLine = line;
        // If the line was actually an attribute but the next line is the pub decl
        // We need to be careful. Usually pub is on the same line as fn/struct
        // but it could be #[something] \n pub fn...

        // Capture multi-line signature
        let signature = declarationLine;
        let k = i + 1;
        while (
          k < lines.length &&
          !lines[k].trim().startsWith('{') &&
          !lines[k].trim().startsWith(';')
        ) {
          signature += ' ' + lines[k].trim();
          k++;
        }

        const entry = this.parseDeclaration(
          signature,
          docLines,
          filePath,
          i + 1,
        );
        if (entry) {
          entries.push({
            ...entry,
            container: currentContainer,
            module: moduleName,
          });
        }
      }
      i++;
    }

    return { entries, warnings };
  }

  private parseDeclaration(
    declaration: string,
    docLines: string[],
    filePath: string,
    line: number,
  ): DocEntry | null {
    const description = docLines.join(' ').trim();

    let type: DocEntry['type'] = 'variable';
    let name = '';
    let params: Param[] = [];
    let returns;

    if (declaration.includes('fn ')) {
      type = 'function';
      const nameMatch = declaration.match(/fn\s+([a-zA-Z0-9_]+)/);
      if (nameMatch) {
        name = nameMatch[1];
        const paramsMatch = declaration.match(/\((.*?)\)/);
        const paramsText = paramsMatch ? paramsMatch[1] : '';
        const signatureParams = this.splitParameters(paramsText).map((p) => {
          const parts = p.trim().split(':');
          return {
            name: parts[0]?.trim() || 'unknown',
            type: parts[1]?.trim() || 'unknown',
          };
        });

        const paramDescriptions: Record<string, string> = {};
        let inArgsSection = false;
        for (const docLine of docLines) {
          if (docLine.toLowerCase().includes('# arguments')) {
            inArgsSection = true;
            continue;
          }
          if (inArgsSection && docLine.startsWith('* ')) {
            const parts = docLine.substring(2).split('-');
            if (parts.length >= 2) {
              const pName = parts[0].trim().replace(/`/g, '');
              paramDescriptions[pName] = parts.slice(1).join('-').trim();
            }
          }
        }

        params = signatureParams.map((p) => ({
          ...p,
          description: paramDescriptions[p.name] || 'See function description',
        }));

        const returnMatch = declaration.match(
          /->\s*([a-zA-Z0-9_<>[\]\s]+)(?=[^{;]*$)/,
        );
        if (returnMatch) {
          returns = {
            type: returnMatch[1].trim(),
            description: 'Return value',
          };
        }
      }
    } else if (declaration.includes('struct ')) {
      type = 'struct';
      const nameMatch = declaration.match(/struct\s+([a-zA-Z0-9_]+)/);
      if (nameMatch) name = nameMatch[1];
    } else if (declaration.includes('enum ')) {
      type = 'enum';
      const nameMatch = declaration.match(/enum\s+([a-zA-Z0-9_]+)/);
      if (nameMatch) name = nameMatch[1];
    } else if (declaration.includes('trait ')) {
      type = 'trait';
      const nameMatch = declaration.match(/trait\s+([a-zA-Z0-9_]+)/);
      if (nameMatch) name = nameMatch[1];
    } else if (declaration.includes('const ')) {
      type = 'constant';
      const nameMatch = declaration.match(/const\s+([a-zA-Z0-9_]+)/);
      if (nameMatch) name = nameMatch[1];
    }

    if (!name) return null;

    return {
      name,
      type,
      description: description || '(No description provided)',
      signature: declaration,
      params: params.length > 0 ? params : undefined,
      returns,
      filePath,
      lineNumber: line,
      isPublic: true,
    };
  }

  private splitParameters(paramsText: string): string[] {
    const result: string[] = [];
    let current = '';
    let depth = 0;
    for (const char of paramsText) {
      if (char === '<') depth++;
      if (char === '>') depth--;
      if (char === ',' && depth === 0) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current) result.push(current);
    return result;
  }
}
