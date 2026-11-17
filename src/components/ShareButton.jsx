import { useState } from 'react';
import useLang from '../lib/useLang';

/** Opens the phone's share sheet, or copies the link where there is none */
export default function ShareButton({ url, title, label, className = 'ghost', copyOnly = false }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      if (!copyOnly && navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Cancelled, or sharing is blocked: nothing to do
    }
  };

  return (
    <button type="button" className={className} onClick={onClick}>
      {copied ? `✓ ${t('share.copied')}` : label}
    </button>
  );
}
