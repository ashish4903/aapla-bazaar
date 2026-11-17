import useLang from '../lib/useLang';
import useInstall from '../lib/useInstall';

/** Shown only where the browser can put the app on the home screen */
export default function InstallButton({ className = 'hero-button' }) {
  const { t } = useLang();
  const { canInstall, install } = useInstall();
  if (!canInstall) return null;
  return (
    <button type="button" className={className} onClick={install}>
      📲 {t('install.button')}
    </button>
  );
}
