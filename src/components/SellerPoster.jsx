import TopBar from './TopBar';
import QrCode from './QrCode';
import useLang from '../lib/useLang';
import { whatsappDigits } from '../lib/shop';
import { whatsappUrl } from '../lib/order';

/**
 * A poster for the cart. Its QR opens WhatsApp to the shop with "send today's
 * rates" typed, so the poster stays right however often the rates change.
 */
export default function SellerPoster({ shop }) {
  const { t } = useLang();
  const number = whatsappDigits(shop.whatsapp);
  return (
    <>
      <header className="hero no-print">
        <TopBar />
        <h1>{t('poster.title')}</h1>
        <p className="hero-text">{t('poster.text')}</p>
      </header>
      <main className="seller">
        {number ? (
          <>
            <section className="poster" aria-label={t('poster.title')}>
              <p className="poster-brand">{t('app.name')}</p>
              <h2>{shop.name}</h2>
              {shop.place && <p>{shop.place}</p>}
              <QrCode text={whatsappUrl(number, t('poster.ask'))} label={t('poster.scan')} />
              <p className="poster-scan">{t('poster.scan')}</p>
              <p>{t('poster.how')}</p>
              {shop.hours && <p className="poster-hours">{shop.hours}</p>}
            </section>
            <button type="button" className="primary wide no-print" onClick={() => window.print()}>
              🖨️ {t('poster.print')}
            </button>
          </>
        ) : (
          <p className="errors" role="alert">
            {t('vendor.needWhatsapp')}
          </p>
        )}
      </main>
    </>
  );
}
