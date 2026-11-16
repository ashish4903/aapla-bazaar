import useLang from '../lib/useLang';

export default function ShopHeader({ shop }) {
  const { lang, setLang, t, name, pick } = useLang();
  const other = lang === 'mr' ? 'en' : 'mr';
  return (
    <header className="shop-header">
      <div className="top-bar">
        <span className="brand">🥬 {t('app.name')}</span>
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
      <h1>{name(shop)}</h1>
      <p className="shop-place">📍 {pick(shop.place)}</p>
      <ul className="shop-modes">
        {shop.pickup && <li>🛒 {t('shop.pickup')}</li>}
        {shop.delivery && <li>🛵 {t('shop.delivery')}</li>}
      </ul>
      {shop.demo && <p className="demo-note">{t('shop.demo')}</p>}
    </header>
  );
}
