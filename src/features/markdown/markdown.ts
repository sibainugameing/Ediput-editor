import DOMPurify from 'dompurify';
import katex from 'katex';
import { marked } from 'marked';
import 'katex/dist/katex.min.css';

export const STORAGE_KEY = 'ediput.document.v1';
export const DOCUMENT_NAME_STORAGE_KEY = 'ediput.document-name.v1';
export const DEFAULT_DOCUMENT_NAME = 'ediput-document.md';

export const STARTER_MARKDOWN = [
  '# Ediput',
  '',
  'Markdownを編集して、右側でプレビューできます。',
  '',
  '## できること',
  '',
  '- Markdownの即時プレビュー',
  '- ブラウザ内の自動保存',
  '- Markdown / HTMLとして保存',
  '- Markdownファイルの読み込み',
  '- 印刷ダイアログからPDFとして保存',
  '- LaTeX記法の数式表示（\\( ... \\) / \\[ ... \\]）',
  '',
  '## PDF出力',
  '',
  '「PDF / 印刷」を押し、印刷先で「PDFに保存」を選択してください。',
  '',
  '> PDF生成はブラウザの印刷機能を利用します。',
  '',
  '## 数式',
  '',
  '電力から電流を求める式：\\(1000[W] \\div 100[V] = 10[A]\\)',
  '',
  '電流の合計：\\(12.5[A] + 10[A] = 22.5[A]\\)',
  '',
  '\\[',
  'I = \\frac{P}{V}',
  '\\]',
  '',
  '~~~ts',
  'const editor = "ready";',
  '~~~',
].join('\n');

type MathExpression = {
  source: string;
  expression: string;
  displayMode: boolean;
};

const MATH_TOKEN_PATTERN = /\uE000ediput-math-(\d+)\uE001/g;

function isEscaped(source: string, index: number): boolean {
  let slashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function addMathExpression(
  expressions: MathExpression[],
  source: string,
  expression: string,
  displayMode: boolean,
): string {
  const index = expressions.push({
    source,
    expression: expression.trim(),
    displayMode,
  }) - 1;

  return '\uE000ediput-math-' + index + '\uE001';
}

function protectMath(source: string): {
  source: string;
  expressions: MathExpression[];
} {
  const expressions: MathExpression[] = [];

  let maskedSource = '';

  for (let cursor = 0; cursor < source.length; cursor += 1) {
    const character = source[cursor];

    if (character === '\\' && !isEscaped(source, cursor)) {
      const closeDelimiter = source[cursor + 1] === '['
        ? '\\]'
        : source[cursor + 1] === '('
          ? '\\)'
          : null;

      if (closeDelimiter) {
        const closeIndex = source.indexOf(closeDelimiter, cursor + 2);

        if (closeIndex !== -1) {
          const end = closeIndex + closeDelimiter.length;
          maskedSource += addMathExpression(
            expressions,
            source.slice(cursor, end),
            source.slice(cursor + 2, closeIndex),
            closeDelimiter === '\\]',
          );
          cursor = end - 1;
          continue;
        }
      }
    }

    if (character === '$' && !isEscaped(source, cursor)) {
      const displayMode = source[cursor + 1] === '$';
      const delimiterLength = displayMode ? 2 : 1;
      let closeIndex = -1;

      for (let searchFrom = cursor + delimiterLength; searchFrom < source.length; searchFrom += 1) {
        if (source[searchFrom] !== '$' || isEscaped(source, searchFrom)) continue;
        if (!displayMode && (source[searchFrom + 1] === '$' || source[searchFrom - 1] === '$')) continue;
        if (displayMode && source.slice(searchFrom, searchFrom + 2) !== '$$') continue;
        closeIndex = searchFrom;
        break;
      }

      if (closeIndex !== -1) {
        const expression = source.slice(cursor + delimiterLength, closeIndex);
        const hasInlineLineBreak = !displayMode && /[\r\n]/.test(expression);

        if (expression.trim() && !hasInlineLineBreak) {
          const end = closeIndex + delimiterLength;
          maskedSource += addMathExpression(
            expressions,
            source.slice(cursor, end),
            expression,
            displayMode,
          );
          cursor = end - 1;
          continue;
        }
      }
    }

    maskedSource += character;
  }

  return {
    source: maskedSource,
    expressions,
  };
}

function renderMathInHtml(
  html: string,
  expressions: MathExpression[],
): string {
  if (typeof document === 'undefined' || expressions.length === 0) {
    return html;
  }

  const template = document.createElement('template');
  template.innerHTML = html;

  const walker = document.createTreeWalker(
    template.content,
    NodeFilter.SHOW_TEXT,
  );
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const textNode of textNodes) {
    const value = textNode.nodeValue ?? '';
    MATH_TOKEN_PATTERN.lastIndex = 0;

    if (!MATH_TOKEN_PATTERN.test(value)) {
      continue;
    }

    MATH_TOKEN_PATTERN.lastIndex = 0;
    const fragment = document.createDocumentFragment();
    let cursor = 0;

    value.replace(
      MATH_TOKEN_PATTERN,
      (match: string, indexText: string, offset: number) => {
        const index = Number(indexText);
        const item = expressions[index];

        if (!item) {
          return match;
        }

        if (offset > cursor) {
          fragment.appendChild(
            document.createTextNode(value.slice(cursor, offset)),
          );
        }

        const insideCode = Boolean(
          textNode.parentElement?.closest('code, pre, script, style'),
        );

        if (insideCode) {
          fragment.appendChild(document.createTextNode(item.source));
        } else {
          const wrapper = document.createElement('span');
          wrapper.className = item.displayMode
            ? 'math-display'
            : 'math-inline';

          try {
            wrapper.innerHTML = katex.renderToString(item.expression, {
              displayMode: item.displayMode,
              throwOnError: true,
              strict: 'error',
            });
          } catch (error) {
            wrapper.classList.add('math-error');
            const source = document.createElement('code');
            source.textContent = item.source;
            const message = document.createElement('span');
            message.className = 'math-error-message';
            message.textContent = error instanceof Error
              ? error.message
              : '数式を解析できません。';
            wrapper.replaceChildren(source, message);
          }

          fragment.appendChild(wrapper);
        }

        cursor = offset + match.length;
        return match;
      },
    );

    if (cursor < value.length) {
      fragment.appendChild(
        document.createTextNode(value.slice(cursor)),
      );
    }

    textNode.replaceWith(fragment);
  }

  return template.innerHTML;
}

export function renderMarkdown(source: string): string {
  const protectedSource = protectMath(source);
  const html = marked.parse(protectedSource.source, {
    async: false,
  }) as string;

  return renderMathInHtml(html, protectedSource.expressions);
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

export function downloadText(
  filename: string,
  content: string,
  type: string,
): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function markdownFilenameFromImport(name: string): string {
  const leafName = name.replace(/^.*[\\/]/, '').trim();
  const stem = leafName.replace(/\.(?:md|markdown|txt)$/i, '').trim();

  return (stem || 'ediput-document') + '.md';
}

export function htmlFilenameFromMarkdown(name: string): string {
  const leafName = name.replace(/^.*[\\/]/, '').trim();
  const stem = leafName.replace(/\.(?:md|markdown|txt|html)$/i, '').trim();

  return (stem || 'ediput-document') + '.html';
}

export function makeDocumentHtml(content: string): string {
  return '<!doctype html>' +
    '<html lang="ja">' +
    '<head>' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css">' +
    '<title>Ediput document</title>' +
    '<style>' +
    'body{font:16px/1.75 system-ui,-apple-system,sans-serif;max-width:800px;margin:48px auto;padding:0 24px;color:#20242b}' +
    'img{max-width:100%;height:auto}' +
    'pre{overflow:auto;background:#f2f4f7;padding:16px;border-radius:8px;white-space:pre-wrap}' +
    'blockquote{border-left:3px solid #8a96a8;padding-left:16px;color:#596273}' +
    'table{border-collapse:collapse;width:100%}' +
    'th,td{border:1px solid #ccd2da;padding:6px 10px;text-align:left}' +
    'a{color:#267c83}' +
    '.math-inline{white-space:nowrap}' +
    '.math-display{display:block;margin:1em 0;text-align:center}' +
    '.katex{font-size:1.05em}' +
    '.math-error{color:#9e2c2c}' +
    '.math-error code{color:inherit;background:#fff0f0;border:1px solid #e6aaaa}' +
    '.math-error-message{display:block;margin-top:.35em;font-size:.8em;line-height:1.45}' +
    '@media print{' +
      '@page{size:A4;margin:18mm}' +
      'body{max-width:none;margin:0;padding:0}' +
      'h1,h2,h3{break-after:avoid}' +
      'pre,blockquote,table,img,.math-display{break-inside:avoid}' +
      'pre{white-space:pre-wrap;overflow-wrap:anywhere}' +
    '}' +
    '</style>' +
    '</head>' +
    '<body>' + content + '</body>' +
    '</html>';
}
