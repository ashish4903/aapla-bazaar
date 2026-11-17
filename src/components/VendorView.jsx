import SellerSetup from './SellerSetup';
import SellerToday from './SellerToday';
import SellerItems from './SellerItems';
import SellerEdit from './SellerEdit';
import SellerNav from './SellerNav';
import useMyShop from '../lib/useMyShop';

const SCREENS = { today: SellerToday, items: SellerItems, edit: SellerEdit };

/** The seller's side: a short setup once, then Today / Items / Shop */
export default function VendorView({ page }) {
  const my = useMyShop();
  if (!my.shop.setupDone) return <SellerSetup {...my} />;
  const Screen = SCREENS[page] ?? SellerToday;
  return (
    <>
      <Screen {...my} />
      <SellerNav page={page} />
    </>
  );
}
