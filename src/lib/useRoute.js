import { useEffect, useState } from 'react';

/** `#/` home, `#/s/<code>` a shop, `#/my-shop` the vendor's screen */
export function parseHash(hash) {
  const path = hash.replace(/^#\/?/, '');
  if (path.startsWith('s/')) return { view: 'shop', code: path.slice(2) };
  if (path === 'my-shop') return { view: 'vendor' };
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
