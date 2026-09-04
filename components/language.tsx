'use client';
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type ReactElement,
} from 'react';
import { translate, type Locale } from '@/lib/i18n/translate';

const storageKey = 'engineering-compass-language';
const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>({ locale: 'en', setLocale: () => {} });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === 'zh-Hant')
        queueMicrotask(() => setLocaleState('zh-Hant'));
    } catch {
      /* Storage may be disabled; switching still works. */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      locale === 'zh-Hant'
        ? '工程羅盤 | Engineering Compass'
        : 'Engineering Compass | Standard & Pro';
  }, [locale]);
  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* Optional persistence. */
    }
  };
  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  return { ...context, t: (text: string) => translate(text, context.locale) };
}
export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  return (
    <div className="language-toolbar">
      <fieldset className="language-switch">
        <legend className="sr-only">Language / 語言</legend>
        <button
          type="button"
          lang="en"
          aria-pressed={locale === 'en'}
          onClick={() => setLocale('en')}
        >
          English
        </button>
        <button
          type="button"
          lang="zh-Hant"
          aria-pressed={locale === 'zh-Hant'}
          onClick={() => setLocale('zh-Hant')}
        >
          繁體中文
        </button>
      </fieldset>
    </div>
  );
}

/** Translate presentation only, never data/IDs, event handlers, keys or score values.
 * Each page component owns a boundary so independently rendered child components
 * receive locale updates too. No DOM rewriting or extra layout elements. */
export function localizeTree(node: ReactNode, locale: Locale): ReactNode {
  if (typeof node === 'string') return translate(node, locale);
  if (Array.isArray(node))
    return node.map((child, index) => {
      const translated = localizeTree(child, locale);
      // JSX static siblings become an array during traversal. Give unkeyed
      // siblings stable positional keys in BOTH languages; keep explicit keys.
      return isValidElement(translated) && translated.key === null
        ? cloneElement(translated, { key: `i18n-position-${index}` })
        : translated;
    });
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<Record<string, unknown>>;
  const props: Record<string, unknown> = {};
  for (const name of ['aria-label', 'title', 'alt'])
    if (typeof element.props[name] === 'string')
      props[name] = translate(element.props[name] as string, locale);
  if ('children' in element.props)
    props.children = localizeTree(element.props.children as ReactNode, locale);
  return cloneElement(element, props);
}
export function LocalizedContent({ children }: { children: ReactNode }) {
  const { locale } = useLanguage();
  return localizeTree(children, locale);
}
