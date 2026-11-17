import { useState } from 'react';
import useLang from '../lib/useLang';
import { CATALOGUE, CATEGORIES } from '../lib/catalogue';

/** Tap to add produce from the catalogue, or type a name that is not in it */
export default function AddItems({ taken, onAdd, onAddCustom }) {
  const { t, name } = useLang();
  const [query, setQuery] = useState('');
  const typed = query.trim();
  const q = typed.toLowerCase();

  const free = CATALOGUE.filter(
    (item) =>
      !taken.has(item.id) && (!q || item.name.mr.toLowerCase().includes(q) || item.name.en.toLowerCase().includes(q)),
  );
  const exact = CATALOGUE.some((item) => item.name.mr === typed || item.name.en.toLowerCase() === q);

  return (
    <div className="add-items">
      <input
        type="search"
        className="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`🔍 ${t('vendor.addSearch')}`}
        aria-label={t('vendor.addSearch')}
      />

      {typed && !exact && (
        <button
          type="button"
          className="chip custom"
          onClick={() => {
            onAddCustom(typed.slice(0, 40));
            setQuery('');
          }}
        >
          + {t('vendor.addCustom', { name: typed })}
        </button>
      )}

      {CATEGORIES.map((cat) => {
        const group = free.filter((item) => item.cat === cat);
        if (group.length === 0) return null;
        return (
          <div key={cat} className="add-group">
            <h3>{t(`cat.${cat}`)}</h3>
            <div className="chips wrap">
              {group.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="chip"
                  aria-label={t('vendor.addLabel', { name: name(item) })}
                  onClick={() => onAdd(item)}
                >
                  <span aria-hidden="true">{item.icon}</span> {name(item)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
