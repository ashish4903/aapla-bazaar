import { useContext } from 'react';
import LangContext from './LangContext';

/** { lang, setLang, t(key, vars), name(thing), pick({mr, en}) } */
export default function useLang() {
  return useContext(LangContext);
}
