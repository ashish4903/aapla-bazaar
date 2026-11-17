import { useEffect } from 'react';
import useLang from '../lib/useLang';

/** A panel that slides up from the bottom; closes on ✕, the backdrop or Escape */
export default function Sheet({ labelledBy, onClose, children }) {
  const { t } = useLang();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('has-sheet');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('has-sheet');
    };
  }, [onClose]);

  return (
    <div className="sheet-wrap">
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <button type="button" className="sheet-close" aria-label={t('sheet.close')} onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
