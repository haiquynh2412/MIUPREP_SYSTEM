# @miuprep/i18n

Shared, dependency-free internationalization for the MiuPrep apps. Replaces the
per-app hardcoded Vietnamese/English mix the audit flagged.

## Core engine (framework-agnostic, testable under node)

```ts
import { createTranslator } from '@miuprep/i18n';

const translations = {
  vi: { hello: 'Xin chào', question_of: 'Câu {current} / {total}' },
  en: { hello: 'Hello', question_of: 'Question {current} of {total}' },
};

const i18n = createTranslator({
  translations,
  languages: ['vi', 'en'] as const,
  defaultLang: 'vi',
  storageKey: 'miu_physics_language',
});

i18n.t('question_of', 'en', { current: 3, total: 10 }); // "Question 3 of 10"
i18n.loadLanguage(); // persisted lang or default
```

Fallback chain: requested language → default language → raw key (so a missing
translation never crashes, and the key is visible in the UI for triage).

## React bindings

```tsx
import { LanguageProvider, useTranslation, LanguageToggle } from '@miuprep/i18n/src/react';

function Root() {
  return (
    <LanguageProvider translator={i18n}>
      <Header />
    </LanguageProvider>
  );
}

function Header() {
  const { t, lang, setLang } = useTranslation();
  return (
    <header>
      <h1>{t('hello')}</h1>
      <LanguageToggle />
    </header>
  );
}
```

## Rollout pattern for the remaining apps

1. Create `src/data/i18n.<app>.ts` exporting a `translations` dict (`vi`/`en`)
   and a translator built with `createTranslator`.
2. Wrap the app root in `<LanguageProvider translator={...}>`.
3. Replace hardcoded strings with `t('key')` incrementally — screen by screen.
   Untranslated strings still render (the raw key shows), so partial migration is safe.
4. Run `findMissingTranslationKeys(translations)` in a test to guarantee vi/en parity.

`miuphysics-app` is the reference: its `src/data/i18n.js` now delegates its
engine to this package while keeping its own dictionary.
