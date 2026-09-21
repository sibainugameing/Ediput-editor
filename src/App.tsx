import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { AppHeader, type ViewMode } from './components/AppHeader';
import { EditorPane } from './components/EditorPane';
import { PreviewPane } from './components/PreviewPane';
import { StatusBar } from './components/StatusBar';
import {
  downloadText,
  makeDocumentHtml,
  renderMarkdown,
  sanitizeHtml,
  STARTER_MARKDOWN,
  STORAGE_KEY,
} from './features/markdown/markdown';
import { loadStoredDocument, useAutosave } from './hooks/useAutosave';
import { useScrollSync } from './hooks/useScrollSync';

export default function App() {
  const [source, setSource] = useState(() =>
    loadStoredDocument(STORAGE_KEY, STARTER_MARKDOWN),
  );
  const [view, setView] = useState<ViewMode>('split');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorPaneRef = useRef<HTMLElement>(null);
  const previewPaneRef = useRef<HTMLElement>(null);

  const rawHtml = useMemo(() => renderMarkdown(source), [source]);
  const safeHtml = useMemo(() => sanitizeHtml(rawHtml), [rawHtml]);
  const saved = useAutosave(source, STORAGE_KEY);

  useScrollSync({
    enabled: view === 'split',
    editorPaneRef,
    previewPaneRef,
    contentKey: safeHtml,
  });

  function exportHtml(): void {
    downloadText(
      'ediput-document.html',
      makeDocumentHtml(safeHtml),
      'text/html;charset=utf-8',
    );
  }

  function exportMarkdown(): void {
    downloadText(
      'ediput-document.md',
      source,
      'text/markdown;charset=utf-8',
    );
  }

  async function importMarkdown(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`「${file.name}」を読み込みます。現在の文章を置き換えますか？`)) {
      event.target.value = '';
      return;
    }

    try {
      setSource(await file.text());
    } catch {
      window.alert('ファイルを読み込めませんでした。');
    } finally {
      event.target.value = '';
    }
  }

  function resetDocument(): void {
    if (window.confirm('現在の文章を初期サンプルに戻しますか？')) {
      setSource(STARTER_MARKDOWN);
    }
  }

  return (
    <main className="app-shell">
      <AppHeader
        view={view}
        onViewChange={setView}
        fileInputRef={fileInputRef}
        onImport={importMarkdown}
        onExportMarkdown={exportMarkdown}
        onReset={resetDocument}
        onPrint={() => window.print()}
        onExportHtml={exportHtml}
      />

      <section className={`workspace mode-${view}`}>
        {view !== 'preview' && (
          <EditorPane
            source={source}
            editorPaneRef={editorPaneRef}
            onChange={setSource}
          />
        )}

        {view !== 'edit' && (
          <PreviewPane
            safeHtml={safeHtml}
            previewPaneRef={previewPaneRef}
          />
        )}
      </section>

      <article
        className="markdown-body print-only"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      <StatusBar saved={saved} />
    </main>
  );
}
