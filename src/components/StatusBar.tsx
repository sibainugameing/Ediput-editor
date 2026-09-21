type StatusBarProps = {
  saved: boolean;
};

export function StatusBar({ saved }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <span><i className="status-dot" /> {saved ? '自動保存済み（このブラウザ）' : '保存中…'}</span>
      <span>Markdown · HTML · PDF via Print</span>
    </footer>
  );
}
