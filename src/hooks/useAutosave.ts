import { useEffect, useState } from 'react';

export function loadStoredDocument(storageKey: string, fallback: string): string {
  try {
    return localStorage.getItem(storageKey) ?? fallback;
  } catch {
    return fallback;
  }
}

export function useAutosave(source: string, storageKey: string, delay = 300): boolean {
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setSaved(false);

    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, source);
        setSaved(true);
      } catch {
        setSaved(false);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [delay, source, storageKey]);

  return saved;
}
