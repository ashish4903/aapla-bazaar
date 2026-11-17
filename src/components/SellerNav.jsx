import useLang from '../lib/useLang';

const TABS = [
  { page: 'today', href: '#/my-shop', icon: '🗓️' },
  { page: 'items', href: '#/my-shop/items', icon: '🥕' },
  { page: 'edit', href: '#/my-shop/edit', icon: '🏪' },
];

export default function SellerNav({ page }) {
  const { t } = useLang();
  return (
    <nav className="seller-nav" aria-label={t('vendor.title')}>
      {TABS.map((tab) => (
        <a key={tab.page} href={tab.href} aria-current={tab.page === page ? 'page' : undefined}>
          <span aria-hidden="true">{tab.icon}</span>
          {t(`nav.${tab.page}`)}
        </a>
      ))}
    </nav>
  );
}
