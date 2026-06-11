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
          line.match(/impl\s+(?:[a-zA-Z0-9_<>]+)\s+for\s+([a-zA-Z0-9_<>]+)/) ||
          line.match(/impl\s+([a-zA-Z0-9_<>]+)/);
        if (implMatch) {
          currentContainer = implMatch[1];
        }
      }

      if (line === '}') {
        currentContainer = undefined;
      }

      // Detect pub items or wasm_bindgen items
      const isPublic = line.startsWith('pub ');
      const isWasmBindgen = i > 0 && lines[i - 1].trim().startsWith('#[wasm_bindgen');

      // Only proceed if it's a primary declaration, not a struct field
      const isPrimaryDecl = line.match(/^pub\s+(?:fn|struct|enum|trait|const|type)\s+/);

      if (isPrimaryDecl || isWasmBindgen) {
        // 1. Look back for doc comments
        const docLines: string[] = [];
        let j = i - (isWasmBindgen ? 2 : 1);
        while (j >= 0 && lines[j].trim().startsWith('///')) {
          docLines.unshift(lines[j].trim().substring(3).trim());
          j--;
        }

        // 2. Capture multi-line signature
        let signature = line;
        let k = i + 1;
        // Search forward for the end of the signature
        while (k < lines.length) {
          const nextLine = lines[k].trim();
          if (!nextLine) { k++; continue; }
          
          // Stop if we hit a block start, statement end, or another declaration
          if (nextLine.startsWith('{') || nextLine.startsWith(';') || nextLine.startsWith('pub ') || nextLine.startsWith('#[')) {
            break;
          }
          
          signature += ' ' + nextLine;
          if (signature.includes('fn ') && (nextLine.includes(')') || nextLine.includes('->'))) {
             // likely end of fn sig part, but keep going until { or ;
          }
          k++;
        }
        
        // Clean up signature (remove block start if it leaked in)
        signature = signature.split('{')[0].trim();
        if (signature.endsWith(';')) signature = signature.slice(0, -1);

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
            // If it's wasm_bindgen, it's definitely public API
            isPublic: isPublic || isWasmBindgen,
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
  ): Omit<DocEntry, 'module' | 'container'> | null {
    let description = '';
    const sectionMap: Record<string, string[]> = { main: [] };
    let currentSection = 'main';

    for (const docLine of docLines) {
      const headingMatch = docLine.match(/^#+\s+(.*)/);
      if (headingMatch) {
        currentSection = headingMatch[1].toLowerCase().trim();
        sectionMap[currentSection] = [];
      } else {
        sectionMap[currentSection].push(docLine);
      }
    }

    description = sectionMap.main.join(' ').trim();

    let type: DocEntry['type'] = 'variable';
    let name = '';
    let params: Param[] = [];
    let returns;

    if (declaration.includes('fn ')) {
      type = 'function';
      const nameMatch = declaration.match(/fn\s+([a-zA-Z0-9_]+)/);
      if (nameMatch) {
        name = nameMatch[1];
        const paramsMatch = declaration.match(/\(([\s\S]*?)\)/);
        const paramsText = paramsMatch ? paramsMatch[1] : '';
        const signatureParams = this.splitParameters(paramsText).map((p) => {
          const parts = p.trim().split(':');
          let pName = parts[0]?.trim() || 'unknown';
          // Clean up Rust-specific param patterns like &self, mut self, etc.
          if (pName.includes('self')) pName = 'self';
          
          return {
            name: pName,
            type: parts[1]?.trim() || (pName === 'self' ? 'Self' : 'unknown'),
          };
        });

        const paramDescriptions: Record<string, string> = {};
        const argsSection = sectionMap.arguments || sectionMap.args || [];
        for (const argLine of argsSection) {
          const match = argLine.match(/^\*\s*`?([a-zA-Z0-9_]+)`?\s*-\s*(.*)/) || 
                       argLine.match(/^\s*`?([a-zA-Z0-9_]+)`?\s*:\s*(.*)/);
          if (match) {
            paramDescriptions[match[1]] = match[2].trim();
          }
        }

        params = signatureParams
          .filter(p => p.name !== 'self') // Usually don't document 'self' in high-level API docs
          .map((p) => ({
            ...p,
            description: paramDescriptions[p.name] || 'See function description',
          }));

        const returnMatch = declaration.match(
          /->\s*([a-zA-Z0-9_<>[\]\s,()]+)(?=[^{;]*$)/,
        );
        if (returnMatch) {
          const retType = returnMatch[1].trim();
          const retDesc = (sectionMap.returns || sectionMap.return || []).join(' ').trim() || 'Return value';
          returns = {
            type: retType,
            description: retDesc,
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

    // Add examples to description if they exist
    if (sectionMap.examples && sectionMap.examples.length > 0) {
      description += '\n\n**Examples:**\n' + sectionMap.examples.join('\n');
    }

    return {
      name,
      type,
      description: description || '(No description provided)',
      signature: declaration.trim(),
      params: params.length > 0 ? params : undefined,
      returns,
      filePath,
      fullPath: filePath,
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
