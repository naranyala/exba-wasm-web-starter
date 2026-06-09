import { describe, expect, it } from 'vitest';
import { TemplateCompiler } from './TemplateCompiler';

describe('TemplateCompiler', () => {
  const compiler = new TemplateCompiler();

  it('should interpolate simple values', () => {
    const tpl = 'Hello {{name}}!';
    const compiled = compiler.compile(tpl);
    expect(compiled.render({ name: 'World' })).toBe('Hello World!');
  });

  it('should escape HTML', () => {
    const tpl = 'Value: {{val}}';
    const compiled = compiler.compile(tpl);
    expect(compiled.render({ val: '<script>' })).toBe('Value: &lt;script&gt;');
  });

  it('should handle undefined values', () => {
    const tpl = 'Value: {{val}}';
    const compiled = compiler.compile(tpl);
    expect(compiled.render({})).toBe('Value: ');
  });

  it('should cache compiled templates', () => {
    const tpl = 'Hello {{name}}!';
    const c1 = compiler.compile(tpl);
    const c2 = compiler.compile(tpl);
    expect(c1).toBe(c2);
  });
});
