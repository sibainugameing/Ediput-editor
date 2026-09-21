import type { ChangeEvent, RefObject } from 'react';
import {
  Columns2,
  Download,
  Eye,
  FileText,
  FileUp,
  Pencil,
  Printer,
  RotateCcw,
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
  return (
    <header className="topbar">
      <a className="brand" href="#" aria-label="Ediput home">
        <span className="brand-mark">
          <FileText size={19} />
        </span>
        <span>Ediput</span>
        <span className="version">Preview</span>
      </a>

      <div className="top-actions">
        <div className="view-switch" aria-label="表示モード">
          <button className={view === 'edit' ? 'active' : ''} onClick={() => onViewChange('edit')} title="編集" type="button"><Pencil size={16} /><span>編集</span></button>
          <button className={view === 'split' ? 'active' : ''} onClick={() => onViewChange('split')} title="分割" type="button"><Columns2 size={16} /><span>分割</span></button>
          <button className={view === 'preview' ? 'active' : ''} onClick={() => onViewChange('preview')} title="プレビュー" type="button"><Eye size={16} /><span>表示</span></button>
        </div>

        <input ref={fileInputRef} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={onImport} hidden />

        <button className="secondary-button" onClick={() => fileInputRef.current?.click()} title="Markdownファイルを読み込む" type="button"><FileUp size={15} /><span>読み込み</span></button>
        <button className="secondary-button" onClick={onExportMarkdown} title="Markdownファイルとして保存" type="button"><Download size={15} /><span>MD</span></button>
        <button className="secondary-button" onClick={onReset} title="サンプルに戻す" type="button"><RotateCcw size={15} /><span>リセット</span></button>
        <button className="secondary-button" onClick={onPrint} type="button"><Printer size={16} /><span>PDF / 印刷</span></button>
        <button className="export-button" onClick={onExportHtml} type="button"><Download size={16} /><span>HTML</span></button>
      </div>
    </header>
  );
}
