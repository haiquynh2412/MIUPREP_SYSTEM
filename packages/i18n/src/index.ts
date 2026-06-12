/**
 * Lightweight, dependency-free i18n engine for the MiuPrep apps.
 *
 * The audit flagged that the product hardcodes a Vietnamese/English mix with no
 * i18n framework. This is the shared foundation: a typed translator with
 * `{param}` interpolation, localStorage persistence, and a safe fallback chain
 * (requested lang → default lang → raw key). React bindings live in ./react.
 *
 * The core here is pure (no React, no DOM beyond optional localStorage) so it is
 * unit-testable under node.
 */

export type TranslationParams = Record<string, string | number>;

/** lang code -> (translation key -> text) */
export type TranslationDict = Record<string, Record<string, string>>;

export interface TranslatorOptions<L extends string> {
  translations: TranslationDict;
  languages: readonly L[];
  defaultLang: L;
  /** localStorage key for the persisted language. Defaults to 'miuprep_lang'. */
  storageKey?: string;
}

export interface Translator<L extends string> {
  readonly languages: readonly L[];
  readonly defaultLang: L;
  readonly storageKey: string;
  /** Translate a key in `lang`, interpolating `{param}` placeholders. */
  t(key: string, lang: L, params?: TranslationParams): string;
  /** Read the persisted language (validated against `languages`), or the default. */
  loadLanguage(): L;
  /** Persist the chosen language. No-op when localStorage is unavailable. */
  saveLanguage(lang: L): void;
}

function interpolate(text: string, params?: TranslationParams): string {
  if (!params) return text;
  let out = text;
  for (const [k, v] of Object.entries(params)) {
    out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return out;
}

export function createTranslator<L extends string>(options: TranslatorOptions<L>): Translator<L> {
  const { translations, languages, defaultLang } = options;
  const storageKey = options.storageKey ?? 'miuprep_lang';

  return {
    languages,
    defaultLang,
    storageKey,

    t(key, lang, params) {
      const text =
        translations[lang]?.[key] ??
        translations[defaultLang]?.[key] ??
        key;
      return interpolate(text, params);
    },

    loadLanguage() {
      try {
        if (typeof localStorage === 'undefined') return defaultLang;
        const stored = localStorage.getItem(storageKey) as L | null;
        return stored && languages.includes(stored) ? stored : defaultLang;
      } catch {
        return defaultLang;
      }
    },

    saveLanguage(lang) {
      try {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem(storageKey, lang);
      } catch {
        // best-effort persistence
      }
    },
  };
}

/**
 * Report keys that exist in one language but are missing in another — a content
 * guard so translations don't silently fall back. Returns per-language missing keys.
 */
export function findMissingTranslationKeys(translations: TranslationDict): Record<string, string[]> {
  const allKeys = new Set<string>();
  for (const dict of Object.values(translations)) {
    for (const key of Object.keys(dict)) allKeys.add(key);
  }
  const missing: Record<string, string[]> = {};
  for (const [lang, dict] of Object.entries(translations)) {
    const gaps = [...allKeys].filter((k) => !(k in dict));
    if (gaps.length) missing[lang] = gaps;
  }
  return missing;
}
