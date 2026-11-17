import useStored from './useStored';
import { emptyShop } from './shop';
import { MY_SHOP_KEY } from './keys';

/** The seller's own shop, saved on their phone: { shop, set(patch), setItems(change) } */
export default function useMyShop() {
  const [stored, setStored] = useStored(MY_SHOP_KEY, emptyShop());
  return {
    shop: { ...emptyShop(), ...stored },
    set: (patch) => setStored((s) => ({ ...emptyShop(), ...s, ...patch })),
    setItems: (change) => setStored((s) => ({ ...emptyShop(), ...s, items: change(s.items ?? []) })),
  };
}
