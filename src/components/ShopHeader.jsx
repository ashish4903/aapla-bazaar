import TopBar from './TopBar';
import ShareButton from './ShareButton';
import useLang from '../lib/useLang';
import { rupees } from '../lib/order';
import { callUrl, dateText, todayStamp } from '../lib/shop';

/** What a buyer wants to know first: open or not, how they get it, what it costs */
export default function ShopHeader({ shop }) {
  const { t, lang } = useLang();
  const stale = shop.date < todayStamp();
  return (
    <header className="hero">
      <TopBar />
      <h1>{shop.name}</h1>
      {shop.place && <p className="hero-text">📍 {shop.place}</p>}
      <p className={`open-pill${shop.open ? '' : ' is-closed'}`}>
        <span aria-hidden="true">●</span> {shop.open ? t('shop.open') : t('shop.closed')}
        {shop.hours && ` · ${shop.hours}`}
      </p>
      {shop.note && <p className="shop-note">📣 {shop.note}</p>}

      <ul className="tags">
        {shop.pickup && <li>🛒 {t('shop.pickup')}</li>}
        {shop.delivery && (
          <li>
            🛵{' '}
            {shop.deliveryCharge > 0
              ? t('shop.deliveryCharge', { amount: rupees(shop.deliveryCharge) })
              : t('shop.deliveryFree')}
          </li>
        )}
        {shop.minOrder > 0 && <li>{t('shop.minOrder', { amount: rupees(shop.minOrder) })}</li>}
        {shop.date > 0 && <li>🗓️ {t('shop.ratesOf', { date: dateText(shop.date, lang) })}</li>}
      </ul>

      {stale && (
        <p className="notice" role="status">
          {t('shop.stale')}
        </p>
      )}

      <div className="hero-actions">
        <a className="hero-button" href={callUrl(shop)}>
          📞 {t('shop.call')}
        </a>
        <ShareButton className="hero-button" url={window.location.href} title={shop.name} label={`↗ ${t('shop.share')}`} />
      </div>
    </header>
  );
}
