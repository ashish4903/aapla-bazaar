import useLang from '../lib/useLang';
import { rupees } from '../lib/order';
import { upiUrl } from '../lib/shop';

export default function OrderSent({ shop, amount, onBack }) {
  const { t } = useLang();
  return (
    <section className="sent" aria-labelledby="sent-title">
      <span className="sent-mark" aria-hidden="true">
        ✓
      </span>
      <h2 id="sent-title">{t('sent.title')}</h2>
      <p>{t('sent.text')}</p>

      {shop.upi && amount > 0 && (
        <>
          <a className="primary wide" href={upiUrl(shop, amount)}>
            {t('sent.upi', { amount: rupees(amount) })}
          </a>
          <p className="private-note">{t('sent.upiNote')}</p>
        </>
      )}

      <button type="button" className="ghost wide" onClick={onBack}>
        ← {t('sent.back')}
      </button>
    </section>
  );
}
