import { useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { Download, FileText, Eye, Pencil, Columns2, Printer, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'ediput.document.v1';
const starter = `# Ediput\n\nMarkdownを編集して、右側でプレビューできます。\n\n## できること\n\n- Markdownの即時プレビュー\n- ブラウザ内の自動保存\n- HTMLとして保存\n- 印刷ダイアログからPDFとして保存\n\n## PDF出力\n\n「PDF / 印刷」を押し、印刷先で「PDFに保存」を選択してください。\n\n> PDF生成はブラウザの印刷機能を利用します。\n\n\`\`\`ts\nconst editor = "ready";\n\`\`\``;

type ViewMode = 'split' | 'edit' | 'preview';

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function makeDocumentHtml(content: string) {
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ediput document</title><style>body{font:16px/1.75 system-ui,-apple-system,sans-serif;max-width:800px;margin:48px auto;padding:0 24px;color:#20242b}img{max-width:100%;height:auto}pre{overflow:auto;background:#f2f4f7;padding:16px;border-radius:8px;white-space:pre-wrap}blockquote{border-left:3px solid #8a96a8;padding-left:16px;color:#596273}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccd2da;padding:6px 10px;text-align:left}a{color:#267c83}@media print{@page{size:A4;margin:18mm}body{max-width:none;margin:0;padding:0}h1,h2,h3{break-after:avoid}pre,blockquote,table,img{break-inside:avoid}pre{white-space:pre-wrap;overflow-wrap:anywhere}}</style></head><body>${content}</body></html>`;
}

export default function App() {
  const [source, setSource] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) ?? starter; }
    catch { return starter; }
  });
  const [view, setView] = useState<ViewMode>('split');
  const [saved, setSaved] = useState(true);
  const rawHtml = useMemo(() => marked.parse(source, { async: false }) as string, [source]);
  const safeHtml = useMemo(() => DOMPurify.sanitize(rawHtml), [rawHtml]);

  useEffect(() => {
    setSaved(false);
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, source); setSaved(true); }
      catch { setSaved(false); }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [source]);

  function exportHtml() {
    downloadText('ediput-document.html', makeDocumentHtml(safeHtml), 'text/html;charset=utf-8');
  }

  function resetDocument() {
    if (window.confirm('現在の文章を初期サンプルに戻しますか？')) setSource(starter);
  }

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#" aria-label="Ediput home"><span className="brand-mark"><FileText size={19}/></span><span>Ediput</span><span className="version">Preview</span></a>
      <div className="top-actions">
        <div className="view-switch" aria-label="表示モード">
          <button className={view === 'edit' ? 'active' : ''} onClick={() => setView('edit')} title="編集"><Pencil size={16}/><span>編集</span></button>
          <button className={view === 'split' ? 'active' : ''} onClick={() => setView('split')} title="分割"><Columns2 size={16}/><span>分割</span></button>
          <button className={view === 'preview' ? 'active' : ''} onClick={() => setView('preview')} title="プレビュー"><Eye size={16}/><span>表示</span></button>
        </div>
        <button className="secondary-button" onClick={resetDocument} title="サンプルに戻す"><RotateCcw size={15}/><span>リセット</span></button>
        <button className="secondary-button" onClick={() => window.print()}><Printer size={16}/><span>PDF / 印刷</span></button>
        <button className="export-button" onClick={exportHtml}><Download size={16}/><span>HTML</span></button>
      </div>
    </header>
    <section className={`workspace mode-${view}`}>
      {view !== 'preview' && <section className="pane editor-pane"><div className="pane-heading"><span>MARKDOWN</span><span className="pane-meta">{source.length} 文字</span></div><CodeMirror value={source} height="100%" extensions={[markdown()]} onChange={setSource} basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }} /></section>}
      {view !== 'edit' && <section className="pane preview-pane"><div className="pane-heading"><span>PREVIEW</span><span className="live-indicator"><i/> LIVE</span></div><article className="markdown-body" dangerouslySetInnerHTML={{ __html: safeHtml }} /></section>}
    </section>
    <footer className="statusbar"><span><i className="status-dot"/> {saved ? '自動保存済み（このブラウザ）' : '保存中…'}</span><span>Markdown · HTML · PDF via Print</span></footer>
  </main>;
}
