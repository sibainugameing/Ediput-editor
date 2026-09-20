import { useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { marked } from 'marked';
import { Download, FileText, Eye, Pencil, Columns2 } from 'lucide-react';

const starter = `# Ediput\n\nMarkdownを編集して、右側でプレビューできます。\n\n## できること\n\n- Markdownの即時プレビュー\n- ブラウザ内での編集\n- HTMLとして保存\n\n> PDF出力は次の実装段階で追加します。\n\n\`\`\`ts\nconst editor = "ready";\n\`\`\``;

type ViewMode = 'split' | 'edit' | 'preview';

export default function App() {
  const [source, setSource] = useState(starter);
  const [view, setView] = useState<ViewMode>('split');
  const html = useMemo(() => marked.parse(source, { async: false }) as string, [source]);

  function exportHtml() {
    const documentHtml = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ediput document</title><style>body{font:16px/1.75 system-ui,sans-serif;max-width:800px;margin:48px auto;padding:0 24px;color:#20242b}pre{overflow:auto;background:#f2f4f7;padding:16px;border-radius:8px}blockquote{border-left:3px solid #8a96a8;padding-left:16px;color:#596273}img{max-width:100%}</style></head><body>${html}</body></html>`;
    const blob = new Blob([documentHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ediput-document.html';
    anchor.click();
    URL.revokeObjectURL(url);
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
        <button className="export-button" onClick={exportHtml}><Download size={16}/><span>HTMLを書き出す</span></button>
      </div>
    </header>
    <section className={`workspace mode-${view}`}>
      {view !== 'preview' && <section className="pane editor-pane"><div className="pane-heading"><span>MARKDOWN</span><span className="pane-meta">{source.length} 文字</span></div><CodeMirror value={source} height="100%" extensions={[markdown()]} onChange={setSource} basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }} /></section>}
      {view !== 'edit' && <section className="pane preview-pane"><div className="pane-heading"><span>PREVIEW</span><span className="live-indicator"><i/> LIVE</span></div><article className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} /></section>}
    </section>
    <footer className="statusbar"><span><i className="status-dot"/> ローカル編集中</span><span>Markdown · HTML export</span></footer>
  </main>;
}
