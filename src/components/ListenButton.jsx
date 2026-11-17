import { useEffect, useState } from 'react';
import useLang from '../lib/useLang';
import { canSpeak, ratesSpeech, speak, stopSpeaking } from '../lib/speak';

/** Reads today's rates aloud, for customers who would rather listen than read */
export default function ListenButton({ shop, items }) {
  const lang = useLang();
  const [speaking, setSpeaking] = useState(false);

  // Never keep talking after the shop page is left
  useEffect(() => () => canSpeak() && stopSpeaking(), []);

  if (!canSpeak()) return null;
  const onClick = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(ratesSpeech(shop, items, lang), lang.lang, () => setSpeaking(false));
  };
  return (
    <button type="button" className="listen" aria-pressed={speaking} onClick={onClick}>
      {speaking ? `⏹ ${lang.t('listen.stop')}` : `🔊 ${lang.t('listen.start')}`}
    </button>
  );
}
