export interface CompiledTemplate {
  render(data: Record<string, any>): string;
}

type CompiledFn = (data: Record<string, any>) => string;

export class TemplateCompiler {
  private cache = new Map<string, CompiledFn>();

  compile(template: string): CompiledTemplate {
    const existing = this.cache.get(template);
    if (existing) return { render: existing };

    const fn = this._compile(template);
    this.cache.set(template, fn);
    return { render: fn };
  }

  private _compile(template: string): CompiledFn {
    const parts: Array<string | { type: 'expr'; code: string }> = [];

    let lastIndex = 0;
    const re = /{{([#/]?)([^}]+?)}}/g;
    let match: RegExpExecArray | null;

    while ((match = re.exec(template)) !== null) {
      if (match.index > lastIndex) {
        parts.push(template.slice(lastIndex, match.index));
      }

      const prefix = match[1];
      const content = match[2].trim();

      if (prefix === '#') {
        parts.push({ type: 'expr', code: content });
      } else if (prefix === '/') {
        parts.push({ type: 'expr', code: content });
      } else {
        // Convert {{val}} to a marker <span data-bind="val"></span>
        parts.push(`<span data-bind="${content}"></span>`);
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < template.length) {
      parts.push(template.slice(lastIndex));
    }

    const codeParts: string[] = [];
    const resultVar = '_r';

    codeParts.push(`let ${resultVar}='';`);

    for (const part of parts) {
      if (typeof part === 'string') {
        codeParts.push(`${resultVar}+=${JSON.stringify(part)};`);
      } else if (part.type === 'expr') {
        codeParts.push(`${resultVar}+=(${part.code});`);
      }
    }

    codeParts.push(`return ${resultVar};`);

    const fnBody = `
      return function(data) {
        ${codeParts.join('\n')}
      };
    `;

    try {
      const wrapper = new Function(fnBody);
      return wrapper() as CompiledFn;
    } catch (e) {
      console.error('[TemplateCompiler] Compile error:', e);
      return () => template;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const templateCompiler = new TemplateCompiler();
