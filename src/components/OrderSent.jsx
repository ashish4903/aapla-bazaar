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

      <div className="card next">
        <h3>{t('sent.next')}</h3>
        <ol className="steps">
          <li>{t('sent.step1')}</li>
          <li>{t('sent.step2')}</li>
          <li>{t('sent.step3', { amount: rupees(amount) })}</li>
        </ol>
      </div>

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
