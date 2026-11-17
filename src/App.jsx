import { useEffect, useMemo } from 'react';
import LanguageProvider from './components/LanguageProvider';
import HomeView from './components/HomeView';
import ShopView from './components/ShopView';
import VendorView from './components/VendorView';
import BadLink from './components/BadLink';
import useRoute from './lib/useRoute';
import { decodeShop } from './lib/shop';
import { read } from './lib/storage';
import { MY_SHOP_KEY } from './lib/keys';

function Views() {
  const { view, code, page } = useRoute();
  const shop = useMemo(() => (view === 'shop' ? decodeShop(code) : null), [view, code]);

  // A seller who opens the app plainly lands on their own shop
  useEffect(() => {
    if (window.location.hash === '' && read(MY_SHOP_KEY, null)?.setupDone) window.location.hash = '#/my-shop';
  }, []);

  if (view === 'vendor') return <VendorView page={page} />;
  if (view === 'shop') return shop ? <ShopView key={code} shop={shop} code={code} /> : <BadLink />;
  return <HomeView />;
}

export default function App() {
  return (
    <LanguageProvider>
      <Views />
    </LanguageProvider>
  );
}
