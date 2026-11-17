import TopBar from './TopBar';
import useLang from '../lib/useLang';
import { decodeShop } from '../lib/shop';
import { read } from '../lib/storage';
import { LAST_SHOP_KEY, MY_SHOP_KEY } from '../lib/keys';

export default function HomeView() {
  const { t } = useLang();
  const lastCode = read(LAST_SHOP_KEY, '');
  const last = lastCode ? decodeShop(lastCode) : null;
  const mine = read(MY_SHOP_KEY, null);
  const hasShop = Boolean(mine?.setupDone);

  return (
    <>
      <header className="hero">
        <TopBar />
        <h1>{t('home.title')}</h1>
        <p className="hero-text">{t('app.tagline')}</p>
      </header>
      <main>
        {hasShop && (
          <a className="card link-card" href="#/my-shop">
            <span className="kicker">🏪 {t('vendor.title')}</span>
            <strong>{mine.name}</strong>
            <span className="link-card-go">{t('home.updateRates')} →</span>
          </a>
        )}

        {last ? (
          <a className="card link-card" href={`#/s/${lastCode}`}>
            <span className="kicker">🛒 {t('home.lastShop')}</span>
            <strong>{last.name}</strong>
            <span className="link-card-go">{t('home.openShop')} →</span>
          </a>
        ) : (
          <section className="card">
            <h2>🛒 {t('home.customerTitle')}</h2>
            <p>{t('home.customerText')}</p>
          </section>
        )}

        {!hasShop && (
          <section className="card">
            <h2>🏪 {t('home.vendorTitle')}</h2>
            <p>{t('home.vendorText')}</p>
            <ol className="steps">
              <li>{t('home.step1')}</li>
              <li>{t('home.step2')}</li>
              <li>{t('home.step3')}</li>
            </ol>
            <a className="primary wide" href="#/my-shop">
              {t('home.start')}
            </a>
          </section>
        )}

        <p className="private-note">{t('home.free')}</p>
      </main>
    </>
  );
}
