import { useEffect, useMemo, useState } from 'react';
import LangContext from '../lib/LangContext';
import { translate } from '../lib/i18n';
import { read, write } from '../lib/storage';

const KEY = 'aapla-bazaar-lang-v1';

export default function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => (read(KEY, 'mr') === 'en' ? 'en' : 'mr'));

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const pick = (pair) => (typeof pair === 'string' ? pair : (pair?.[lang] ?? pair?.en ?? ''));
    return {
      lang,
      setLang: (next) => {
        write(KEY, next);
        setLangState(next);
      },
      t: (key, vars) => translate(lang, key, vars),
      pick,
      name: (thing) => pick(thing.name),
    };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
