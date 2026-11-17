/**
 * Reads text aloud with the phone's own voice (nothing is sent anywhere).
 * Marathi falls back to a Hindi voice, which reads Devanagari well enough.
 */
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

const pickVoice = (lang) => {
  const voices = window.speechSynthesis.getVoices();
  const wanted = lang === 'mr' ? ['mr', 'hi'] : ['en-IN', 'en'];
  for (const prefix of wanted) {
    const voice = voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(prefix.toLowerCase()));
    if (voice) return voice;
  }
  return null;
};

export function speak(text, lang, onEnd) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? (lang === 'mr' ? 'mr-IN' : 'en-IN');
  utterance.rate = 0.9;
  utterance.onend = onEnd;
  utterance.onerror = onEnd;
  synth.speak(utterance);
}

export const stopSpeaking = () => window.speechSynthesis.cancel();

/** "Tomato, 30 rupees a kilo. ..." for the items on sale, specials first */
export function ratesSpeech(shop, items, { t, name }) {
  const onSale = items.filter((item) => item.inStock);
  const ordered = [...onSale.filter((item) => item.special), ...onSale.filter((item) => !item.special)];
  return [
    `${shop.name}. ${t('shop.today')}.`,
    ...ordered.map((item) => t('listen.line', { name: name(item), price: item.price, unit: t(`item.per.${item.unit}`) })),
  ].join(' ');
}
