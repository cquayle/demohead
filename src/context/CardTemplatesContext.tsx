import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import type { CardTemplateKind } from '../components/adaptiveCardUtils';
import {
  getDefaultCardTemplate,
  getStoredCardTemplateByKind,
  setStoredCardTemplateByKind,
} from '../components/adaptiveCardUtils';

interface CardTemplatesContextValue {
  /** Get the current template for a view kind (from in-memory state, synced with localStorage). */
  getTemplate: (kind: CardTemplateKind) => string;
  /** Update template for a kind and persist to localStorage. */
  setTemplate: (kind: CardTemplateKind, template: string) => void;
  /** Get the built-in default template for a kind (for "Reset to default"). */
  getDefaultTemplate: (kind: CardTemplateKind) => string;
  /** Reset a kind to its default and persist. */
  resetToDefault: (kind: CardTemplateKind) => void;
}

const CardTemplatesContext = createContext<CardTemplatesContextValue | null>(null);

function loadTemplatesFromStorage(): Record<CardTemplateKind, string> {
  const kinds: CardTemplateKind[] = ['newsfeedHero', 'newsfeedArticle', 'fullArticle'];
  const record = {} as Record<CardTemplateKind, string>;
  for (const kind of kinds) {
    record[kind] = getStoredCardTemplateByKind(kind);
  }
  return record;
}

export function CardTemplatesProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<Record<CardTemplateKind, string>>(() =>
    loadTemplatesFromStorage()
  );

  // Sync from localStorage on mount (e.g. after another tab updated)
  useEffect(() => {
    setTemplates(loadTemplatesFromStorage());
  }, []);

  const getTemplate = useCallback(
    (kind: CardTemplateKind) => templates[kind] ?? getDefaultCardTemplate(kind),
    [templates]
  );

  const setTemplate = useCallback((kind: CardTemplateKind, template: string) => {
    setStoredCardTemplateByKind(kind, template);
    setTemplates((prev) => ({ ...prev, [kind]: template }));
  }, []);

  const getDefaultTemplate = useCallback((kind: CardTemplateKind) => getDefaultCardTemplate(kind), []);

  const resetToDefault = useCallback(
    (kind: CardTemplateKind) => {
      const defaultTemplate = getDefaultCardTemplate(kind);
      setStoredCardTemplateByKind(kind, defaultTemplate);
      setTemplates((prev) => ({ ...prev, [kind]: defaultTemplate }));
    },
    []
  );

  const value = useMemo<CardTemplatesContextValue>(
    () => ({ getTemplate, setTemplate, getDefaultTemplate, resetToDefault }),
    [getTemplate, setTemplate, getDefaultTemplate, resetToDefault]
  );

  return (
    <CardTemplatesContext.Provider value={value}>
      {children}
    </CardTemplatesContext.Provider>
  );
}

export function useCardTemplates(): CardTemplatesContextValue {
  const ctx = useContext(CardTemplatesContext);
  if (!ctx) {
    throw new Error('useCardTemplates must be used within CardTemplatesProvider');
  }
  return ctx;
}
