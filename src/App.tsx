import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { AppHeader, type ViewMode } from './components/AppHeader';
import { EditorPane } from './components/EditorPane';
import { PreviewPane } from './components/PreviewPane';
import { StatusBar } from './components/StatusBar';
import {
  DEFAULT_DOCUMENT_NAME,
  DOCUMENT_NAME_STORAGE_KEY,
  downloadText,
  htmlFilenameFromMarkdown,
  makeDocumentHtml,
  markdownFilenameFromImport,
  renderMarkdown,
  sanitizeHtml,
  STARTER_MARKDOWN,
  STORAGE_KEY,
} from './features/markdown/markdown';
import { loadStoredDocument, useAutosave } from './hooks/useAutosave';
import { useScrollSync } from './hooks/useScrollSync';

const MOBILE_BREAKPOINT = '(max-width: 700px)';
const KEYBOARD_THRESHOLD = 150;

export default function App() {
  const [source, setSource] = useState(() =>
    loadStoredDocument(STORAGE_KEY, STARTER_MARKDOWN),
  );
  const [documentName, setDocumentName] = useState(() =>
    loadStoredDocument(DOCUMENT_NAME_STORAGE_KEY, DEFAULT_DOCUMENT_NAME),
  );
  const [view, setView] = useState<ViewMode>(() =>
    window.matchMedia(MOBILE_BREAKPOINT).matches ? 'edit' : 'split',
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorPaneRef = useRef<HTMLElement>(null);
  const previewPaneRef = useRef<HTMLElement>(null);

  const rawHtml = useMemo(() => renderMarkdown(source), [source]);
  const safeHtml = useMemo(() => sanitizeHtml(rawHtml), [rawHtml]);
  const saved = useAutosave(source, STORAGE_KEY);

  useEffect(() => {
    try {
      localStorage.setItem(DOCUMENT_NAME_STORAGE_KEY, documentName);
    } catch {
      // Filename persistence is best-effort, just like document autosave.
    }

    document.title = documentName.replace(/\\.(?:md|markdown|txt)$/i, '') || 'Ediput';

    return () => {
      document.title = 'Ediput';
    };
  }, [documentName]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateViewportState = (): void => {
      const viewportHeight = Math.max(1, viewport.height);
      document.documentElement.style.setProperty(
        '--visual-viewport-height',
        `${viewportHeight}px`,
      );

      const keyboardHeight = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );

      const keyboardOpen =
        view === 'edit' &&
        window.matchMedia(MOBILE_BREAKPOINT).matches &&
        keyboardHeight > KEYBOARD_THRESHOLD;

      document.documentElement.classList.toggle('keyboard-open', keyboardOpen);
    };

    updateViewportState();
    viewport.addEventListener('resize', updateViewportState);
    viewport.addEventListener('scroll', updateViewportState);

    return () => {
      viewport.removeEventListener('resize', updateViewportState);
      viewport.removeEventListener('scroll', updateViewportState);
      document.documentElement.classList.remove('keyboard-open');
      document.documentElement.style.removeProperty('--visual-viewport-height');
    };
  }, [view]);

  useScrollSync({
    enabled: view === 'split',
    editorPaneRef,
    previewPaneRef,
    contentKey: safeHtml,
  });

  function exportHtml(): void {
    downloadText(
      htmlFilenameFromMarkdown(documentName),
      makeDocumentHtml(safeHtml),
      'text/html;charset=utf-8',
    );
  }

  function exportMarkdown(): void {
    downloadText(
      documentName || DEFAULT_DOCUMENT_NAME,
      source,
      'text/markdown;charset=utf-8',
    );
  }

  async function importMarkdown(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        `「${file.name}」を読み込みます。現在の文章を置き換えますか？`,
      )
    ) {
      event.target.value = '';
      return;
    }

    try {
      setSource(await file.text());
      setDocumentName(markdownFilenameFromImport(file.name));
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
        documentName={documentName}
        fileInputRef={fileInputRef}
        onImport={importMarkdown}
        onExportMarkdown={exportMarkdown}
        onReset={resetDocument}
        onPrint={() => window.print()}
        onExportHtml={exportHtml}
      />

      <section className={'workspace mode-' + view}>
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
