import { useMemo } from 'react';
import LanguageProvider from './components/LanguageProvider';
import HomeView from './components/HomeView';
import ShopView from './components/ShopView';
import VendorView from './components/VendorView';
import BadLink from './components/BadLink';
import useRoute from './lib/useRoute';
import { decodeShop } from './lib/shop';

function Views() {
  const { view, code } = useRoute();
  const shop = useMemo(() => (view === 'shop' ? decodeShop(code) : null), [view, code]);

  if (view === 'vendor') return <VendorView />;
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
