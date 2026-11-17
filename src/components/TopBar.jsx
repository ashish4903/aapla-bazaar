import useLang from '../lib/useLang';

export default function TopBar() {
  const { lang, setLang, t } = useLang();
  const other = lang === 'mr' ? 'en' : 'mr';
  return (
    <div className="top-bar">
      <a className="brand" href="#/">
        <span aria-hidden="true">🥬</span> {t('app.name')}
      </a>
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
  );
}
