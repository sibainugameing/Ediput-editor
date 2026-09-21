import { useEffect, useState, type ChangeEvent, type RefObject } from 'react';
import {
  Columns2,
  Download,
  Eye,
  FileText,
  FileUp,
  FolderOpen,
  Pencil,
  Printer,
  RotateCcw,
  Save,
  X,
} from 'lucide-react';

export type ViewMode = 'split' | 'edit' | 'preview';

type AppHeaderProps = {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onExportMarkdown: () => void;
  onReset: () => void;
  onPrint: () => void;
  onExportHtml: () => void;
};

export function AppHeader({
  view,
  onViewChange,
  fileInputRef,
  onImport,
  onExportMarkdown,
  onReset,
  onPrint,
  onExportHtml,
}: AppHeaderProps) {
  const [fileMenuOpen, setFileMenuOpen] = useState(false);

  useEffect(() => {
    if (!fileMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setFileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [fileMenuOpen]);

  useEffect(() => {
    setFileMenuOpen(false);
  }, [view]);

  function runFileAction(action: () => void): void {
    setFileMenuOpen(false);
    action();
  }

  return (
    <header className={'topbar view-' + view}>
      <a
        className="brand"
        href="#"
        aria-label="Ediput home"
        onClick={(event) => event.preventDefault()}
      >
        <span className="brand-mark" aria-hidden="true">
          <FileText size={19} />
        </span>
        <span>Ediput</span>
        <span className="version">Preview</span>
      </a>

      <div className="top-actions">
        <div className="view-switch" aria-label="表示モード" role="group">
          <button
            className={view === 'edit' ? 'active' : ''}
            onClick={() => onViewChange('edit')}
            title="編集"
            aria-pressed={view === 'edit'}
            type="button"
          >
            <Pencil size={16} aria-hidden="true" />
            <span>編集</span>
          </button>
          <button
            className={view === 'split' ? 'active' : ''}
            onClick={() => onViewChange('split')}
            title="分割"
            aria-pressed={view === 'split'}
            type="button"
          >
            <Columns2 size={16} aria-hidden="true" />
            <span>分割</span>
          </button>
          <button
            className={view === 'preview' ? 'active' : ''}
            onClick={() => onViewChange('preview')}
            title="プレビュー"
            aria-pressed={view === 'preview'}
            type="button"
          >
            <Eye size={16} aria-hidden="true" />
            <span>表示</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          onChange={onImport}
          hidden
        />

        <div className="desktop-file-actions" aria-label="ファイル操作">
          <button
            className="secondary-button"
            onClick={() => fileInputRef.current?.click()}
            title="Markdownファイルを読み込む"
            type="button"
          >
            <FileUp size={15} aria-hidden="true" />
            <span>読み込み</span>
          </button>
          <button
            className="secondary-button"
            onClick={onExportMarkdown}
            title="Markdownファイルとして保存"
            type="button"
          >
            <Save size={15} aria-hidden="true" />
            <span>保存</span>
          </button>
          <button
            className="secondary-button"
            onClick={onReset}
            title="サンプルに戻す"
            type="button"
          >
            <RotateCcw size={15} aria-hidden="true" />
            <span>リセット</span>
          </button>
          <button
            className="secondary-button"
            onClick={onPrint}
            title="PDFとして保存または印刷"
            type="button"
          >
            <Printer size={16} aria-hidden="true" />
            <span>PDF / 印刷</span>
          </button>
          <button
            className="export-button"
            onClick={onExportHtml}
            title="HTMLファイルとして保存"
            type="button"
          >
            <Download size={16} aria-hidden="true" />
            <span>HTML保存</span>
          </button>
        </div>

        <div className="mobile-file-menu">
          <button
            className="mobile-file-button"
            onClick={() => setFileMenuOpen((open) => !open)}
            aria-expanded={fileMenuOpen}
            aria-haspopup="menu"
            aria-controls="mobile-file-actions"
            title="ファイル操作"
            type="button"
          >
            {fileMenuOpen ? <X size={18} aria-hidden="true" /> : <FolderOpen size={18} aria-hidden="true" />}
            <span>ファイル</span>
          </button>

          {fileMenuOpen && (
            <div id="mobile-file-actions" className="mobile-file-panel" role="menu">
              <button
                onClick={() => runFileAction(() => fileInputRef.current?.click())}
                role="menuitem"
                type="button"
              >
                <FileUp size={18} aria-hidden="true" />
                <span>Markdownを開く</span>
              </button>
              <button
                onClick={() => runFileAction(onExportMarkdown)}
                role="menuitem"
                type="button"
              >
                <Save size={18} aria-hidden="true" />
                <span>Markdownを保存</span>
              </button>
              <button
                onClick={() => runFileAction(onExportHtml)}
                role="menuitem"
                type="button"
              >
                <Download size={18} aria-hidden="true" />
                <span>HTMLを保存</span>
              </button>
              <button
                onClick={() => runFileAction(onPrint)}
                role="menuitem"
                type="button"
              >
                <Printer size={18} aria-hidden="true" />
                <span>PDF / 印刷</span>
              </button>
              <button
                onClick={() => runFileAction(onReset)}
                role="menuitem"
                type="button"
              >
                <RotateCcw size={18} aria-hidden="true" />
                <span>サンプルに戻す</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
