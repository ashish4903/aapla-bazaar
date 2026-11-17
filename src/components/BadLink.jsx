import TopBar from './TopBar';
import useLang from '../lib/useLang';

export default function BadLink() {
  const { t } = useLang();
  return (
    <>
      <header className="hero">
        <TopBar />
        <h1>{t('shop.badTitle')}</h1>
        <p className="hero-text">{t('shop.badText')}</p>
      </header>
      <main>
        <a className="primary wide" href="#/">
          {t('shop.home')}
        </a>
      </main>
    </>
  );
}
