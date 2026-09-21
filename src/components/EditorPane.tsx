import type { RefObject } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';

type EditorPaneProps = {
  source: string;
  editorPaneRef: RefObject<HTMLElement | null>;
  onChange: (value: string) => void;
};

export function EditorPane({ source, editorPaneRef, onChange }: EditorPaneProps) {
  return (
    <section ref={editorPaneRef} className="pane editor-pane">
      <div className="pane-heading">
        <span>MARKDOWN</span>
        <span className="pane-meta">{source.length} 文字</span>
      </div>
      <CodeMirror
        value={source}
        height="100%"
        extensions={[markdown()]}
        onChange={onChange}
        basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }}
      />
    </section>
  );
}
