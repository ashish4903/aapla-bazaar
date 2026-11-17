import { useState } from 'react';
import useLang from '../lib/useLang';

/** Removes the shop from this phone, after asking once more */
export default function DeleteShop({ onDelete }) {
  const { t } = useLang();
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <button type="button" className="danger-link" onClick={() => setAsking(true)}>
        {t('delete.button')}
      </button>
    );
  }
  return (
    <section className="card" role="alertdialog" aria-label={t('delete.button')}>
      <p>{t('delete.sure')}</p>
      <div className="after-share">
        <button type="button" className="ghost danger" onClick={onDelete}>
          {t('delete.yes')}
        </button>
        <button type="button" className="ghost" onClick={() => setAsking(false)}>
          {t('delete.no')}
        </button>
      </div>
    </section>
  );
}
