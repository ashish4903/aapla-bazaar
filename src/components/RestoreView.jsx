import { useMemo } from 'react';
import TopBar from './TopBar';
import BadLink from './BadLink';
import useLang from '../lib/useLang';
import { decodeBackup } from '../lib/shop';
import { read, write } from '../lib/storage';
import { MY_SHOP_KEY } from '../lib/keys';

/** A backup link opened on a new phone: asks first, then saves the shop here */
export default function RestoreView({ code }) {
  const { t } = useLang();
  const incoming = useMemo(() => decodeBackup(code), [code]);
  if (!incoming) return <BadLink />;

  const existing = read(MY_SHOP_KEY, null);
  const onConfirm = () => {
    write(MY_SHOP_KEY, { ...incoming, setupDone: true });
    window.location.hash = '#/my-shop';
  };

  return (
    <>
      <header className="hero">
        <TopBar />
        <h1>{t('restore.title')}</h1>
        <p className="hero-text">{t('restore.text', { name: incoming.name, n: incoming.items.length })}</p>
      </header>
      <main>
        {existing?.setupDone && (
          <p className="notice" role="status">
            {t('restore.replace', { name: existing.name })}
          </p>
        )}
        <button type="button" className="primary wide" onClick={onConfirm}>
          {t('restore.confirm')}
        </button>
        <a className="ghost wide" href="#/">
          {t('delete.no')}
        </a>
      </main>
    </>
  );
}
