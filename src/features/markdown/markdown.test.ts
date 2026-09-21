// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  makeDocumentHtml,
  renderMarkdown,
  sanitizeHtml,
} from './markdown';

function render(source: string): string {
  return sanitizeHtml(renderMarkdown(source));
}

describe('Markdown math rendering', () => {
  it('renders each supported inline and display delimiter', () => {
    const html = render(
      '\\(\nx\n\\) and $y$\n\n\\[\na = b\n\\]\n\n$$\nc = d\n$$',
    );

    expect(html.match(/class="math-inline"/g)).toHaveLength(2);
    expect(html.match(/class="math-display"/g)).toHaveLength(2);
    expect(html).toContain('katex');
  });

  it('supports multiline display math', () => {
    const html = render('$$\n\\frac{P}{V}\n$$\n\n\\[\n\\frac{I}{R}\n\\]');

    expect(html.match(/class="math-display"/g)).toHaveLength(2);
    expect(html).toContain('frac');
  });

  it('does not turn code, escaped dollars, or unclosed prices into math', () => {
    const inlineCode = String.fromCharCode(96);
    const html = render(
      'Inline code: ' + inlineCode + '$x$' + inlineCode +
      '\n\n~~~ts\nconst value = "$x$";\n~~~\n\n\\$100 and $100',
    );

    expect(html).not.toContain('math-inline');
    expect(html).toContain('$x$');
    expect(html).toContain('$100');
  });

  it('keeps invalid source and shows an error message', () => {
    const html = render('$\\notACommand$');

    expect(html).toContain('math-error');
    expect(html).toContain('\\notACommand');
    expect(html).toContain('Undefined control sequence');
  });

  it('includes KaTeX and math-error styles in saved HTML', () => {
    const html = makeDocumentHtml('<span class="math-error">bad math</span>');

    expect(html).toContain('katex@0.16.22');
    expect(html).toContain('.math-error');
    expect(html).toContain('.math-error-message');
  });
});
