import type { RefObject } from 'react';

type PreviewPaneProps = {
  safeHtml: string;
  previewPaneRef: RefObject<HTMLElement | null>;
};

export function PreviewPane({ safeHtml, previewPaneRef }: PreviewPaneProps) {
  return (
    <section ref={previewPaneRef} className="pane preview-pane">
      <div className="pane-heading">
        <span>PREVIEW</span>
        <span className="live-indicator"><i /> LIVE</span>
      </div>
      <article className="markdown-body" dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </section>
  );
}
