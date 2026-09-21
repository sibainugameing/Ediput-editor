import DOMPurify from 'dompurify';
import { marked } from 'marked';

export const STORAGE_KEY = 'ediput.document.v1';
export const DOCUMENT_NAME_STORAGE_KEY = 'ediput.document-name.v1';
export const DEFAULT_DOCUMENT_NAME = 'ediput-document.md';

export const STARTER_MARKDOWN = `# Ediput

Markdownを編集して、右側でプレビューできます。

## できること

- Markdownの即時プレビュー
- ブラウザ内の自動保存
- Markdown / HTMLとして保存
- Markdownファイルの読み込み
- 印刷ダイアログからPDFとして保存

## PDF出力

「PDF / 印刷」を押し、印刷先で「PDFに保存」を選択してください。

> PDF生成はブラウザの印刷機能を利用します。

```ts
const editor = "ready";
```;

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false }) as string;
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

  return `${stem || 'ediput-document'}.md`;
}

export function htmlFilenameFromMarkdown(name: string): string {
  const leafName = name.replace(/^.*[\\/]/, '').trim();
  const stem = leafName.replace(/\.(?:md|markdown|txt|html)$/i, '').trim();

  return `${stem || 'ediput-document'}.html`;
}

export function makeDocumentHtml(content: string): string {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ediput document</title>
<style>
body{font:16px/1.75 system-ui,-apple-system,sans-serif;max-width:800px;margin:48px auto;padding:0 24px;color:#20242b}
img{max-width:100%;height:auto}
pre{overflow:auto;background:#f2f4f7;padding:16px;border-radius:8px;white-space:pre-wrap}
blockquote{border-left:3px solid #8a96a8;padding-left:16px;color:#596273}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid #ccd2da;padding:6px 10px;text-align:left}
a{color:#267c83}
@media print{
  @page{size:A4;margin:18mm}
  body{max-width:none;margin:0;padding:0}
  h1,h2,h3{break-after:avoid}
  pre,blockquote,table,img{break-inside:avoid}
  pre{white-space:pre-wrap;overflow-wrap:anywhere}
}
</style>
</head>
<body>${content}</body>
</html>`;
}
