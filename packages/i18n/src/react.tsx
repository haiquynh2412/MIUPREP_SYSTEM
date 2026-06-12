/**
 * React bindings for @miuprep/i18n: a provider that holds the active language
 * (persisted), a useTranslation() hook, and a generic LanguageToggle.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Translator, TranslationParams } from './index';

interface LanguageContextValue<L extends string> {
  lang: L;
  setLang: (lang: L) => void;
  t: (key: string, params?: TranslationParams) => string;
  languages: readonly L[];
}

const LanguageContext = createContext<LanguageContextValue<string> | null>(null);

export interface LanguageProviderProps<L extends string> {
  translator: Translator<L>;
  children: ReactNode;
}

export function LanguageProvider<L extends string>({ translator, children }: LanguageProviderProps<L>) {
  const [lang, setLangState] = useState<L>(() => translator.loadLanguage());

  const setLang = useCallback(
    (next: L) => {
      setLangState(next);
      translator.saveLanguage(next);
    },
    [translator],
  );

  const value = useMemo<LanguageContextValue<L>>(
    () => ({
      lang,
      setLang,
      languages: translator.languages,
      t: (key, params) => translator.t(key, lang, params),
    }),
    [lang, setLang, translator],
  );

  return <LanguageContext.Provider value={value as unknown as LanguageContextValue<string>}>{children}</LanguageContext.Provider>;
}

export function useTranslation<L extends string = string>(): LanguageContextValue<L> {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used inside a <LanguageProvider>.');
  }
  return ctx as unknown as LanguageContextValue<L>;
}

export interface LanguageToggleProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Compact pill that cycles through the provider's languages. Labels are the
 * uppercased language codes (VI / EN). Reads/writes via the provider context.
 */
export function LanguageToggle({ className, style }: LanguageToggleProps) {
  const { lang, setLang, languages } = useTranslation();
  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, ...style }} role="group" aria-label="Language">
      {languages.map((code, i) => (
        <React.Fragment key={code}>
          {i > 0 && <span style={{ opacity: 0.4 }}>/</span>}
          <button
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={lang === code}
            style={{
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.5px',
              opacity: lang === code ? 1 : 0.45,
              padding: '2px 4px',
            }}
          >
            {code.toUpperCase()}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
