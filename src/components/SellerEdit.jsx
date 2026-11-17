import TopBar from './TopBar';
import ShopBasics from './ShopBasics';
import ShopService from './ShopService';
import InstallButton from './InstallButton';
import ShareButton from './ShareButton';
import DeleteShop from './DeleteShop';
import useLang from '../lib/useLang';
import { encodeBackup, shopProblems } from '../lib/shop';

/** Shop details, changed rarely */
export default function SellerEdit({ shop, set, reset }) {
  const { t } = useLang();
  const backup = `${window.location.origin}${window.location.pathname}#/restore/${encodeBackup(shop)}`;
  const problems = shopProblems(shop).filter((key) => key !== 'vendor.needItems');
  return (
    <>
      <header className="hero">
        <TopBar />
        <h1>{t('vendor.details')}</h1>
        <p className="hero-text">{t('vendor.saved')}</p>
        <InstallButton />
      </header>
      <main className="seller">
        <section className="card">
          <ShopBasics shop={shop} set={set} />
        </section>
        <section className="card">
          <ShopService shop={shop} set={set} />
        </section>
        {problems.length > 0 && (
          <ul className="errors" role="alert">
            {problems.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        )}

        <section className="card">
          <h2>{t('poster.title')}</h2>
          <p>{t('poster.text')}</p>
          <a className="ghost wide" href="#/my-shop/poster">
            🖨️ {t('poster.link')}
          </a>
        </section>

        <section className="card">
          <h2>{t('backup.title')}</h2>
          <p>{t('backup.text')}</p>
          <ShareButton className="ghost wide" url={backup} title={shop.name} label={`💾 ${t('backup.share')}`} />
        </section>

        <DeleteShop
          onDelete={() => {
            reset();
            window.location.hash = '#/';
          }}
        />
      </main>
    </>
  );
}
