import TopBar from './TopBar';
import ShareButton from './ShareButton';
import useLang from '../lib/useLang';
import { dateText, todayStamp } from '../lib/shop';

export default function ShopHeader({ shop }) {
  const { t, lang } = useLang();
  const stale = shop.date < todayStamp();
  return (
    <header className="hero">
      <TopBar />
      <h1>{shop.name}</h1>
      {shop.place && <p className="hero-text">📍 {shop.place}</p>}
      <ul className="tags">
        {shop.pickup && <li>🛒 {t('shop.pickup')}</li>}
        {shop.delivery && <li>🛵 {t('shop.delivery')}</li>}
        {shop.date > 0 && <li>🗓️ {t('shop.ratesOf', { date: dateText(shop.date, lang) })}</li>}
      </ul>
      {stale && (
        <p className="notice" role="status">
          {t('shop.stale')}
        </p>
      )}
      <ShareButton
        className="hero-button"
        url={window.location.href}
        title={shop.name}
        label={`↗ ${t('shop.share')}`}
      />
    </header>
  );
}
