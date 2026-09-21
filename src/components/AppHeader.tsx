import { useState, type ChangeEvent, type RefObject } from 'react';
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

  function runFileAction(action: () => void): void {
    setFileMenuOpen(false);
    action();
  }

  return (
    <header className={'topbar view-' + view}>
      <a className="brand" href="#" aria-label="Ediput home">
        <span className="brand-mark">
          <FileText size={19} />
        </span>
        <span>Ediput</span>
        <span className="version">Preview</span>
      </a>

      <div className="top-actions">
        <div className="view-switch" aria-label="表示モード">
          <button
            className={view === 'edit' ? 'active' : ''}
            onClick={() => onViewChange('edit')}
            title="編集"
            type="button"
          >
            <Pencil size={16} />
            <span>編集</span>
          </button>
          <button
            className={view === 'split' ? 'active' : ''}
            onClick={() => onViewChange('split')}
            title="分割"
            type="button"
          >
            <Columns2 size={16} />
            <span>分割</span>
          </button>
          <button
            className={view === 'preview' ? 'active' : ''}
            onClick={() => onViewChange('preview')}
            title="プレビュー"
            type="button"
          >
            <Eye size={16} />
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
            <FileUp size={15} />
            <span>読み込み</span>
          </button>
          <button
            className="secondary-button"
            onClick={onExportMarkdown}
            title="Markdownファイルとして保存"
            type="button"
          >
            <Save size={15} />
            <span>保存</span>
          </button>
          <button
            className="secondary-button"
            onClick={onReset}
            title="サンプルに戻す"
            type="button"
          >
            <RotateCcw size={15} />
            <span>リセット</span>
          </button>
          <button
            className="secondary-button"
            onClick={onPrint}
            title="PDFとして保存または印刷"
            type="button"
          >
            <Printer size={16} />
            <span>PDF / 印刷</span>
          </button>
          <button
            className="export-button"
            onClick={onExportHtml}
            title="HTMLファイルとして保存"
            type="button"
          >
            <Download size={16} />
            <span>HTML保存</span>
          </button>
        </div>

        <div className="mobile-file-menu">
          <button
            className="mobile-file-button"
            onClick={() => setFileMenuOpen((open) => !open)}
            aria-expanded={fileMenuOpen}
            aria-controls="mobile-file-actions"
            type="button"
          >
            {fileMenuOpen ? <X size={18} /> : <FolderOpen size={18} />}
            <span>ファイル</span>
          </button>

          {fileMenuOpen && (
            <div id="mobile-file-actions" className="mobile-file-panel">
              <button
                onClick={() => runFileAction(() => fileInputRef.current?.click())}
                type="button"
              >
                <FileUp size={18} />
                <span>Markdownを開く</span>
              </button>
              <button onClick={() => runFileAction(onExportMarkdown)} type="button">
                <Save size={18} />
                <span>Markdownを保存</span>
              </button>
              <button onClick={() => runFileAction(onExportHtml)} type="button">
                <Download size={18} />
                <span>HTMLを保存</span>
              </button>
              <button onClick={() => runFileAction(onPrint)} type="button">
                <Printer size={18} />
                <span>PDF / 印刷</span>
              </button>
              <button onClick={() => runFileAction(onReset)} type="button">
                <RotateCcw size={18} />
                <span>サンプルに戻す</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
