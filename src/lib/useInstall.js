import { useEffect, useState } from 'react';

/**
 * "Add to phone". The browser offers this once, early, so the offer is caught
 * here as soon as the app loads and kept until a button asks for it.
 */
let offer = null;
const listeners = new Set();
const tell = () => listeners.forEach((listener) => listener(offer));

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    offer = e;
    tell();
  });
  window.addEventListener('appinstalled', () => {
    offer = null;
    tell();
  });
}

/** { canInstall, install() } */
export default function useInstall() {
  const [current, setCurrent] = useState(offer);
  useEffect(() => {
    listeners.add(setCurrent);
    return () => listeners.delete(setCurrent);
  }, []);
  return {
    canInstall: current !== null,
    install: async () => {
      if (!offer) return;
      await offer.prompt();
      offer = null;
      tell();
    },
  };
}
