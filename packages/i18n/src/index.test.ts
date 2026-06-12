import { createTranslator, findMissingTranslationKeys, type TranslationDict } from './index';

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const translations: TranslationDict = {
  vi: {
    hello: 'Xin chào',
    question_of: 'Câu {current} / {total}',
    only_vi: 'Chỉ tiếng Việt',
  },
  en: {
    hello: 'Hello',
    question_of: 'Question {current} of {total}',
  },
};

// In-memory localStorage stub for loadLanguage/saveLanguage tests
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

const i18n = createTranslator({ translations, languages: ['vi', 'en'] as const, defaultLang: 'vi', storageKey: 'test_lang' });

// Basic translation
assert(i18n.t('hello', 'en') === 'Hello', 'Should translate to the requested language.');
assert(i18n.t('hello', 'vi') === 'Xin chào', 'Should translate Vietnamese.');

// Interpolation
assert(i18n.t('question_of', 'en', { current: 3, total: 10 }) === 'Question 3 of 10', 'Should interpolate params.');
assert(i18n.t('question_of', 'vi', { current: 3, total: 10 }) === 'Câu 3 / 10', 'Should interpolate VN params.');

// Fallback chain: missing in en -> falls back to default (vi)
assert(i18n.t('only_vi', 'en') === 'Chỉ tiếng Việt', 'Missing key should fall back to the default language.');
// Missing everywhere -> returns the raw key
assert(i18n.t('nonexistent', 'en') === 'nonexistent', 'Unknown key should return the key itself.');

// loadLanguage / saveLanguage
assert(i18n.loadLanguage() === 'vi', 'Default language when nothing stored.');
i18n.saveLanguage('en');
assert(i18n.loadLanguage() === 'en', 'Persisted language should be restored.');
store.set('test_lang', 'fr'); // unsupported
assert(i18n.loadLanguage() === 'vi', 'Unsupported stored language should fall back to default.');

// Missing-key guard
const missing = findMissingTranslationKeys(translations);
assert(missing.en?.includes('only_vi'), 'Guard should report keys missing from a language.');
assert(!missing.vi, 'Complete language should have no missing keys.');

console.log('i18n engine tests passed.');
