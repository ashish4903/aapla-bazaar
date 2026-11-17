import { useEffect } from 'react';
import useLang from '../lib/useLang';
import useStored from '../lib/useStored';
import { BIG_TEXT_KEY } from '../lib/keys';

export default function TopBar() {
  const { lang, setLang, t } = useLang();
  const [bigText, setBigText] = useStored(BIG_TEXT_KEY, false);
  const other = lang === 'mr' ? 'en' : 'mr';

  useEffect(() => {
    document.documentElement.classList.toggle('big-text', bigText === true);
  }, [bigText]);

  return (
    <div className="top-bar">
      <a className="brand" href="#/">
        <span aria-hidden="true">🥬</span> {t('app.name')}
      </a>
      <div className="top-actions">
        <button
          type="button"
          className="lang-switch"
          aria-pressed={bigText === true}
          aria-label={t('text.big')}
          onClick={() => setBigText((on) => !on)}
        >
          {t('text.bigShort')}
        </button>
        <button
          type="button"
          className="lang-switch"
          lang={other}
          aria-label={t('lang.switchLabel')}
          onClick={() => setLang(other)}
        >
          {t('lang.switch')}
        </button>
      </div>
    </div>
  );
}
