import { useEffect, useState } from 'react';

/**
 * `#/` home, `#/s/<code>` a shop, and the seller's screens:
 * `#/my-shop` today, `#/my-shop/items`, `#/my-shop/edit`
 */
export function parseHash(hash) {
  const path = hash.replace(/^#\/?/, '');
  if (path.startsWith('s/')) return { view: 'shop', code: path.slice(2) };
  if (path === 'my-shop') return { view: 'vendor', page: 'today' };
  if (path === 'my-shop/items') return { view: 'vendor', page: 'items' };
  if (path === 'my-shop/edit') return { view: 'vendor', page: 'edit' };
  return { view: 'home' };
}

export default function useRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      document.documentElement.scrollTop = 0;
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return parseHash(hash);
}
