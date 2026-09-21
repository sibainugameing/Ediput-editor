import { useEffect, type RefObject } from 'react';

type ScrollSyncOptions = {
  enabled: boolean;
  editorPaneRef: RefObject<HTMLElement | null>;
  previewPaneRef: RefObject<HTMLElement | null>;
  contentKey: string;
};

export function useScrollSync({
  enabled,
  editorPaneRef,
  previewPaneRef,
  contentKey,
}: ScrollSyncOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const editorScroller = editorPaneRef.current?.querySelector<HTMLElement>('.cm-scroller');
    const previewScroller = previewPaneRef.current?.querySelector<HTMLElement>('.markdown-body');
    if (!editorScroller || !previewScroller) return;

    let animationFrame = 0;
    let syncing = false;

    const syncScroll = (from: HTMLElement, to: HTMLElement): void => {
      if (syncing) return;

      const fromMax = Math.max(0, from.scrollHeight - from.clientHeight);
      const toMax = Math.max(0, to.scrollHeight - to.clientHeight);
      if (fromMax === 0 || toMax === 0) return;

      const ratio = from.scrollTop / fromMax;
      const targetTop = ratio * toMax;
      if (Math.abs(to.scrollTop - targetTop) < 1) return;

      syncing = true;
      to.scrollTop = targetTop;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        syncing = false;
      });
    };

    const onEditorScroll = (): void => syncScroll(editorScroller, previewScroller);
    const onPreviewScroll = (): void => syncScroll(previewScroller, editorScroller);

    editorScroller.addEventListener('scroll', onEditorScroll, { passive: true });
    previewScroller.addEventListener('scroll', onPreviewScroll, { passive: true });

    return () => {
      editorScroller.removeEventListener('scroll', onEditorScroll);
      previewScroller.removeEventListener('scroll', onPreviewScroll);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [contentKey, editorPaneRef, enabled, previewPaneRef]);
}
